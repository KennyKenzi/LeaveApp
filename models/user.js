const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName:{
            type: String,
            required: true,
            trim: true
        },
        password:{
            type: String,
            required: true,
            trim: true,
            minlength: 6
        },
        staffID:{
            type: String,
            unique: true,
            required: true
        },
        superStaffID:{
            type: Number,
        },
        isAdmin:{
            type: Boolean,
            default: false
        },
        tokens:[{
            token:{
                type: String,
                required: true
            } 
    
        }]
    })

    userSchema.methods.generateAuthToken= async function (){
        const user = this
        const token = jwt.sign({ _id: user._id.toString() }, 'thisismynewcourse')
        user.tokens = user.tokens.concat({token}) //ie. shorthand for {token: token}
        await user.save()
        
        return token
    }

    userSchema.statics.findByCredentials = async (staffID, password)=>{
        const user = await User.findOne({staffID})
    
        if(!user){
            throw new Error('Unable to login')
        }
        const isMatch = await bcrypt.compare(password, user.password)
    
        if(!isMatch){
            throw new Error('Unable to login')
        }
        return user
    }
    
    //has the plaintext password before saving
    userSchema.pre('save', async function (next){
        const user = this
    
        if(user.isModified('password')){
            user.password = await bcrypt.hash(user.password, 8)
        }
    
        next()
    })



const User = mongoose.model('User', userSchema)
    
    module.exports = User