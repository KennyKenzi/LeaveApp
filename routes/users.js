var express = require('express');
var router = express.Router();
var User = require('../models/user')
var jwt = require('jsonwebtoken')
var leavedata = require('../config/leavedata')
var Leave = require('../models/leave')
const auth = require('../middleware/auth')

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


        const sortstatus =(stats)=>{

            if (stats.isApproved=== true){
                status = leavedata.status.approve
            }else if(stats.isApproved === false){
                status = leavedata.status.reject
            }else{
                status = leavedata.status.nothing
            }
            return status
        }



/* GET users listing. */
router.get('/users', auth.auth, async function(req, res, next) {


         const token = req.session.token
         const decoded = jwt.verify(token, 'thisismynewcourse')
         const user = await User.findOne({_id: decoded._id, 'tokens.token': token})

         const allLeaves= await Leave.find({staffID: user.staffID})

         //using custom function above
        const sort = sortdata(allLeaves)
        

        
        const subordinates = await User.find({superStaffID: user.staffID})
        const allsubordinates = []
        for (var i = 0; i<subordinates.length; i++){
            
            
            const currSubLeave = await Leave.find({staffID: subordinates[i].staffID})
                currSubLeave.forEach(element => {
                    const obj = {
                        sub : subordinates[i],
                        stID : subordinates[i].staffID,
                        leave : element
                    }
                    allsubordinates.push(obj)
                });
       }
       
       console.log(allLeaves)
       

        res.render('auth/userpage', {

        user: user,
        leavedata: leavedata.data,
        annual: leavedata.data.annual - sort.annual,
        casual: leavedata.data.casual- sort.casual,
        maternity: leavedata.data.maternity - sort.maternity,
        allLeaves: allLeaves,
        allsubordinates: allsubordinates
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
    console.log ('here',uidata)

    if(uidata+parseInt(req.body.noOfDays) <= leavedata.data[req.body.leaveType]){

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



router.post('/approval', async (req, res, next)=>{


    
    if(req.body.reject === undefined){

        await Leave.findByIdAndUpdate({_id : req.body.ID},  {isApproved: "Approved"}) 
        await Leave.findByIdAndUpdate({_id : req.body.ID},  {statusUpdated: true})

    }else {
        await Leave.findByIdAndUpdate({_id : req.body.ID},  {isApproved: "Rejected"})
        await Leave.findByIdAndUpdate({_id : req.body.ID},  {statusUpdated: true})
    }

    const foo = await Leave.findById(req.body.ID)
    console.log(foo)
    //console.log()
    //console.log(req.session)
    res.redirect('/users')
})

module.exports = router;
