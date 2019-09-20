  const mysql = require('@mysql/xdevapi');
  /*


The X DevAPI lets you use MySQL as a NoSQL
JSON Document Store where you do go schema->collection->JSON-document
or as a traditional SQL database where you go schema->table ->data.
And yes you can combine collections and table.

  */
  const jwt = require('jsonwebtoken');

  module.exports = (app, config) => {
  	return mysql.getSession(config.MYSQLPASS).then((session) => {
  		console.log(session.inspect());
  		return session;
  	}).catch((e) => {
      console.error(`Unable to connect to MYSQL-server \n ${e}`);
    })
  }
