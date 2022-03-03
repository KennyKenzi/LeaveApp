var express = require('express');
var router = express.Router();
var leaveData = require('../config/leavedata');
var User = require('../models/user')

/* GET home page. */
router.get('/',  async(req, res, next)=>{

  var superAdmin = leaveData.superAdmin
  //check if superAdmin is created
  var user = await User.find({staffID: superAdmin.staffID})


  if(user.length === 0){
      const user = new User(superAdmin)
      try{
            user.isAdmin = true
            await user.save()
            req.flash('success_msg', `${user.firstName} ${user.lastName} has been created successfully` )
            res.redirect('/login')

        }catch(e){
          req.flash('error_msg', `Super User not created` )
          res.status(400).redirect('/login')
          console.log(e)
      } 

  }else{
    res.redirect('/login')
  //res.render('index', { title: 'Express' });
  }

});

module.exports = router;
