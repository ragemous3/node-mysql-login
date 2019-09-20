
const { User } = require('.././user/user.js');

  //syftet med jwt är att validera den i servern och inte göra en DB-request.
  const authenticate = function(req,res,next) {
    console.log(req.header('auth'));
    var token = req.header('auth');

    User.verify(token).then((resp) => {
      console.log(`Verifier promise response ${resp}`);
        if(!resp){
          res.status(401).end();
          //401 unat
        }

        req._USER_ = resp.user;

        if(resp.user){
          next();
          console.log('inside');
        }else{
          res.status(403).send('Unauthorized');
        }

    }).catch((e) => {
      console.log(e);
      res.status(500).send('internal server error');
    })

  }

module.exports = { authenticate }
