const path = require('path') // has path and __dirname
const express = require('express')
const oauthServer = require('../oauth/server.js')

const router = express.Router() // Instantiate a new router

const filePath = path.join(__dirname, '../public/oauthAuthenticate.html')

router.get('/', (req,res) => {  // send back a simple form for the oauth
  res.sendFile(filePath)
})


router.post('/authorize', (req,res,next) => {
  const {username, password} = req.body
  if(username === 'username' && password === 'password') {
    req.body.user = {user: 1}
    return next()
  }
  const params = [ // Send params back down
    'client_secret',
    'redirect_uri',
    'response_type',
    'grant_type',
    'state',
  ]
    .map(a => `${a}=${req.body[a]}`)
    .join('&')
  return res.redirect(`/oauth?success=false&${params}`)
}, (req,res, next) => { // sends us to our redirect with an authorization code in our url
  return next()
}, oauthServer.authorize({
  authenticateHandler: {
    handle: req => {
      return req.body.user
    }
  }
}))

router.post('/token', (req,res,next) => {
  next()
},oauthServer.token({
  requireClientAuthentication: { // whether client needs to provide client_secret
    // 'authorization_code': false,
  },
}))  // Sends back token


module.exports = router
