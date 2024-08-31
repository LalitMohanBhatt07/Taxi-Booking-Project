const express=require('express')
const router=express.Router()


const {
    sendOTP,
    signUpCustomer
}=require('../controllers/auth')

router.post('/send-otp',sendOTP)
router.post('/signupCustomer',signUpCustomer)

module.exports=router