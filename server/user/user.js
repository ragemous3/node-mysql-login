const bcrypt = require('bcryptjs');
const path = require('path');
const jwt = require('jsonwebtoken');


const User = {
	privkey: 'auth', //this should be a .pem-crypt-file

	getUserTextPayload(req){
		return new Promise((resolve, reject, err) => {
			var user;
			var pw;
			var payload = req.body;

			if (payload) {
				var user = payload.username;
				var text = payload.text;

				resolve({
					user: user,
					text: text
				});

			} else {
				reject(false);
			}
		}).catch((e) => {
			console.log(`An error was caught! ${e}`);
			return e;
		});
	},

	getUserPayload(req) {
		return new Promise((resolve, reject, err) => {
			var user;
			var pw;
			var payload = req.body;

			if (payload) {
				var user = payload.username;
				var pw = payload.password;

				resolve({
					user: user,
					pw: pw
				});
			} else {
				reject(false);
			}
		}).catch((e) => {
			console.log(`An error was caught! ${e}`);
			return e;
		});
	},

	crypt(obj) { //returns a hash-promise to be inserted into DB.
		//the more rounds of salt the saltier the salt
		return new Promise((resolve, reject, err) => {
			const saltRounds = 10;
			bcrypt.genSalt(saltRounds, function(error, salt) {
				if (err || error) {
					reject(`${err} \n ${error}`);
				}
				bcrypt.hash(obj.pw, salt, function(error3, hash) {
					if (error3) {
						reject(error3)
					} else {
						console.log("\x1b[32m", "HashMaking was a success \n");
						console.log("\x1b[37m", hash);
						obj.hash = hash;
						resolve(obj);
					}
				})
			})
		}).catch((e) => {
			console.log(e);
		})
	},

	checkPassword(obj) {
		console.log('...checking password');
		//GET hash from DB and send it here. It returns true if password correct;
		return new Promise((resolve, reject, err) => {

			//response is true if password is correct;
			 bcrypt.compare(obj.password, obj.hash, function(err, bool) {
					if (err) {
						reject('error!')
					}else{
						obj.auth = bool;
						resolve(obj);
					}
				});

		}).catch((e) => {
			console.error(`Password incorrect! ${e}`);
			obj.auth = false;
			return obj;
		})
	},

	tokenize(obj) {

		return new Promise((resolve, reject, error) => {
			//privkey should be a .pem file-content
			jwt.sign({
					user: obj.user
				}, 'auth',
				function(err, token) {
					if (err) {
						reject(`${error} \n ${err}`)
					}
					console.log('User just created a token');
					obj.token = token;
					console.log(obj);
					resolve(obj);
				})
		}).catch((e) => {
			console.log(e);
		})
	},

	verify(token) {
		//return decoded user-token ((username)) or an error;
		console.log('Verifying token...');
		return new Promise((resolve, reject, error) => {

				return jwt.verify(token, 'auth', function(err, resp) {
					console.log(err);
					console.log(resp)
					if (err) {
						reject(err);
					}
					resolve(resp);
				}).catch((e) => {
					console.log(e);
				});

		}).catch((e) => {
				console.error('Error inside token veryfier');
		})
	}

}
module.exports = {
	User
};
