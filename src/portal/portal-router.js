const express = require('express');
const PortalService = require('./portal-service');

const portalRouter = express.Router();

portalRouter
  .route('/')
  .post(express.json(), (req, res, next) => {
    const db = req.app.get('db');
    PortalService.addPortal(db)
      .then(() => {
        res.status(201).end();
        next();
      })
      .catch(next);
  });

portalRouter
  .route('/:id')
  .all((req, res, next) => {
    const db = req.app.get('db');
    PortalService.getPortalByID(db, req.params.id)
      .then(portal => {
        if(!portal) {
          return res.status(404).json({error:  'Invalid portal id!'});
        }
        res.portal = portal;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    return res.json(res.portal);
  });


module.exports = portalRouter;