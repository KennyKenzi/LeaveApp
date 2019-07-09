var express = require('express');
var router = express.Router();
var User = require('../models/user')
const auth = require('../middleware/auth')



/* GET register page*/
  router.get('/register',auth.authadmin,(req, res, next)=>{
      res.render('auth/register');
  });
  

/* POST from register page*/
  router.post('/register', async (req, res, next)=> {
    const user = new User(req.body)
    try{
        if(req.body.isAdmin){
          user.isAdmin = true
        }
        if(req.body.password === req.body.password2){
          await user.save()
          req.flash('success_msg', `${user.firstName} ${user.lastName} is saved successfully` )
          res.redirect('/register')
        }else{
          req.flash('error_msg', `Passwords must match` )
          res.redirect('/register')
        }


      }catch(e){
        req.flash('error_msg', `Something must be wrong, check your parameters Stupid!` )
        res.status(400).redirect('/register')
        console.log(e)
    } 
  });


  /* GET login page. */
  router.get('/login', function(req, res, next) {
    res.render('auth/login', { title: 'Express' });
  });


  /* POST login page. */
    router.post('/login', async (req, res)=> {
    
    try{

      const user = await User.findByCredentials(req.body.staffID, req.body.password)
      const token = await user.generateAuthToken()
       
      req.session.token = token
      res.redirect('/users')

    }catch(e){

      req.flash('error_msg', `Login unsuccessful` )
      res.status(400).redirect('/login')
  }
    
  });


module.exports = router;
