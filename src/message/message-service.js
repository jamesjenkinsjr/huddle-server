const MessageService = {
  getMessageByID: (db, id) => {
    return db('message')
      .select('*')
      .where({ id })
      .first()
  },
  addMessage: (db, data) => {
    return db('message')
      .insert(data)
      .returning('*')
      .then(messages => messages[0])
      .then(message => {
        return MessageService.getMessageByID(db, message.id)
      })
  },
}

module.exports = MessageService
