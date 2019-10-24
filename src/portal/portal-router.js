const express = require('express')
const PortalService = require('./portal-service')
const portalRouter = express.Router()
const path = require('path')
const bcryptjs = require('bcryptjs')
const checkProtectedPortal = require('../middleware/jwt-auth')
const xss = require('xss')
const validator = require('validator')

const sanitizePortal = portal => {
  return {
    ...portal,
    name: xss(portal.name),
  }
}

const sanitizeMessage = message => {
  return {
    ...message,
    content: xss(message.content),
    author: xss(message.author),
  }
}

portalRouter.route('/').post(express.json(), (req, res, next) => {
  const db = req.app.get('db')
  const {
    name,
    expiry_timestamp = null,
    use_password = false,
    password = null,
  } = req.body
  const newPortal = { name, expiry_timestamp, use_password, password }
  sanitizePortal(newPortal)
  const currentDatetime = new Date()
  const expiryToDatetime = new Date(expiry_timestamp)
  if (!name) {
    return res.status(400).json({ error: 'Portal name is required' })
  }

  if (!expiry_timestamp) {
    return res.status(400).json({ error: 'Expiry is required' })
  }

  if (expiry_timestamp !== null && expiryToDatetime <= currentDatetime) {
    return res.status(400).json({ error: 'expiry_timestamp is invalid' })
  }

  if (use_password && (!password || password.length === 0)) {
    return res.status(400).json({ error: 'Invalid password' })
  } else if (use_password) {
    newPortal.password = bcryptjs.hashSync(password, 6)
  }

  PortalService.addPortal(db, newPortal)
    .then(portal => {
      return res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${portal.id}`))
        .json(sanitizePortal(portal))
    })
    .catch(next)
})

portalRouter
  .route('/:portal_id/auth')
  .post(express.json(), (req, res, next) => {
    const db = req.app.get('db')
    const id = req.params.portal_id
    const { password } = req.body

    if (!password) {
      return res.status(400).json({ error: 'Password is required' })
    }

    if (!validator.isUUID(id)) {
      return res.status(400).json({ error: 'Invalid Portal ID' })
    }
    db('portal')
      .select('*')
      .where({ id })
      .first()
      .then(portal => {
        if (!portal) {
          return res.status(400).json({ error: 'Invalid portal id' })
        }
        const cleanPortal = sanitizePortal(portal)
        return PortalService.comparePasswordWithToken(
          password,
          cleanPortal.password
        )
          .then(valid => {
            if (!valid) {
              return res.status(400).json({ error: 'Invalid password' })
            }
            return res.status(200).json({
              portalAuth: PortalService.createJWT(cleanPortal.name, {
                id: portal.id,
              }),
            })
          })
          .catch(next)
      })
  })

portalRouter
  .route('/:portal_id')
  .all((req, res, next) => {
    const db = req.app.get('db')

    if (!validator.isUUID(req.params.portal_id)) {
      return res.status(400).json({ error: 'Invalid Portal ID' })
    }

    PortalService.getPortalByID(db, req.params.portal_id)
      .then(portal => {
        if (!portal) {
          return res.status(400).json({ error: 'Invalid Portal ID' })
        }
        next()
      })
      .catch(next)
  })
  .all(checkProtectedPortal)
  .get((req, res, next) => {
    const db = req.app.get('db')
    const currentDatetime = new Date()
    if (res.portal.expiry_timestamp < currentDatetime) {
      PortalService.deletePortal(db, req.params.id)
        .then(() => {
          return res.status(400).json({ error: 'Invalid portal id!' })
        })
        .catch(next)
    }

    return res.json(sanitizePortal(res.portal))
  })

portalRouter
  .route('/:portal_id/messages')
  .all(checkProtectedPortal)
  .get((req, res, next) => {
    const db = req.app.get('db')

    if (!validator.isUUID(req.params.portal_id)) {
      return res.status(404).json({ error: 'Invalid id' })
    }

    PortalService.getMessagesForPortal(db, req.params.portal_id)
      .then(messages => {
        if (!messages) {
          return res.status(404).json({ error: 'No messages were found' })
        }
        return res
          .status(200)
          .json(messages.map(message => sanitizeMessage(message)))
      })
      .catch(next)
  })

module.exports = portalRouter
