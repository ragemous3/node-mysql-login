const bcrypt = require('bcryptjs');
const path = require('path');
const jwt = require('jsonwebtoken');


const User = {
  privkey: 'auth', //this should be a .pem-crypt-file

  getUserPayload(req){
    return new Promise((resolve, reject, err) => {
    var user;
    var pw;
      if(req.body.payload){
        var user = req.body.payload.user;
        var pw = req.body.payload.pw;
        resolve({
          user: user,
          pw: pw
        });
      }else{
        reject(false);
      }
    }).catch((e) => {
        console.log(`An error was caught! ${e}`);
    });
  },

  crypt(password) {    //returns a hash-promise to be inserted into DB.


    //the more rounds of salt the saltier the salt
    const saltRounds = 10;
    try{
      return bcrypt.genSalt(saltRounds, function(err, salt) {
        if (err) {
          throw new Error;
        }
        //salt          //generated saltrounds //
        return bcrypt.hash(password, salt, function(err, hash) {
          if (err) {
            throw new Error('Password hash went wrong');
          }else {
            console.log("\x1b[32m", "HashMaking was a success \n");
            console.log("\x1b[37m", hash);
            return hash;
          }

        })
      });
    }catch(e){
      console.error(`The crypting went wrong at user.crypt! ${e}`);
      return false;
    }
  },

  decrypt(password, hash) {
    //GET hash from DB and send it here. It returns true if password correct;
    try{
      //response is true if password is correct;
      return bcrypt.compare(password, hash, function(err, bool) {
          if(err){
            throw new Error();
          }else{
            return bool;
          }
      });
    }catch(e){
      console.error(`Password incorrect! ${e}`);
      return false;
    }
  },

  tokenize(user) {

    //in this case im using username as a token but could aswell use something
    //faster as a small id-hash with many combinations.
    try{

      return jwt.sign({user: user.toString(16)}, this.privkey,
        function(err, token) {
            if(err){
              throw new Error();
            }
          console.log('User just created a token');
          console.log(token);
          return token;
      })

    }catch(e){
      console.error(`Signing of Jwt went wrong! ${e}`);
      return false;
    }

  },

  verify(token){
    //return decoded user-token ((username)) or an error;
    return jwt.verify(token, this.privkey, function(err, decoded) {
      if(err){
        throw new Error();
      }
      console.log(decoded.user) // bar
      return decoded
    }).catch((e) => {
      console.log(e);
    });
  }

}
module.exports = { User };
