
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const crypto = require('crypto')


/**
 * Schema definitions.
 */

 mongoose.model('OAuthAuthorizationCode', new Schema({
   authorizationCode: { type: String },
   expiresAt: { type: Date },
   redirectUri: { type: String, default: '' },
   client : { type: Object },  // `client` and `user` are required in multiple places, for example `getAccessToken()`
   clientId: { type: String },
   user : { type: Object },
   userId: { type: String },
 }));

mongoose.model('OAuthTokens', new Schema({
  accessToken: { type: String },
  accessTokenExpiresAt: { type: Date },
  client : { type: Object },  // `client` and `user` are required in multiple places, for example `getAccessToken()`
  clientId: { type: String },
  refreshToken: { type: String },
  refreshTokenExpiresOn: { type: Date },
  user : { type: Object },
  userId: { type: String },
}));

var OAuthClientsModel = mongoose.model('OAuthClients', new mongoose.Schema({
  clientId: { type: String },
  clientSecret: { type: String },
  redirectUris: { type: Array },
  grants: { type: Array }
}));

mongoose.model('OAuthUsers', new Schema({
  email: { type: String, default: '' },
  firstname: { type: String },
  lastname: { type: String },
  password: { type: String },
  username: { type: String },
  client : { type: Object },  // `client` and `user` are required in multiple places, for example `getAccessToken()`
  clientId: { type: String },
  role: { type: String }
}));

var OAuthTokensModel = mongoose.model('OAuthTokens');
// var OAuthClientsModel = mongoose.model('OAuthClients');
var OAuthUsersModel = mongoose.model('OAuthUsers');
var OAuthAuthorizationCode = mongoose.model('OAuthAuthorizationCode');

/**
 * Get access token.
 */

module.exports = {
  getAccessToken: bearerToken => {
    // Adding `.lean()`, as we get a mongoose wrapper object back from `findOne(...)`, and oauth2-server complains.
    return OAuthTokensModel.findOne({ accessToken: bearerToken }).lean();
  },
  getClient: (clientId, clientSecret, cb) => {
    let query = { clientId: clientId }
    if (clientSecret !== null){
      query = { clientId: clientId, clientSecret: clientSecret }
    }
    OAuthClientsModel.findOne()
    .then((data) => {
      cb(false, data);
    });
  },
  getRefreshToken: refreshToken => {
    return OAuthTokensModel.findOne({ refreshToken: refreshToken }).lean();
  },
  getUser: (username, password) => {
    return OAuthUsersModel.findOne({ username: username, password: password }).lean();
  },
  revokeToken: (token) => {
    OAuthTokensModel.findOneAndDelete({ accessToken: token }, function (err) {
      if (err) return false;
    });
    return true;
  },
  getUserFromClient: (client) => {
    return OAuthUsersModel.findOne({ clientId: client.clientId }).lean();
  },
  revokeAuthorizationCode: authorizationCode => {
    OAuthAuthorizationCode.findOneAndDelete({ authorizationCode: authorizationCode }, function (err) {
      if (err) return false;
    });
    return true;
  },
  saveAuthorizationCode: (code, client, user) => {
    /* This is where you store the access code data into the database */
    var authorizationCode = new OAuthAuthorizationCode({
      authorizationCode: code.authorizationCode,
      expiresAt: code.expiresAt,
      client : client,
      clientId: client.clientId,
      user : user,
      userId: user._id,
    });

    return new Promise( function(resolve,reject){
      authorizationCode.save(function(err,data){
        if( err ) reject( err );
        else resolve( data );
      }) ;
    }).then(function(saveResult){
      // `saveResult` is mongoose wrapper object, not doc itself. Calling `toJSON()` returns the doc.
      saveResult = saveResult && typeof saveResult == 'object' ? saveResult.toJSON() : saveResult;

      // Unsure what else points to `saveResult` in oauth2-server, making copy to be safe
      var data = new Object();
      for( var prop in saveResult ) data[prop] = saveResult[prop];

      // /oauth-server/lib/models/token-model.js complains if missing `client` and `user`. Creating missing properties.
      data.client = data.clientId;
      data.user = data.userId;

      return data;
    });
  },
  getAuthorizationCode: authorizationCode => {
    return OAuthAuthorizationCode.findOne({ authorizationCode: authorizationCode }).lean();
  },
  generateAuthorizationCode: (client, user, scope) => {
    /*
    For this to work, you are going have to hack this a little bit:
    1. navigate to the node_modules folder
    2. find the oauth_server folder. (node_modules/express-oauth-server/node_modules/oauth2-server)
    3. open lib/handlers/authorize-handler.js
    4. Make the following change (around line 136):

    AuthorizeHandler.prototype.generateAuthorizationCode = function (client, user, scope) {
      if (this.model.generateAuthorizationCode) {
        // Replace this
        //return promisify(this.model.generateAuthorizationCode).call(this.model, client, user, scope);
        // With this
        return this.model.generateAuthorizationCode(client, user, scope)
      }
      return tokenUtil.generateRandomToken();
    };
    */

    const seed = crypto.randomBytes(256)
    const code = crypto
      .createHash('sha1')
      .update(seed)
      .digest('hex')
    return code
  },
  saveToken: (token, client, user) => {
    var accessToken = new OAuthTokensModel({
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      client : client,
      clientId: client.clientId,
      refreshToken: token.refreshToken,
      refreshTokenExpiresOn: token.refreshTokenExpiresOn,
      user : user,
      userId: user._id,
    });
    // Can't just chain `lean()` to `save()` as we did with `findOne()` elsewhere. Instead we use `Promise` to resolve the data.
    return new Promise( function(resolve,reject){
      accessToken.save(function(err,data){
        if( err ) reject( err );
        else resolve( data );
      }) ;
    }).then(function(saveResult){
      // `saveResult` is mongoose wrapper object, not doc itself. Calling `toJSON()` returns the doc.
      saveResult = saveResult && typeof saveResult == 'object' ? saveResult.toJSON() : saveResult;

      // Unsure what else points to `saveResult` in oauth2-server, making copy to be safe
      var data = new Object();
      for( var prop in saveResult ) data[prop] = saveResult[prop];

      // /oauth-server/lib/models/token-model.js complains if missing `client` and `user`. Creating missing properties.
      data.client = data.clientId;
      data.user = data.userId;

      return data;
    });
  },
  verifyScope: (token, scope) => {
    const userHasAccess = true  // return true if this user / client combo has access to this resource
    return new Promise(resolve => resolve(userHasAccess))
  }
}
