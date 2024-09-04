const mongoose=require('mongoose')
const { resetPassword } = require('../controllers/auth')

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['driver','customer'],
        required:true
    },
    token:{
        type:String
    },
    resetPasswordExpires:{
        type:Date
    }
})

const User=mongoose.model('User',userSchema)
module.exports=User