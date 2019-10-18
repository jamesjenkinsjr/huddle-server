const express = require('express');
const path = require('path');
const MessageService = require('./message-service');
const checkProtectedPortal = require('../middleware/jwt-auth');
const xss = require('xss');

const messageRouter = express.Router();

const sanitizeMessage = message => {
  return {
    ...message,
    content: xss(message.content),
    author: xss(message.author)
  };
};

messageRouter
  .route('/')
  .all(express.json())
  .all(checkProtectedPortal)
  .post((req, res, next) => {
    const db = req.app.get('db');
    const { content, author, portal_id } = req.body;

    if (!content || !author || !portal_id) {
      return res
        .status(400)
        .json({ error: 'content, author, and portal_id are required' });
    }

    const newMessage = {
      content,
      author,
      portal_id
    };

    sanitizeMessage(newMessage);

    return req.app
      .get('db')
      .select('*')
      .from('portal')
      .where('id', '=', portal_id)
      .then(portal => {
        if (!portal) {
          return res.status(400).json({ error: 'invalid portal_id' });
        }
        MessageService.addMessage(db, newMessage).then(message => {
          res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${message.id}`))
            .json(sanitizeMessage(message));
        });
      })
      .catch(next);
  });
messageRouter
  .route('/:message_id')
  .all((req, res, next) => {
    const db = req.app.get('db');
    const id = req.params.message_id;

    MessageService.getMessageByID(db, id)
      .then(message => {
        if (!message) {
          return res.status(400).json({ error: 'invalid id' });
        }
        res.message = sanitizeMessage(message);
        next();
      })
      .catch(next);
  })
  .all(checkProtectedPortal)
  .get((req, res, next) => {
    return res.status(200).json(res.message);
  });

module.exports = messageRouter;
