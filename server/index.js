/*
**************************GENERAL INFO**************************

Server is designed to be a CORS-server
That means that headers will not be exposed unless you says so.
define them by setting "access-control-expose-headers" down below

*/

//imports
const express = require('express');
const bodyParser = require('body-parser');
const {
	User
} = require('./user/user.js');
const config = require('./config/config.js');
//cli inputs
// var argv = process.argv.splice(2);

//init express
const app = express();

//instructing body-parser to use json encoding.
app.use(bodyParser.json());

// Add headers
app.use(function(req, res, next) {

	// Website you wish to allow to connect
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

	// Request methods you wish to allow
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

	// Request headers you wish to allow client to see.
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,');
	// Set to true if you need the website to include cookies in the requests sent

  //headers you wish to expose in your response:
  res.setHeader('access-control-expose-headers', 'auth');

	// to the API (e.g. in case you use sessions)
	res.setHeader('Access-Control-Allow-Credentials', true);

	// Pass to next layer of middleware
	next();
});

//setting port
let port = process.env.PORT = 3000;
let bool = false;

//CONNECTION TO DB//CONNECTION TO DB//CONNECTION TO DB//CONNECTION TO DB
const session = require('./db/db.js')(app, config.instructions).catch((e) => {
	console.error(e);
	res.status(404).end();
});

//DB-API//DB-API//DB-API//DB-API//DB-API//DB-API//DB-API
const _DB_ = require('./user/userdb.js')(session);
console.log(`Logging out:  ${_DB_}`);
//DB-API//DB-API//DB-API//DB-API//DB-API//DB-API//DB-API

/*
 *******************************************************************************
 *******************************************************************************
 **                   **          ROUTING          **                         **
 ***********************           -_O_-           *****************************
 *******************************************************************************
 */





app.post('/login', (req, res) => {
	User.getUserPayload(req)
		.then(User.crypt)
		.then(_DB_.getCredentials)
    .then(User.checkPassword)
    .then((package) => {
        console.log('Password correct? ' + ` ${package.auth}`);
        if(!package.auth){
          res.status(404).send({ auth: false });
        }else{
          //sending old token now. what is happening.
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('auth', package.token);
          let parsed = JSON.parse(JSON.stringify({
            auth: true,
            token: package.token
          }));

          res.status(200).send(parsed);
        }
    })
    .catch((e) => {
        console.log(e);
        res.status(404).send({ auth: false });
		})
});

app.get('/auth', (req, res) => {});


app.post('/create', (req, res) => {

	var creds = {};
	creds.secure = {}

	User.getUserPayload(req)
		.then(User.crypt)
		.then(User.tokenize)
    .then(_DB_.save)
    .then((creds) => {
      if(creds.hasOwnProperty('err')) throw Error(creds);
      res.status(200)
      //setting token for transfer
      let parsed = JSON.parse(JSON.stringify({
        token: creds.token
      }));
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('auth', creds.token);
      // res.setHeader('auth', creds.token);
      console.log(`All done! \n `);
      res.send(parsed);
    })
		.catch((e) => {
      console.log(`error in async handling chain \n`)
      console.log(e);
      res.end();
		})
})

app.listen(port, () => {
	console.log('server alive');
});
