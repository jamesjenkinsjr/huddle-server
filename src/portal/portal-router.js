const express = require('express');
const PortalService = require('./portal-service');
const portalRouter = express.Router();
const path = require('path');

const validator = require('validator');

portalRouter.route('/').post(express.json(), (req, res, next) => {
  const db = req.app.get('db');
  const { name } = req.body;
  const newPortal = { name }
  if(!name) {
    return res.status(400).json({error: 'Portal name is required'});
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
    if (!validator.isUUID(req.params.id)) {
      return res.status(404).json({ error: 'Invalid id' });
    }

    PortalService.getPortalByID(db, req.params.id)
      .then(portal => {
        if (!portal) {
          return res.status(404).json({ error: 'Invalid portal id!' });
        }
        res.portal = portal;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    return res.json(res.portal);
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
