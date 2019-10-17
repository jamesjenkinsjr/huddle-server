const PortalService = require('../portal/portal-service');

function checkProtectedPortal(req, res, next) {
  const db = req.app.get('db');
  const token = req.get('Authorization') || '';
  const bearerToken = token.slice(7);
  
  PortalService.getPortalByID(db, req.params.id)
    .then(portal => {
      const publicPortal = { ...portal };
      delete publicPortal.password;

      if(portal.use_password) {
        try {
          const payload = PortalService.verifyJWT(bearerToken);
          PortalService.getPortalByID(db, payload.id)
            .then(portal => {
              if(!portal) {
                return res.status(401).json({error: 'Unauthorized portal request'});
              }
              res.portal = publicPortal;
              next();
            })
            .catch(next);
        } catch(error) {
          return res.status(401).json({error: 'Unauthorized portal request'});
        }
      } else {
        res.portal = publicPortal;
        next();
      }
    })

}

module.exports = checkProtectedPortal;