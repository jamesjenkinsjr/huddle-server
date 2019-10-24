const knex = require('knex')
const app = require('../src/app')
const testHelpers = require('./test-helpers')

describe('Portal Endpoints', () => {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('kill db connection', () => db.destroy())

  before('clean tables', () => testHelpers.truncateTables(db))
  afterEach('clean tables', () => testHelpers.truncateTables(db))

  describe('Given tables have data', () => {
    const testPortals = testHelpers.portalArray
    const testMessages = testHelpers.messagesArray

    beforeEach('add table data', () => testHelpers.seedTables(db))

    it('POST / inserts a new portal', () => {
      const newPortal = {
        name: 'New Portal',
        expiry_timestamp: '2100-10-23T13:41:46.000Z',
      }

      return supertest(app)
        .post('/api/portal')
        .send(newPortal)
        .expect(201)
        .expect(res => {
          expect(res.headers.location).to.eql(`/api/portal/${res.body.id}`)
          expect(res.body.name).to.eql(newPortal.name)
          expect(res.body.expiry_timestamp).to.eql(newPortal.expiry_timestamp)
        })
    })

    it('POST / fails with 400 error when no portal name provided', () => {
      const badPortal = {}

      return supertest(app)
        .post('/api/portal')
        .send(badPortal)
        .expect(400, { error: 'Portal name is required' })
    })

    it('POST / fails with 400 error when use_password true but no password', () => {
      const expiry_timestamp = new Date().setDate(new Date().getDate() + 2)
      const badPortal = {
        name: 'some portal',
        use_password: true,
        expiry_timestamp,
      }

      return supertest(app)
        .post('/api/portal')
        .send(badPortal)
        .expect(400, { error: 'Invalid password' })
    })

    it('POST / fails with 400 error when use_password true but invalid password', () => {
      const expiry_timestamp = new Date().setDate(new Date().getDate() + 2)
      const badPortal = {
        name: 'some portal',
        use_password: true,
        password: '',
        expiry_timestamp,
      }

      return supertest(app)
        .post('/api/portal')
        .send(badPortal)
        .expect(400, { error: 'Invalid password' })
    })

    it('POST / fails with 400 error when expiry_timestamp is not in the future', () => {
      const badPortal = {
        name: 'some portal',
        expiry_timestamp: '2019-10-23T13:41:46.000Z',
      }

      return supertest(app)
        .post('/api/portal')
        .send(badPortal)
        .expect(400, { error: 'expiry_timestamp is invalid' })
    })

    it('POST /:portal_id/auth returns JWT when valid password provided', () => {
      const validPassword = {
        password: 'password',
      }

      return supertest(app)
        .post('/api/portal/7f3d81aa-d8df-43d5-bfb1-453ba9a04093/auth')
        .send(validPassword)
        .expect(200)
        .expect(res => {
          expect(res.body).to.have.property('portalAuth')
          expect(res.body.portalAuth).to.have.lengthOf(187)
        })
    })

    it('POST /:portal_id/auth fails when no password provided', () => {
      return supertest(app)
        .post('/api/portal/7f3d81aa-d8df-43d5-bfb1-453ba9a04093/auth')
        .expect(400, { error: 'Password is required' })
    })

    it('POST /:portal_id/auth fails when invalid portal_id', () => {
      return supertest(app)
        .post('/api/portal/123/auth')
        .send({ password: 'password' })
        .expect(400, { error: 'Invalid Portal ID' })
    })

    it('POST /:portal_id/auth fails when invalid password', () => {
      return supertest(app)
        .post('/api/portal/7f3d81aa-d8df-43d5-bfb1-453ba9a04093/auth')
        .send({ password: 'invalid' })
        .expect(400, { error: 'Invalid password' })
    })

    context('Portal is not gated with password', () => {
      const cleanPortal = { ...testPortals[0] }
      const messages = testMessages.filter(
        message => message.portal_id === testPortals[0].id
      )
      delete cleanPortal.password

      it('GET /:portal_id returns expected response', () => {
        return supertest(app)
          .get('/api/portal/a7580f03-d358-4f3f-a5f8-6b69ba02d83a')
          .expect(200)
          .expect(res => {
            expect(res.body).to.eql(cleanPortal)
          })
      })

      it('GET /:portal_id fails with expected error when id invalid', () => {
        return supertest(app)
          .get('/api/portal/123')
          .expect(400, { error: 'Invalid Portal ID' })
      })

      it('GET /:portal_id/messages returns expected response', () => {
        return supertest(app)
          .get('/api/portal/a7580f03-d358-4f3f-a5f8-6b69ba02d83a/messages')
          .expect(200)
          .expect(res => {
            expect(testHelpers.removeMessageIDs(res.body)).to.eql(messages)
          })
      })

      it('GET /:portal_id/messages fails with expected error when portal ID does not exist', () => {
        return supertest(app)
          .get('/api/portal/03c0f5f6-8a8c-4e21-af31-fe55ca899538/messages')
          .expect(400, { error: 'Invalid Portal ID' })
      })
    })
    context('Portal is gated and is authorized', () => {
      const cleanPortal = { ...testPortals[1] }
      const messages = testMessages.filter(
        message => message.portal_id === testPortals[1].id
      )
      delete cleanPortal.password

      it('GET /:portal_id returns expected response', () => {
        return supertest(app)
          .get('/api/portal/7f3d81aa-d8df-43d5-bfb1-453ba9a04093')
          .set(
            'Authorization',
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdmM2Q4MWFhLWQ4ZGYtNDNkNS1iZmIxLTQ1M2JhOWEwNDA5MyIsImlhdCI6MTU3MTg1NTc4OSwic3ViIjoicG9ydGFsIDIifQ.7HEJRS8CvDB2YpAQ8KpETQoOubnbxFIMLTOBEsMaVvI'
          )
          .expect(200)
          .expect(res => {
            expect(res.body).to.eql(cleanPortal)
          })
      })

      it('GET /:portal_id fails with expected error when unauthorized', () => {
        return supertest(app)
          .get('/api/portal/7f3d81aa-d8df-43d5-bfb1-453ba9a04093')
          .set('Authorization', 'Bearer bad-token')
          .expect(401, { error: 'Unauthorized portal request' })
      })

      it('GET /:portal_id/messages returns expected response', () => {
        return supertest(app)
          .get('/api/portal/7f3d81aa-d8df-43d5-bfb1-453ba9a04093/messages')
          .set(
            'Authorization',
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdmM2Q4MWFhLWQ4ZGYtNDNkNS1iZmIxLTQ1M2JhOWEwNDA5MyIsImlhdCI6MTU3MTg1NTc4OSwic3ViIjoicG9ydGFsIDIifQ.7HEJRS8CvDB2YpAQ8KpETQoOubnbxFIMLTOBEsMaVvI'
          )
          .expect(200)
          .expect(res => {
            expect(testHelpers.removeMessageIDs(res.body)).to.eql(messages)
          })
      })

      it('GET /:portal_id/messages fails with expected error when portal ID does not exist', () => {
        return supertest(app)
          .get('/api/portal/7f3d81aa-d8df-43d5-bfb1-453ba9a04093/messages')
          .set('Authorization', 'Bearer bad-token')
          .expect(401, { error: 'Unauthorized portal request' })
      })
    })
  })
})
