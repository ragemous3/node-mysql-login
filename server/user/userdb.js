function getUserTable(session) {


	return session.then(async (sesh) => {
		var list = sesh.getSchemas(); //getting relevant schemas
		return results = await list.then((data, err) => {
			var myDBObj = data[4].getTable('users');
			return myDBObj;
		}).catch(e => {
			return {
				err: true,
				status: 500,
				msg: 'Unable to find user table'
			}
		})

	}).catch((e) => {
		return {
			err: true,
			status: 500,
			msg: 'Unable to find session'
		}
	});
	return;
}

function MYSQL_ERROR_HANDLER(e) {

	if (e.prototype instanceof Object) {
		if (e.hasOwnProperty('code')) {
			if (e.info.code == 1062) {
				console.error(e.info.msg);
			} else if (e.info.code == 22001) {
				console.error(e.info.msg);
			}
		} else {
			console.log(e);
			console.error(`Error getting all that you want baby ${e}`);
		}
	} else {
		console.error("\x1b[41m", '\n!wtf!\n');
		console.error("\x1b[40m", e);
		return {
			msg: e,
		};
	}
}
module.exports = (session) => {

	return {
		getCredentials(resp) {
			tablepromise = getUserTable(session).catch((e) => {
				console.log(e)
			});
			return new Promise((resolve, reject, err) => {
				tablepromise.then((users, err2) => {
          if(err2) reject();
					users.select('user', 'password', 'token')
						.where(`user like :param`)
						.orderBy('user')
						.bind(`param`, `${resp.user}%`)
						.execute((row, eRR) => {
							let user = row[0];

              //Somehow i get a lot of empty blanks in the end?
              //Maybe has to do with char(96)?
              let hash = row[1].trim();
              let token = row[2]

  							resolve({
  								user: user,
                  password: resp.pw,
                  hash: hash,
                  token: token,
  							});

						}).then((mysql) => {
              if((mysql.getAffectedRowsCount()) == 0){
                // reject('No User Found');
                throw new Error('No User Found');
              }else{
                return;
              }
            }).catch((e) => {
              reject(e);
            })
				})
			}).catch((e) => {
        throw new Error(e);
      });
		},

		save(creds) {
			console.log('inside lvl-1');
			tablepromise = getUserTable(session);

			return tablepromise.then((table, err) => {
				console.log('inside lvl-2');

				if (table.hasOwnProperty('err')) return table;

				console.log('inside lvl-3');

				if (creds.hash !== false || creds.token !== false) {
					console.log('inside lvl-4');

					return table.insert(['user', 'password', 'token'])
						.values(creds.user, creds.hash,
							creds.token)
						.execute()
						.then((responseOBJ) => {
							console.log(`Inside final call: ${responseOBJ}`);
							//Initiating table-promise.
							console.log(`Initializing and storing hash and token`);
							// console.log(Buffer.byteLength(creds.hash, 'utf8') + " bytes stored");
							return creds;
						})
						.catch((e) => {
							MYSQL_ERROR_HANDLER(e)
						});
				}
			}).catch((e) => {
				MYSQL_ERROR_HANDLER(e);
			});

		},
	}
}
