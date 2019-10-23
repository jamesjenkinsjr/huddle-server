const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')

const PortalService = {
  getPortalByID: (db, id) => {
    return db('portal')
      .select('*')
      .where({ id })
      .first()
  },
  addPortal: (db, data) => {
    return db('portal')
      .insert(data)
      .returning('*')
      .then(portal => portal[0])
      .then(portal => {
        return PortalService.getPortalByID(db, portal.id)
      })
  },
  getMessagesForPortal: (db, portal_id) => {
    return db('message')
      .select('*')
      .where({ portal_id })
  },
  deletePortal: (db, id) => {
    return db('portal')
      .delete()
      .where({ id })
  },
  createJWT: (subject, payload) => {
    return jwt.sign(payload, config.JWT_SECRET, {
      subject,
      algorithm: 'HS256',
    })
  },
  verifyJWT: token => {
    return jwt.verify(token, config.JWT_SECRET, {
      algorithm: 'HS256',
    })
  },
  comparePasswordWithToken: (password, token) => {
    return bcryptjs.compare(password, token)
  },
}

module.exports = PortalService
