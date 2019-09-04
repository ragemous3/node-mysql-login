/*
// process.exit(1);  To exit with a 'failure' code:

  *********************************
*/


//imports
const express = require('express');
const bodyParser = require('body-parser');
const { User } = require('./user/user.js');
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


app.post('/create', async (req, res) => {
  //Everything under the await statement is synchronous in its block;
  var credentials = await User.getUserPayload(req); //Synchronous

  if (credentials !== false) {

    var bool = tablepromise.then(async (table, err) => {

      if (!err) {
        credentials.secure = {};
        credentials.secure.hash = await User.crypt(credentials.pw);
        credentials.secure.token = await User.tokenize(credentials.user);

        Promise.all([credentials.secure.hash, credentials.secure.token]).then((val) => {
          console.log(`INSIDE IT ${val}`);
          table.insert(['user', 'password', 'token'])
            .values(credentials.user, credentials.secure.hash, credentials.secure.token)
            .execute()
            .then((resp, callb) => {
                if(!callb){
                  res.status(200)
                  res.set({
                    'Content-Type': 'text/plain',
                    'auth': credentials.secure.token,
                  })
                  res.send();
                }
            })
            .catch((e) => {
              console.log(e);
              if(e.info.code == 1062) {
                console.error('Duplicate Entry');
                res.status(400).send('Bad request, duplicate entry');
              }else {
                console.log(e);
                console.error(`Error getting all that you want baby ${e}`);
                res.status(400).end('Bad Request'); //Bad request status so far.
              }
            });
            
        }).catch((e ) => {
          console.log('error');
        })

        // if(credentials.secure.hash == false || credentials.secure.token == false){
        //   console.log('Aborted table insertion');
        //   res.status(500).end();
        //   return;
        // }

      }
    }).catch((e) => {
      console.error(e);
    });
  }else {
    res.status(400).end();
    // process.exit(1);
  }
});

app.listen(port, () => {
  console.log('server alive');
});
