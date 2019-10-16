const express = require('express');
const PortalService = require('./portal-service');
const portalRouter = express.Router();
const path = require('path');

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
  .route('/:id')
  .all((req, res, next) => {
    const db = req.app.get('db');
    const password = req.headers.password || '';
    if (!validator.isUUID(req.params.id)) {
      return res.status(404).json({ error: 'Invalid id' });
    }

    PortalService.getPortalByID(db, req.params.id)
      .then(portal => {
        if (!portal) {
          return res.status(400).json({ error: 'Invalid portal id!' });
        }

        if(portal.use_password && portal.password !== password) {
          return res.status(400).json({error: 'Invalid portal id'});
        }
        res.portal = portal;
        next();
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
    } else {
      return res.json(res.portal);
    }
  });

portalRouter.route('/:id/messages').get((req, res, next) => {
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
