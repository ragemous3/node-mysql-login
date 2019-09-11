  const mysql = require('@mysql/xdevapi');
  /*


The X DevAPI lets you use MySQL as a NoSQL
JSON Document Store where you do go schema->collection->JSON-document
or as a traditional SQL database where you go schema->table ->data.
And yes you can combine collections and table.

  */
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
  	}).catch((e) => {
      console.error(`Unable to connect to MYSQL-server \n ${e}`);
    })

  	// if (access == 'usertable') {
  	// 	return session.then(async (sesh) => {
  	// 		var list = sesh.getSchemas(); //getting relevant schemas
    //
  	// 		return results = await list.then((data, err) => {
    //
  	// 			if (!err) {
  	// 				var myDBObj = data[4] v.getTable('users');
  	// 				return myDBObj;
  	// 			} else {
  	// 				res.status(400).end();
  	// 			}
    //
  	// 		}).catch(e => {
  	// 			console.log(e);
  	// 		})
    //
  	// 	}).catch((e) => {
  	// 		console.log(e);
  	// 	});
  	// 	return;
  	// }
  }
