var express = require('express');
var router = express.Router();
var User = require('../models/user')
var jwt = require('jsonwebtoken')
var leavedata = require('../config/leavedata')
var Leave = require('../models/leave')
const auth = require('../middleware/auth')
var moment = require('moment');

    //to sort leave data by types and no of days     

    const sortdata = (lvs)=>{

        let data= {
            annual: 0,
            casual: 0,
            maternity: 0
        }
        lvs.forEach(element => {

            if (element.leaveType === 'annual' && (element.isApproved === 'Pending' || element.isApproved === 'Approved')){
                        data.annual += element.noOfDays
            }else if(element.leaveType === 'casual'&& (element.isApproved === 'Pending' || element.isApproved === 'Approved')){
                        data.casual += element.noOfDays
            }else if(element.leaveType === 'maternity' && (element.isApproved === 'Pending' || element.isApproved === 'Approved')){
                        data.maternity += element.noOfDays
            }
        });

        return data

    }
    const sortDate =(start, end)=>{

        var diffDays

        //change format of date to replace -
        const startD = new Date(start.toString().split('-').join(',') + " "+ "13:24:00")
        const endD = new Date(end.toString().split('-').join(',') + " "+ "13:24:00")

        //check to see if end date is before start date
        if(endD < startD){
            diffDays = -1

        }else{
            const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
            diffDays = Math.round(Math.abs((endD - startD) / oneDay));

            var iWeeks, iAdjust = 0;
            
            var iWeekday1 = startD.getDay(); // day of week
            var iWeekday2 = endD.getDay();
            iWeekday1 = (iWeekday1 == 0) ? 7 : iWeekday1; // change Sunday from 0 to 7
            iWeekday2 = (iWeekday2 == 0) ? 7 : iWeekday2;
            if ((iWeekday1 > 5) && (iWeekday2 > 5)) iAdjust = 1; // adjustment if both days on weekend
            iWeekday1 = (iWeekday1 > 5) ? 5 : iWeekday1; // only count weekdays
            iWeekday2 = (iWeekday2 > 5) ? 5 : iWeekday2;
        
            // calculate differnece in weeks (1000mS * 60sec * 60min * 24hrs * 7 days = 604800000)
            iWeeks = Math.floor((endD.getTime() - startD.getTime()) / 604800000)
        
            if (iWeekday1 <= iWeekday2) {
            diffDays = (iWeeks * 5) + (iWeekday2 - iWeekday1)
            } else {
            diffDays = ((iWeeks + 1) * 5) - (iWeekday1 - iWeekday2)
            }
        
            diffDays -= iAdjust // take into account both days on weekend
            
        }

        return {diffDays, startD, endD}
    }


    const sortstatus =(stats)=>{
            var status
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

        const user = req.user
        const allLeaves= await Leave.find({staffID: user.staffID})

        
        //using custom function above
        const sort = sortdata(allLeaves)
        var AllLeaveArray =[]

        //editing leaves to have a edited startDate for the UI
        allLeaves.forEach((el)=>{
            AllLeaveArray.push({
                isApproved: el.isApproved,
                _id: el._id,
                leaveType: el.leaveType,
                startDate: el.startDate,
                startDateEdit: moment(el.startDate).format('MMM Do, YYYY'),
                endDate: el.endDate,
                noOfDays: el.noOfDays,
                createdAt: el.createdAt,
                staffID: el.staffID,
            })

        })


        const subordinates = await User.find({superStaffID: user.staffID})
        const allStaff = await User.find()
        const allsubordinates = []
        for (var i = 0; i<subordinates.length; i++){
    
            const currSubLeave = await Leave.find({staffID: subordinates[i].staffID})
                currSubLeave.forEach(element => {
                    const obj = {
                        sub : subordinates[i],
                        stID : subordinates[i].staffID,
                        leave : element,
                        leaveDate: moment(element.startDate).format('MMM Do, YYYY'),
                    }
                    allsubordinates.push(obj)
                });
       }

 
        res.render('auth/userpage', {
            user: user,
            leavedata: leavedata.data,
            annual: leavedata.data.annual - sort.annual,
            casual: leavedata.data.casual- sort.casual,
            maternity: leavedata.data.maternity - sort.maternity,
            allLeaves: AllLeaveArray,
            allsubordinates: allsubordinates,
            allStaff: allStaff,
        })

        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

    });




    router.post('/users', auth.auth, async (req, res, next)=>{

        
        const token = req.token
        const decoded = jwt.verify(token, 'thisismynewcourse')
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token})
    
    
        const allLeaves= await Leave.find({staffID: user.staffID})

        const sortedLeaves = sortdata(allLeaves)
        const uidata = sortedLeaves[req.body.leaveType] //3
        // get config value 5

        //sortDate and calculate days of leave
        const formatedDates = sortDate(req.body.startDate, req.body.endDate)

        req.body.startDate = formatedDates.startD
        req.body.endDate = formatedDates.endD
        
        req.body.noOfDays = formatedDates.diffDays+1

        

        if(req.body.leaveType === 'no select'){
            
            req.flash('error_msg', 'Please, Select a leave type' )
            res.redirect('/users')

        }else if(req.body.noOfDays === "" ){
            req.flash('error_msg', 'You seem to be missing some parameters FOOL!!')
            res.redirect('/users')

        }else if(req.body.noOfDays <= 0){
            req.flash('error_msg', 'Something is not possible, Are your dates correct?')
            res.redirect('/users')
        }else if(uidata+parseInt(req.body.noOfDays) <= leavedata.data[req.body.leaveType]){

           
            if(user.superStaffID === ''){
                req.body.isApproved = 'Approved'
            }else{
                
            }

            const leave = new Leave(req.body)
            try{
                leave.staffID = user.staffID  
                await leave.save()
                req.flash('success_msg', `Leave has been applied for ${req.body.noOfDays} buisiness days` )
                res.redirect('/users')
                }catch(e){
                    res.send('Data not saved')
                    console.log(e)  
                }   

        
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

        res.redirect('/users')
    })


    router.get('/user/logout', auth.auth, async (req, res, next)=>{

        try{
            req.user.tokens = req.user.tokens.filter((token)=>{
                return token.token ===[]
            })
            await req.user.save()
            
        
        }catch(e){
            res.status(500).send(e)
        }
        req.flash('success_msg', `User logged out successfully` )
        res.redirect('/')
    })


    module.exports = router;
