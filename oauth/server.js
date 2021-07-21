const OAuthServer = require('express-oauth-server')
const model = require('./model')

module.exports = new OAuthServer({
  model: model,
  grants: ['client_credentials', 'authorization_code', 'refresh_token', 'password'],
  accessTokenLifetime: 60 * 60 * 24, // 24 hours, or 1 day
  allowEmptyState: true,
  allowExtendedTokenAttributes: true,
})
