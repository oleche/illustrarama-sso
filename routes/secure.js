const express = require('express')
const router = express.Router() // Instantiate a new router
const oauthServer = require('../oauth/server.js')
const model = require('../oauth/model.js')

router.get('/', (req,res,next) => {
  return next();
},oauthServer.authenticate(), (req, res) => {
  var token = req.headers.authorization;
  var matches = token.match(/Bearer\s(\S+)/);

  tokenData = model.getAccessToken(matches[1]);

  tokenData.then((data) => {
    res.json({userId:data.userId, role:data.user.role});
  });
})

module.exports = router
