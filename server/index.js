/*
**************************GENERAL INFO**************************

Server is designed to be a CORS-server
That means that headers will not be exposed unless you says so.
define them by setting "access-control-expose-headers" down below

*/
const express = require('express');
const bodyParser = require('body-parser');
const {
	User
} = require('./user/user.js');
const config = require('./config/config.js');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();
const img = '.././src/img';

//instructing body-parser to use json encoding.
app.use(bodyParser.json(), (req, res, next) => {
	console.log(`Someone is requesting ${req.url}`);
	next();
});

// Add headers
app.use(function(req, res, next) {

	// Website you wish to allow to connect
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

	// Request methods you wish to allow
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

	// Request headers you wish to allow client to see.
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,auth');
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
const { authenticate } = require('./middleware/auth.js');
console.log(`DB IS:  ${_DB_}`);
//DB-API//DB-API//DB-API//DB-API//DB-API//DB-API//DB-API

//uploading middleware
var upload = multer({
	dest: 'src/'
});
//
/*
 *******************************************************************************
 *******************************************************************************
 **                   **          ROUTING          **                         **
 ***********************           -_O_-           *****************************
 *******************************************************************************
 */

app.get('/home', authenticate, (req, res) => {
	//homepage
	let token;
	if ((token = req.get('token')) !== '') {
		console.log(`token got!: ${token}`)
	}
});

app.get('/textposts', authenticate, (req, res) => {
	console.log(`User ${req._USER_} made a request`);

	_DB_.getPosts({user: req._USER_})
		.then((resp, err) => {
			res.status(200)
			//setting token for transfer
			let parsed = JSON.parse(JSON.stringify({
				_post_id: resp
			}));
			res.setHeader('Content-Type', 'application/json');
			// res.setHeader('auth', creds.token);
			// res.setHeader('auth', creds.token);
			console.log(`Text Post All done! \n `);
			res.send(parsed);
			}).catch((e) => {
			console.error(e);
			res.status(500).end();
		})

});

app.put('/updatetext', authenticate, (req,res) => {
	var obj;
	try{
		obj = {
			id: req.body.id.toString(),
			text: req.body.texts.toString(),
		}
	}catch(e){
		console.error(e);
		res.status(400).send('No update info was sent!');
	}
	_DB_.updatePosts(obj)
		.then((resp) => {
			console.log('success');
			res.status(200).end();
		}).catch((e) => {
			console.error(e);
			res.status(500).end();
		})


});

app.delete('/deleteText/:id', authenticate, (req,res) => {
	console.log(req.params.id);
	_DB_.deletePosts(req.params.id)
		.then((resp, err) => {
			console.log(resp);
			res.status(200).send(JSON.stringify({success:true, status:200}));
		}).catch((e) => {
			res.status(404).send(JSON.stringify({success:false, status:404, msg: 'Contact sysadmin'}));
			console.error(e);
		})
});

app.post('/posttext', authenticate, (req, res) => {
	//kolla hur foreign keys fungerar
	//om man kan utnyttja det på något sätt.
	//fixa id foreign key. 1. hämta
	console.log('inside posttext');
	console.log(req.body);

	User.getUserTextPayload(req)
		.then(_DB_.postText)
		.then((_id_) => {
			// if(creds.hasOwnProperty('err')) throw Error(creds);
			res.status(200)
			//setting token for transfer
			let parsed = JSON.parse(JSON.stringify({
				_post_id: _id_
			}));
			res.setHeader('Content-Type', 'application/json');
			// res.setHeader('auth', creds.token);
			// res.setHeader('auth', creds.token);
			console.log(`Text Post All done! \n `);
			res.send(parsed);
		})
		.catch((e) => {
			console.log(`error in async handling chain \n`)
			console.log(e);
			res.end();
		})

});

app.delete('/album', authenticate, (req, res) => {
	//posta bilder
});

app.post('/foto', authenticate, upload.single(`/foto`), (req, res) => {
	console.log(`\n\n File META DATA \n\n${req.file}`);
	try {
		res.send(req.file);
	} catch (err) {
		res.send(400);
	}
})
app.delete('/foto', authenticate, (req, res) => {
	//posta bilder
	fs.unlink(path, (err) => {
		if (err) {
			console.error(err)
			return
		}

		//file removed
	})
})


app.post('/login', (req, res) => {
	User.getUserPayload(req)
		.then(User.crypt)
		.then(_DB_.getCredentials)
		.then(User.checkPassword)
		.then((package) => {
			console.log('Password correct? ' + ` ${package.auth}`);
			if (!package.auth) {
				res.status(404).send({
					auth: false
				});
			} else {
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
			res.status(404).send({
				auth: false
			});
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
			// if(creds.hasOwnProperty('err')) throw Error(creds);
			res.status(200)
			//setting token for transfer
			let parsed = JSON.parse(JSON.stringify({
				username: creds.user,
				token: creds.token,
				_id: creds._id,
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
