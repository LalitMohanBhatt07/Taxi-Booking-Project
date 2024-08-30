const User=require('../models/userSchema')
const OTP=require('../models/OTP')
const otpGenerator=require('otp-generator')

exports.sendOTP=async(req,res)=>{
    try{
        const {email}=req.body;

        const checkUserPresent=await User.findOne({email});

        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:"User already Registered"
            })
        }

        var otp=otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false
        })

        console.log("otp generated : ",otp)

        let result=await OTP.findOne({otp:otp})

        while(result){
            otp=otpGenerator(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false
            })
            result=await OTP.findOne({otp:otp})
        }

        const otpPayload={email,otp}
        const otpBody=await OTP.create(otpPayload)

        console.log("otp body : ",otpBody);
        
        res.status(200).json({
            success:true,
            message:"OTP sent Successfully",otp
          })
    }
    catch(err){
        console.log(err)
    res.status(500).json({
        success:false,
        message:err.message
    })
    }
}