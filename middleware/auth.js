const jwt = require ('jsonwebtoken');
const User = require ('../models/user')

 
const auth = (async(req, res, next)=>{
   
    try{
        //const token = req.header('Authorization').replace('Bearer ', '')
        const token = req.session.token;
        const decoded = jwt.verify(token, 'thisismynewcourse');
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token});

        if(!user){
            throw new Error()
        }else{
                    console.log('This is a user')
                    console.log(user)
                    if(user.isAdmin){
                        console.log('User is admin')
                    }else{
                        console.log('User is not admin')
                    }
        }
      
    }catch(e){
        res.status(401).send({error: 'Auth required'})
    }
    next()
})


const checkForLeaveUsed= (async(req, res)=>{

    

})

module.exports = auth