const User=require('../models/userSchema')

exports.getUserProfile=async(req,res)=>{
    try{
        const userId= req.user.userId;

        const user=await User.findById(userId).select('-password')

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found.",
              });
        }

        res.status(200).json({
            success: true,
            data: user,
          });
    }
    catch(err){
        console.error("Error fetching user profile: ", err);
        res.status(500).json({
          success: false,
          message: "An error occurred while fetching the profile.",
        });
    }
}