const knex = require('knex')
const app = require('../src/app')
const testHelpers = require('./test-helpers')

describe('Message endpoints', () => {
  let db

  before('create db', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })

    app.set('db', db)
  })

  after('kill db connection', () => db.destroy())
  before('clean db tables', () => testHelpers.truncateTables(db))
  afterEach('clean db tables', () => testHelpers.truncateTables(db))

  context('Tables have data', () => {
    beforeEach('seed tables with data', () => testHelpers.seedTables(db))
    context('Portal is not protected with password', () => {
      it('POST / creates expected message', () => {
        const newMessage = {
          author: 'tester',
          content: 'This is some new content',
          portal_id: 'a7580f03-d358-4f3f-a5f8-6b69ba02d83a',
        }

        return supertest(app)
          .post('/api/message')
          .send(newMessage)
          .expect(201)
          .expect(res => {
            expect(res.headers.location).to.eql(`/api/message/${res.body.id}`)
            expect(res.body).to.include({ ...newMessage, id: 5 })
          })
      })

      it('POST / fails when no portal_id provided', () => {
        const badMessage = {}

        return supertest(app)
          .post('/api/message')
          .send(badMessage)
          .expect(400, { error: 'Invalid Portal ID' })
      })

      it('POST / fails when no author provided', () => {
        const badMessage = {
          portal_id: 'a7580f03-d358-4f3f-a5f8-6b69ba02d83a',
          content: 'some content',
        }

        return supertest(app)
          .post('/api/message')
          .send(badMessage)
          .expect(400, { error: 'content, author, and portal_id are required' })
      })
      it('POST / fails when no content provided', () => {
        const badMessage = {
          author: 'Test',
          portal_id: 'a7580f03-d358-4f3f-a5f8-6b69ba02d83a',
        }

        return supertest(app)
          .post('/api/message')
          .send(badMessage)
          .expect(400, { error: 'content, author, and portal_id are required' })
      })
      it('POST / fails when invalid portal_id provided', () => {
        const badMessage = { portal_id: 'a7580f03-d358-4f3f-a5f8-6b69ba02d83' }

        return supertest(app)
          .post('/api/message')
          .send(badMessage)
          .expect(400, { error: 'Invalid Portal ID' })
      })

      it('GET /:message_id returns expected response and data', () => {
        const testMessage = testHelpers.messagesArray[0]

        return supertest(app)
          .get('/api/message/1')
          .expect(200)
          .expect(res => {
            expect(res.body).to.eql({ ...testMessage, id: 1 })
          })
      })

      it('GET /:message_id returns 400 and expected error when invalid', () => {
        return supertest(app)
          .get('/api/message/12')
          .expect(400, { error: 'invalid id' })
      })
    })

    context('Portal is protected with password', () => {
      context('Requests are authorized', () => {
        it('POST / creates expected message', () => {
          const newMessage = {
            author: 'tester',
            content: 'This is some new content',
            portal_id: '7f3d81aa-d8df-43d5-bfb1-453ba9a04093',
          }

          return supertest(app)
            .post('/api/message')
            .set(
              'Authorization',
              'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdmM2Q4MWFhLWQ4ZGYtNDNkNS1iZmIxLTQ1M2JhOWEwNDA5MyIsImlhdCI6MTU3MTg1NTc4OSwic3ViIjoicG9ydGFsIDIifQ.7HEJRS8CvDB2YpAQ8KpETQoOubnbxFIMLTOBEsMaVvI'
            )
            .send(newMessage)
            .expect(201)
            .expect(res => {
              expect(res.headers.location).to.eql(`/api/message/${res.body.id}`)
              expect(res.body).to.include({ ...newMessage, id: 5 })
            })
        })

        it('POST / returns 400 and expected error when not authorized', () => {
          const newMessage = {
            author: 'tester',
            content: 'This is some new content',
            portal_id: '7f3d81aa-d8df-43d5-bfb1-453ba9a04093',
          }

          return supertest(app)
            .post('/api/message')
            .set('Authorization', 'Bearer foo-not-good')
            .send(newMessage)
            .expect(401, { error: 'Unauthorized portal request' })
        })

        it('GET /:message_id returns expected response and data', () => {
          const testMessage = testHelpers.messagesArray[2]

          return supertest(app)
            .get('/api/message/3')
            .set(
              'Authorization',
              'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdmM2Q4MWFhLWQ4ZGYtNDNkNS1iZmIxLTQ1M2JhOWEwNDA5MyIsImlhdCI6MTU3MTg1NTc4OSwic3ViIjoicG9ydGFsIDIifQ.7HEJRS8CvDB2YpAQ8KpETQoOubnbxFIMLTOBEsMaVvI'
            )
            .expect(200)
            .expect(res => {
              expect(res.body).to.eql({ ...testMessage, id: 3 })
            })
        })

        it('GET /:message_id returns 401 and expected error when not authorized', () => {
          const testMessage = testHelpers.messagesArray[2]

          return supertest(app)
            .get('/api/message/3')
            .set('Authorization', 'Bearer bad-token')
            .expect(401, { error: 'Unauthorized portal request' })
        })
      })
    })
  })
  // context('Tables do not have data')
})
