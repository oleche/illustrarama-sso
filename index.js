const express = require('express')

const app = express()
const port = 3030
const bodyParser = require('body-parser')
const oauthServer = require('./oauth/server.js')

const mongoose = require('mongoose');
let database = require('./config/database');
const databaseTest = require('./config/database-test');

if (process.env.NODE_ENV !== undefined && process.env.NODE_ENV === 'test') {
  database = databaseTest;
}

const uristring = database.url;

mongoose.Promise = global.Promise;

// Makes connection asynchronously. Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(uristring, function (err, res) {
  if (err) {
    console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log ('Succeeded connected to: ' + uristring);
  }
});

app.use((req, res, next) => {
  res.locals.mongoose = mongoose;
  next();
});

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//app.use('/client', require('./routes/client.js')) // Client routes
app.use('/oauth', require('./routes/auth.js')) // routes to access the auth stuff
// Note that the next router uses middleware. That protects all routes within this middleware
app.use('/secure', require('./routes/secure.js')) // routes to access the protected stuff
//app.use('/', (req,res) => res.redirect('/client'))


app.listen(port)
console.log("Oauth Server listening on port ", port)

module.exports = app // For testing
