const validator = require('validator')
const PortalService = require('../portal/portal-service')

function checkProtectedPortal(req, res, next) {
  const db = req.app.get('db')
  let id
  // Conditional to gate all requests for messages or portals
  // and ensure no matter the request type that a valid portal
  // id can be used to authorize the data of a protected portal

  if (req.params && req.params.portal_id) {
    id = req.params.portal_id || ''
  } else if (req.body && req.body.portal_id) {
    id = req.body.portal_id || ''
  } else if (res.message) {
    id = res.message.portal_id || ''
  } else {
    id = ''
  }
  const token = req.get('Authorization') || ''
  const bearerToken = token.slice(7)

  if (!id || !validator.isUUID(id)) {
    return res.status(400).json({ error: 'Invalid Portal ID' })
  }

  PortalService.getPortalByID(db, id).then(portal => {
    const publicPortal = { ...portal }
    delete publicPortal.password
    if (!portal) {
      return res.status(400).json({ error: 'Invalid Portal ID' })
    }
    if (portal.use_password) {
      try {
        const payload = PortalService.verifyJWT(bearerToken)
        PortalService.getPortalByID(db, payload.id)
          .then(portal => {
            if (!portal) {
              return res
                .status(401)
                .json({ error: 'Unauthorized portal request' })
            }
            if (publicPortal.id !== payload.id) {
              return res
                .status(401)
                .json({ error: 'Unauthorized portal request' })
            }
            res.portal = publicPortal
            next()
          })
          .catch(next)
      } catch (error) {
        return res.status(401).json({ error: 'Unauthorized portal request' })
      }
    } else {
      res.portal = publicPortal
      next()
    }
  })
}

module.exports = checkProtectedPortal
