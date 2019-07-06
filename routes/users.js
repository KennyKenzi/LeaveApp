var express = require('express');
var router = express.Router();
var User = require('../models/user')
var jwt = require('jsonwebtoken')
var leavedata = require('../config/leavedata')
var Leave = require('../models/leave')

       //to sort leave data by types and no of days         
        const sortdata = (lvs)=>{
            let data= {
                annual: 0,
                casual: 0,
                maternity: 0
            }
            lvs.forEach(element => {

                if (element.leaveType === 'annual'){
                    data.annual += element.noOfDays
                }else if(element.leaveType === 'casual'){
                    data.casual += element.noOfDays
                }else if(element.leaveType === 'maternity'){
                    data.maternity += element.noOfDays
                }
            });
            return data

        }





/* GET users listing. */
router.get('/users', async function(req, res, next) {


         const token = req.session.token
         const decoded = jwt.verify(token, 'thisismynewcourse')
         const user = await User.findOne({_id: decoded._id, 'tokens.token': token})

         const allleaves= await Leave.find({staffID: user.staffID})

         //using custom function above
        const sort = sortdata(allleaves)
 
    res.render('auth/userpage', {
        firstName: user.firstName,
        lastName: user.lastName,
        leavedata: leavedata,
        annual: leavedata.annual - sort.annual,
        casual: leavedata.casual- sort.casual,
        maternity: leavedata.maternity - sort.maternity
    })
   // console.log('counts=>',sort)
     
  
});



router.post('/users', async (req, res, next)=>{


    const token = req.session.token
    const decoded = jwt.verify(token, 'thisismynewcourse')
    const user = await User.findOne({_id: decoded._id, 'tokens.token': token})
    
    
    const allLeaves= await Leave.find({staffID: user.staffID})

    const sortedLeaves = sortdata(allLeaves)
    const uidata = sortedLeaves[req.body.leaveType] //3
    // get config value 5
    console.log ('here',req.body.noOfDays)

    if(uidata+parseInt(req.body.noOfDays) <= leavedata[req.body.leaveType]){
        const leave = new Leave(req.body)
        try{
            leave.staffID = user.staffID
    
            await leave.save()
            req.flash('success_msg', `${req.body.noOfDays} days leave has been applied for` )
            res.redirect('/users')
        }catch(e){
            res.send('Data not saved')
            console.log(e)
        }
    
    }else if(req.body.leaveType === 'no select'){
        
        req.flash('error_msg', 'Please, Select a leave type' )
        res.redirect('/users')

    }else if(req.body.noOfDays === ""){
        req.flash('error_msg', 'You seem to be missing some parameters FOOL!!')
        res.redirect('/users')

    }else{
       req.flash('error_msg', 'READ FOOL!! not enough days left' )
       res.redirect('/users')
    }
   
})

module.exports = router;
