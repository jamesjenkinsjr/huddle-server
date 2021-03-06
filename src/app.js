require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const knex = require('knex')
const portalRouter = require('./portal/portal-router')
const messageRouter = require('./message/message-router')

const app = express()
const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
})

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common'

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())
app.set('db', db)

app.get('/', (req, res) => {
  return res.json('Hello, world!')
})

// error handler
app.use((error, req, res, next) => {
  let response
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    console.error(error)
    response = { message: error.message, error }
  }
  return res.status(500).json(response)
})

app.use('/api/portal', portalRouter)
app.use('/api/message', messageRouter)

module.exports = app
