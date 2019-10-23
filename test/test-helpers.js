const testHelpers = {
  portalArray: [
    {
      id: 'a7580f03-d358-4f3f-a5f8-6b69ba02d83a',
      name: 'portal 1',
      create_timestamp: '2019-10-23T13:41:46.000Z',
      expiry_timestamp: '2100-10-24T13:41:46.000Z',
      use_password: false,
      password: null,
    },
    {
      id: '7f3d81aa-d8df-43d5-bfb1-453ba9a04093',
      name: 'portal 2',
      create_timestamp: '2019-10-23T13:41:46.000Z',
      expiry_timestamp: '2100-10-24T13:41:46.000Z',
      use_password: true,
      password: '$2a$06$wXGISieZrBkW39qRdELctO3qhyFnHW2PGFXZo6xLKiz7ylx25tQvy', // password
    },
  ],
  messagesArray: [
    {
      content: 'Loren ipsum 1',
      author: 'Test',
      create_timestamp: '2019-10-23T14:41:46.000Z',
      portal_id: 'a7580f03-d358-4f3f-a5f8-6b69ba02d83a',
    },
    {
      content: 'Loren ipsum 2',
      author: 'Test',
      create_timestamp: '2019-10-23T14:43:46.000Z',
      portal_id: 'a7580f03-d358-4f3f-a5f8-6b69ba02d83a',
    },
    {
      content: 'Loren ipsum 3',
      author: 'Test',
      create_timestamp: '2019-10-23T14:42:46.000Z',
      portal_id: '7f3d81aa-d8df-43d5-bfb1-453ba9a04093',
    },
    {
      content: 'Loren ipsum 4',
      author: 'Test',
      create_timestamp: '2019-10-23T14:43:46.000Z',
      portal_id: '7f3d81aa-d8df-43d5-bfb1-453ba9a04093',
    },
  ],
  seedTables: db => {
    return db('portal')
      .insert(testHelpers.portalArray)
      .then(() => {
        return db('message').insert(testHelpers.messagesArray)
      })
  },
  truncateTables: db => {
    return db.raw(
      `TRUNCATE
        portal,
        message
        RESTART IDENTITY CASCADE`
    )
  },
  removeMessageIDs: messages =>
    messages.map(message => {
      delete message.id
      return message
    }),
}

module.exports = testHelpers
