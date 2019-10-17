const express = require('express');
const PortalService = require('./portal-service');
const portalRouter = express.Router();
const path = require('path');
const bcryptjs = require('bcryptjs');
const checkProtectedPortal = require('../middleware/jwt-auth');

const validator = require('validator');

portalRouter.route('/').post(express.json(), (req, res, next) => {
  const db = req.app.get('db');
  const {
    name,
    expiry_timestamp = null,
    use_password = false,
    password = null,
  } = req.body;
  const newPortal = { name, expiry_timestamp, use_password, password };
  const currentDatetime = new Date();
  const expiryToDatetime = new Date(expiry_timestamp);
  if (!name) {
    return res.status(400).json({ error: 'Portal name is required' });
  }

  if (expiry_timestamp !== null && expiryToDatetime <= currentDatetime) {
    return res.status(400).json({ error: 'expiry_timestamp is invalid' });
  }

  if (use_password && password.length === 0) {
    return res.status(400).json({ error: 'Invalid password' });
  }

  newPortal.password = bcryptjs.hashSync(password, 6);

  PortalService.addPortal(db, newPortal)
    .then(portal => {
      return res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${portal.id}`))
        .json(portal);
    })
    .catch(next);
});

portalRouter.route('/:portal_id/auth').post(express.json(), (req, res, next) => {
  const db = req.app.get('db');
  const id = req.params.portal_id;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  db('portal')
    .select('*')
    .where({ id })
    .first()
    .then(portal => {
      if (!portal) {
        return res.status(400).json({ error: 'Invalid portal id' });
      }
      
      return PortalService.comparePasswordWithToken(password, portal.password)
        .then(valid => {
          if (!valid) {
            return res.status(400).json({ error: 'Invalid password' });
          }
          return res
            .status(200)
            .json({
              portalAuth: PortalService.createJWT(portal.name, {
                id: portal.id,
              }),
            });
        })
        .catch(next);
    });
});

portalRouter
  .route('/:portal_id')
  .all((req, res, next) => {
    const db = req.app.get('db');

    if (!validator.isUUID(req.params.portal_id)) {
      return res.status(404).json({ error: 'Invalid id' });
    }

    PortalService.getPortalByID(db, req.params.portal_id)
      .then(portal => {
        if (!portal) {
          return res.status(400).json({ error: 'Invalid portal id!' });
        }
        next();
      })
      .catch(next);
  })
  .all(checkProtectedPortal)
  .get((req, res, next) => {
    const db = req.app.get('db');
    const currentDatetime = new Date();
    if (res.portal.expiry_timestamp < currentDatetime) {
      PortalService.deletePortal(db, req.params.id)
        .then(() => {
          return res.status(400).json({ error: 'Invalid portal id!' });
        })
        .catch(next);
    }

    return res.json(res.portal);
  });

portalRouter.route('/:portal_id/messages')
  .all(checkProtectedPortal)
  .get((req, res, next) => {
  
    const db = req.app.get('db');

    if (!validator.isUUID(req.params.portal_id)) {
      return res.status(404).json({ error: 'Invalid id' });
    }

    PortalService.getMessagesForPortal(db, req.params.portal_id)
      .then(messages => {
        if (!messages) {
          return res.status(404).json({ error: 'No messages were found' });
        }
        return res.status(200).json(messages);
      })
      .catch(next);
  });

module.exports = portalRouter;
