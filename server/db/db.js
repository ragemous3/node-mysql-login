  const mysql = require('@mysql/xdevapi');
  const jwt = require('jsonwebtoken');

  //
  //
  // var config = {
  //   host: 'localhost',
  //   user: 'root',
  //   // port: 3112,
  //   password: 'ApjPbv7nHqSajGB2389234HEJ*/.',
  //   database: 'test-mysql'
  // };

  module.exports = (app, config) => {
    return mysql.getSession(config.MYSQLPASS).then((session) => {
      console.log(session.inspect());
      return session;
    }).then(async (sesh) => {
      var list = sesh.getSchemas(); //getting relevant schemas

      return results = await list.then((data, err) => {

        if (!err) {
          var myDBObj = data[4].getTable('users');
          return myDBObj;
        } else{
          res.status(400).end();
        }

      }).catch(e => {
        console.log(e);
      })

    }).catch((e) => {
      console.log(e);
    });

  }
