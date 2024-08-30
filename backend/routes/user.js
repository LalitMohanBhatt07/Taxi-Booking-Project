const express=require('express')
const router=express.Router()
const otpGenerator=require('otp-generator')

const {
    sendOTP
}=require('../controllers/auth')

router.post('/send-otp',sendOTP)

module.exports=router