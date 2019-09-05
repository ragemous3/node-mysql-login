/*
// process.exit(1);  To exit with a 'failure' code:

  *********************************
*/


//imports
const express = require('express');
const bodyParser = require('body-parser');
const {
  User
} = require('./user/user.js');
const config = require('./config/config.js');
//cli inputs
var argv = process.argv.splice(2);

//init express
const app = express();
//instructing body-parser to use json encoding.
app.use(bodyParser.json());

//setting port
let port = process.env.PORT = 3000;
let bool = false;

/*
 *******************************************************************************
 *******************************************************************************
 **    START OF FACTORIZE     **
 ***********************           -_O_-           *****************************
 *******************************************************************************
 */
// async function cryptAndToken(user, pw){
//   let secure = await Promise.all([User.crypt(pw), User.tokenize(user)]);
//   return secure;
// };

/*
 *******************************************************************************
 *******************************************************************************
 **    START OF MYSQL QUERIES **
 ***********************           -_O_-           *****************************
 *******************************************************************************
 */

/*  mysql init  */

//async connection-object for mysql "user"-table

const tablepromise = require('./db/db.js')(app, config.instructions).catch((e) => {
  console.error(e);
  res.status(404).end();
});


app.post('/login', (req, res) => {
  tablepromise.then((table) => {
    table.find(password)
  })
  // User.decrypt(password).then((
  //
  // )).catch((e) => {
  //
  // })
});
app.get('/token', (req, res) => {});
app.get('/auth', (req, res) => {});


app.post('/create', (req, res) => {
//Everything under the await statement is synchronous in its block;
var creds = {};
creds.secure = {}
User.getUserPayload(req).then(async (credentials) => {
  let hash = await User.crypt(credentials.pw);
  creds.user = credentials.user;
  creds.secure.hash = hash;
  return credentials;
}).then(async (val) => {
  let token = await User.tokenize(val.user);
  creds.secure.token = token;
  return creds;
}).then(async (val) => {
  console.log(`Wrapping up and sending ${val}`);
  return val;
}).catch((e) => {
  console.log(`error in async handling chain`)
}).finally((final) => {
    //Initiating table-promise.
    console.log(`Initializing and storing hash and token`);
    console.log("THE HASH: " + creds.secure.hash.length + " characters, " + " \n HOW MANY BYTES: \n"
    + Buffer.byteLength(creds.secure.hash, 'utf8') + " bytes");

    tablepromise.then((table, err) => {
        if (creds.secure.hash !== false || creds.secure.token !== false) {
          table.insert(['user', 'password', 'token'])
            .values(creds.user, Buffer.from(creds.secure.hash).toString('base64'),
             creds.secure.token)
            .execute()
            .then((resp, callb) => {
                res.status(200)
                res.set({
                  'Content-Type': 'text/plain',
                  'auth': creds.secure.token,
                })
                console.log(`All done! \n `);
                res.send();
            })
            .catch((e) => {
              if (e.info.code == 1062) {
                console.error(e.info.msg);
                res.status(400).send('Bad request, duplicate entry');
              }else if(e.info.code == 22001){
                console.error(e.info.msg);
                res.status(500).send('WOOPS');
              }else {
                console.log(e);
                console.error(`Error getting all that you want baby ${e}`);
                res.status(400).end('Bad Request'); //Bad request status so far.
              }
            });
        }
      }).catch((e) => {
        console.error(e);
      });
  });
});

app.listen(port, () => {
  console.log('server alive');
});
