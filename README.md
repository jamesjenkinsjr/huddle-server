# Huddle API

To access the live API endpoint, use the following URL: https://huddle-app-server.herokuapp.com/api

## Getting Started 
- Clone the repository and run `npm i`
- Create local Postgresql databases (NOTE: you will need Postgresql installed locally): `huddle` and `huddle-test` 
- Run `mv example.env .env` and provide the local database locations within your `.env` file
- Run `npm run migrate` and `npm run migrate:test` to update each database with appropriate tables
  - To seed, use terminal to enter root of application and run (NOTE: add username/password if you elected to apply these to your configuration): `psql -d huddle -f ./seeds/seed.huddle_tables.sql` 
- Run `npm run dev` to start server locally

## Description

\* = Portals with a password will require valid JWT token.

Huddle API is the Express/NodeJS server responsible for handling API requests for Huddle (https://github.com/jamesjenkinsjr/huddle).  While running, users can make the following API requests: 

### Portal

- `POST /`: Create a portal within Huddle. Possible field options include:
  - name (required): friendly name of portal
  - expiry_timestamp (required): datetime field in the future that determines portal expiry
  - use_password: boolean field defaulted to false that determines if a password is to be used 
  - password: required if use_password is true, and is a string that will be encoded and stored for gating access to portal and related portal data

- `POST /:portal_id/auth`: Endpoint used to validate the password of a gated portal. Upon success, returns a JWT token to authorize additional requests to API for a gated portal.
Possible field options include:
  - password (required): string value associated with portal_id param

- `GET /:portal_id` *: Provides public information for portal given valid id.

- `GET /:portal_id/messages` *: Returns array of messages associated with provided portal.

### Message

- `POST /` *: Post JSON message object. Fields include: 
  - author (required): string representing the creator of the message
  - content (required): string representing the contents of the message body
  - portal_id (required): UUID representing the portal to which the message is associated
  - create_timestamp: datetime defaulting to present date and time

- `GET /message_id` *: Get data associated with a specific message

## Technologies

- NodeJS
- Express
- Postgresql
