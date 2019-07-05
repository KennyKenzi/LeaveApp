var express = require('express');
var router = express.Router();
var User = require('../models/user')
var jwt = require('jsonwebtoken')

/* GET users listing. */
router.get('/users', async function(req, res, next) {


         const token = req.session.token
         const decoded = jwt.verify(token, 'thisismynewcourse')
         const user = await User.findOne({_id: decoded._id, 'tokens.token': token})

    res.render('auth/userpage', {
        firstName: user.firstName,
        lastName: user.lastName,
        //token
    })
    
    //console.log('here'+ req.session)
    console.log('here',req.session)
});

module.exports = router;
