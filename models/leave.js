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
        isApproved:{
            type: String,
            default: 'Pending'
        },
        statusUpdated:{
            type: Boolean
        },
        createdAt:{
            type: Date,
            required:true,
            default: Date.now
        },        
        startDate:{
            type: Date,
            required:true
        },
        endDate:{
            type: Date,
            required:true
        }
    })


const Leave = mongoose.model('Leave', leaveSchema)
    
    module.exports = Leave