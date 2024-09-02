const express=require('express')
const router=express.Router()


const {
    sendOTP,
    signUpCustomer,
    signUpDriver,
    loginUser,
    logoutUser,
    resetPassword
}=require('../controllers/auth')

router.post('/send-otp',sendOTP)
router.post('/signupCustomer',signUpCustomer)
router.post('/signupDriver', signUpDriver);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/reset-password', auth, resetPassword);

module.exports=router