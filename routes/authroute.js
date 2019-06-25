var express = require('express');
var router = express.Router();
var User = require('../models/user')

  

/* GET login page. */
  router.get('/login', function(req, res, next) {
    res.render('auth/login', { title: 'Express' });
  });

  router.get('/register', (req, res, next)=>{
      res.render('auth/register');
  });

  router.post('/register', async (req, res, next)=> {
    const user = new User(req.body)
    try{
        if(req.body.isAdmin){
          user.isAdmin = true
        }
        await user.save()
        
        req.flash('success_msg', `${user.firstName} ${user.lastName} is saved successfully` )
        res.redirect('/register')
    }catch(e){
        res.status(400).send(e)
    } 
  });
module.exports = router;
