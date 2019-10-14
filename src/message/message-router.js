const express = require('express');
const path = require('path');
const MessageService = require('./message-service');

const messageRouter = express.Router();

messageRouter
  .route('/')
  .post(express.json(), (req, res, next) => {
    const db = req.app.get('db');
    const { content, author, portal_id } = req.body;

    const newMessage = { content, author, portal_id };
    if(!content || !author || !portal_id) {
      return res.status(400).json({error: 'content, author, and portal_id are required'});
    }

    return req.app.get('db')
      .select('*')
      .from('portal')
      .where('id', '=', portal_id)
      .then(portal => {
        if(!portal) {
          return res.status(400).json({error: 'invalid portal_id'});
        }
        MessageService.addMessage(db, newMessage)
          .then(message => {
            res.status(201).location(path.posix.join(req.originalUrl, `/${message.id}`)).json(message);
          });
      })
      .catch(next);
  });
messageRouter
  .route('/:id')
  .all((req, res, next) => {
    const db = req.app.get('db');
    const id = req.params.id;

    MessageService.getMessageByID(db, id)
      .then(message => {
        if(!message) {
          return res.status(400).json({error: 'invalid id'});
        }
        res.message = message;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    return res.status(200).json(res.message);
  });

module.exports = messageRouter;