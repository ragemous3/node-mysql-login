

const _DB_ = require('.././user/userdb.js');

  const authenticate = (req,res,next) => {
    var token = req.header('x-auth');

    _DB_.auth(token).then((resp) => {
      if(resp.auth == true){
        next();
      }else{
        res.status(403).send('Unauthorized personell');
      }

    }).catch((e) => {
      console.log(e);
      res.status(500).send('internal server error');
    })

  }

module.exports { authenticate }
