const User=require('../models/userSchema')
const Driver=require('../models/driverSchema')
const Customer=require('../models/customerSchema')

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

exports.updateUserProfile=async(req,res)=>{
    try{
        const userId=req.user.userId;
        const {name,phoneNumber,email}=req.body;

        if (!name || !phoneNumber || !email) {
            return res.status(400).json({
              success: false,
              message: "Name, phone number, and email are required.",
            });
          }

          if (!emailRegex.test(email)) {
            return res.status(400).json({
              success: false,
              message: "Invalid email format.",
            });
          }

          if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({
              success: false,
              message: "Invalid phone number format.",
            });
          }

          const updatedUser=await User.findByIdAndUpdate(userId,{
            name,phoneNumber,email
          },{new:true,runValidators:true})

          if (!updatedUser) {
            return res.status(404).json({
              success: false,
              message: "User not found.",
            });
          }

          res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            data: updatedUser,
          });
    }
    catch (err) {
        console.error("Error updating user profile:", err);
        res.status(500).json({
          success: false,
          message: "An error occurred while updating the profile. Please try again later.",
        });
      }
}

exports.deleteUserAccount=async(req,res)=>{
  try{
    const userId=req.user.userId;

    await User.findByIdAndDelete(userId)

    res.status(200).json({
      success: true,
      message: "User account deleted successfully",
    });
  }
  catch (err) {
    console.error("Error deleting user account: ", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting account",
    });
  }
}

exports.getAllUsers=async(req,res)=>{
  try{
    const users=await User.find().select('-password')

    res.status(200).json({
      success: true,
      data: users,
    });
  }
  catch(err){
    console.error("Error fetching users: ", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching users",
    });
  }
}

exports.getAllDrivers=async(req,res)=>{
  try{
    const drivers=await Driver.find().populate('user','name email phoneNumber')
    .populate('vehicle','make model year licensePlate')

    res.status(200).json({
      success: true,
      data: drivers,
    });
  }
  catch (err) {
    console.error("Error retrieving drivers: ", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching drivers. Please try again later.",
    });
  }
  
}

exports.getAllCustomers=async(req,res)=>{
  try{
    const customers = await Customer.find()
      .populate('user', 'name email phoneNumber');

      res.status(200).json({
        success: true,
        data: customers,
      });
  }
  catch(err){
    console.error("Error retrieving customers: ", err);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching customers. Please try again later.",
    });
  }
}
