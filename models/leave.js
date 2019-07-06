const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const leaveSchema = new mongoose.Schema({
        leaveType: {
            type: String,
            required: true,
            trim: true
        },
        noOfDays:{
            type: Number,
            required: true
        },
        staffID:{
            type: String,
            required: true,
            trim: true
        },
    })


const Leave = mongoose.model('Leave', leaveSchema)
    
    module.exports = Leave