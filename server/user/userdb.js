const {
	MYSQL_ERROR_HANDLER
} = require('./mysql.error.handler.js');


function getUserTable(session, tablename) {


	return session.then(async (sesh) => {
		var list = sesh.getSchemas(); //getting relevant schemas

		return results = await list.then((data, err) => {
			for (let i = 0; i < data.length; i++) {
				if (data[i].getName() == 'test-mysql') {
					var myDBObj = data[i].getTable(tablename);
					console.log(`returning ${myDBObj}`);
					return myDBObj;
				}
			}
		}).catch(e => {
			console.error(e);
			return e;
		})

	}).catch((e) => {
		console.error(e);
		return e;
	});
}


module.exports = (session) => {

	return {

		getCredentials(resp) {
			tablepromise = getUserTable(session, 'users').catch((e) => {
				console.log(e)
			});
			console.log(resp);
			return new Promise((resolve, reject, err) => {
				tablepromise.then((users, err2) => {
					if (err2) reject();
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
							if ((mysql.getAffectedRowsCount()) == 0) {
								// reject('No User Found');
								throw new Error('No User Found');
							} else {
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
		updatePosts(obj) {
			tablepromise = getUserTable(session, 'userdata').catch((e) => {
				console.log(e)
			});
			return new Promise((resolve, reject, error) => {
				tablepromise.then((userdata, err) => {
					userdata.update()
						.where(`iduserdata like ${obj.id}`)
						.set('text', obj.text)
						.execute((res, err) => {
							console.log(`RESPONSE ${res}`);
							resolve('An update was successfully made');
						}).then((row, err) => {
							if ((row.getAffectedRowsCount()) == 0) {
								reject('no table found for update');
							}else{
								resolve('An update was Sucessfully made');
							}
						}).catch((e) => {
							return e;
						})
				}).catch((e) => {
					return e;
				})
			}).catch((e) => {
				MYSQL_ERROR_HANDLER(e);
			})
		},
		deletePosts(id) {

			tablepromise = getUserTable(session, 'userdata').catch((e) => {
				console.log(e)
			});

			return new Promise((resolve, reject, err) => {
				tablepromise.then((userdata, err2) => {
					if (err2) reject();

					//id has to be of the form String(16,17,18);
					userdata.delete()
						.where(`iduserdata IN (${id})`)
						.execute((success, eRR) => {
							//execute runs for every table thats returning here.
							console.log(success);
							resolve(success);
						}).then((mysql) => {
							if ((mysql.getAffectedRowsCount()) == 0) {
								reject('No Deletion made');
							} else {
								return;
							}
						}).catch((e) => {
							reject(e);
						})
				}).catch((e) => {
					console.error(e);
				});

			}).catch((e) => {
				console.error(e);
			})

		},
		getPosts(data) {
			var db;
			var docs = [];
			//READ THIS
			//https://dev.mysql.com/doc/x-devapi-userguide/en/using-sql.html
			tablepromise = getUserTable(session, 'userdata').catch((e) => {
				console.log(e)
			});
			return new Promise((resolve, reject, err) => {
				tablepromise.then((users, err2) => {
					if (err2) reject();
					users.select('iduserdata', 'text', 'belongsto', 'createdon')
						.where(`belongsto like :param`)
						.orderBy('belongsto')
						.bind(`param`, data.user)
						.execute((row, eRR) => {
							//execute runs for every table thats returning here.
							docs.push({
								id: row[0],
								text: row[1],
								createdby: row[2],
							});
							resolve(docs);
						}).then((mysql) => {
							if ((mysql.getAffectedRowsCount()) == 0) {
								// reject('No User Found');
								throw new Error('No Posts made');
							} else {
								return;
							}
						}).catch((e) => {
							reject(e);
						})
				}).catch((e) => {
					console.error(e);
				});
			}).catch((e) => {
				console.error(e);
			})
		},


		postText(creds) {

			tablepromise = getUserTable(session, 'userdata').catch((e) => {
				console.log(e)
			});

			return new Promise((resolve, reject, err) => {

				return tablepromise.then((table, err) => {

					return table.insert(['text', 'belongsto'])

						.values(creds.text, creds.user)
						.execute()
						.then((responseOBJ) => {
							console.log(responseOBJ)
							if (responseOBJ.getAffectedRowsCount() <= 0) {
								reject('Nothing happend')
							}
							let id = responseOBJ.getAutoIncrementValue();
							console.log(id);
							resolve(id);
						})
						.catch((e) => {
							MYSQL_ERROR_HANDLER(e)
						});
				}).catch((e) => {
					MYSQL_ERROR_HANDLER(e);
				});
			});
		},
		getUserToken(token) {
			tablepromise = getUserTable(session, 'users').catch((e) => {
				console.log(e)
			});
			return new Promise((resolve, reject, err) => {
				tablepromise.then((users, err2) => {
					if (err2) reject();
					users.select('token')
						.where(`token like :param`)
						.orderBy('user')
						.bind(`param`, `${resp.token}%`)
						.execute((row, eRR) => {
							let token = row[0].trim();
							resolve({
								token: token,
								auth: true,
							});
						}).then((mysql) => {
							if ((mysql.getAffectedRowsCount()) == 0) {
								// reject('No User Found');
								throw new Error('No User Found');
							} else {
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
			tablepromise = getUserTable(session, 'users');

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
							creds._id = responseOBJ.getAutoIncrementValues()
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
