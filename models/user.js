const mongoose = require('mongoose')


const User = mongoose.model('User', {
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
        }
    })
    
    module.exports = User