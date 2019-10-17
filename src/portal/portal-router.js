const express = require('express');
const PortalService = require('./portal-service');
const portalRouter = express.Router();
const path = require('path');
const bcryptjs = require('bcryptjs');

const validator = require('validator');

portalRouter.route('/').post(express.json(), (req, res, next) => {
  const db = req.app.get('db');
  const { name, expiry_timestamp = null, use_password = false, password = null } = req.body;
  const newPortal = { name, expiry_timestamp, use_password, password };
  const currentDatetime = new Date();
  const expiryToDatetime = new Date(expiry_timestamp);
  if(!name) {
    return res.status(400).json({error: 'Portal name is required'});
  }

  if(expiry_timestamp !== null && expiryToDatetime <= currentDatetime) {
    return res.status(400).json({error: 'expiry_timestamp is invalid'});
  }

  if(use_password && password.length === 0) {
    return res.status(400).json({error: 'Invalid password'});
  }

  newPortal.password = bcryptjs.hashSync(password, 6)
  
  PortalService.addPortal(db, newPortal)
    .then(portal => {
      return res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${portal.id}`))
        .json(portal);
    })
    .catch(next);
});

portalRouter
  .route('/:id/auth')
  .post(express.json(), (req, res, next) => {
    const db = req.app.get('db');
    const id = req.params.id;
    const { password } = req.body;

    if(!password) {
      return res.status(400).json({error: 'Password is required'})
    }
    db('portal')
      .select('*')
      .where({ id })
      .first()
      .then(portal => {
        if(!portal) {
          return res.status(400).json({error: 'Invalid portal id'})
        }
        return PortalService.comparePasswordWithToken(password, portal.password)
          .then(valid => {
            if(!valid) {
              return res.status(400).json({error: 'Invalid password'})
            }
            return res.status(200).json({portalAuth: PortalService.createJWT(portal.name, {id: portal.id})});
          })
          .catch(next)
      })
  })

portalRouter
  .route('/:id')
  .all((req, res, next) => {
    const db = req.app.get('db');
    const password = req.headers.password || '';

    if (!validator.isUUID(req.params.id)) {
      return res.status(404).json({ error: 'Invalid id' });
    }

    PortalService.getPortalByID(db, req.params.id)
      .then(portal => {
        const publicPortal = {...portal};
        delete publicPortal.password;

        if (!portal) {
          return res.status(400).json({ error: 'Invalid portal id!' });
        }
        console.log('password?', portal.use_password)
        if(portal.use_password) {
          PortalService.comparePasswordWithToken(password, portal.password)
            .then(valid => {
              console.log('is password valid?', valid)
              if(!valid) {
                return res.status(401).json({error: 'Unauthorized portal request'});
              }
            })
        }
        res.portal = publicPortal;
        next()
        console.log(res.portal)
      })
      .catch(next);
  })
  .get((req, res, next) => {
    const db = req.app.get('db');
    const currentDatetime = new Date();
    if(res.portal.expiry_timestamp < currentDatetime) {
      PortalService.deletePortal(db, req.params.id)
        .then(() => {
          return res.status(400).json({ error: 'Invalid portal id!'});
        })
        .catch(next);
    }

    return res.json(res.portal);
  });

portalRouter.route('/:id/messages').get((req, res, next) => {
  // todo: need to gate this request with password/token
  const db = req.app.get('db');

  if (!validator.isUUID(req.params.id)) {
    return res.status(404).json({ error: 'Invalid id' });
  }

  PortalService.getMessagesForPortal(db, req.params.id)
    .then(messages => {
      if (!messages) {
        return res.status(404).json({ error: 'No messages were found' });
      }
      return res.status(200).json(messages);
    })
    .catch(next);
});

module.exports = portalRouter;
