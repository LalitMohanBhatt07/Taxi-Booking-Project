const User = require("../models/userSchema");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const Customer = require("../models/customerSchema");
const bcrypt = require("bcrypt");
require('dotenv').config()

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{10}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const checkUserPresent = await User.findOne({ email });

    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User already Registered",
      });
    }

    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log("otp generated : ", otp);

    let result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    const otpPayload = { email, otp };
    const otpBody = await OTP.create(otpPayload);

    console.log("otp body : ", otpBody);

    res.status(200).json({
      success: true,
      message: "OTP sent Successfully",
      otp,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.signUpCustomer = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, otp } = req.body;

    if (!name || !email || !password || !phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
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

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and include both letters and numbers.",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already registered with this email.",
      });
    }

    const existingOTP = await OTP.findOne({ email });

    if (!existingOTP || existingOTP.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    const now = new Date();
    if (now > existingOTP.createdAt + 5 * 60 * 1000) {
      await OTP.deleteOne({ email });
      return res.status(400).json({
        success: false,
        message: "OTP has expired.",
      });
    }

    await OTP.deleteOne({ email });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      role: "customer",
    });

    const newCustomer = await Customer.create({
      user: newUser._id,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: {
        user: {
          name: newUser.name,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber,
        },
        customer: {
          id: newCustomer._id,
        },
      },
    });
  } catch (err) {
    console.error("Error during signup process: ", err);
    res.status(500).json({
      success: false,
      message: "An error occurred during registration. Please try again later.",
    });
  }
};

exports.signUpDriver = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phoneNumber,
      otp,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      licensePlate,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !phoneNumber ||
      !otp ||
      !vehicleMake ||
      !vehicleModel ||
      !vehicleYear ||
      !licensePlate
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
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

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and include both letters and numbers.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already registered with this email.",
      });
    }

    const existingOTP = await OTP.findOne({ email });
    if (!existingOTP || existingOTP.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    const now = new Date();
    if (now > existingOTP.createdAt.getTime() + 5 * 60 * 1000) {
      // OTP expiry: 5 minutes
      await OTP.deleteOne({ email });
      return res.status(400).json({
        success: false,
        message: "OTP has expired.",
      });
    }

    await OTP.deleteOne({ email });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      role: "driver",
    });

    const newVehicle = await Vehicle.create({
      driver: newUser._id,
      make: vehicleMake,
      model: vehicleModel,
      year: vehicleYear,
      licensePlate,
    });

    const newDriver = await Driver.create({
      user: newUser._id,
      vehicle: newVehicle._id,
      rating: 0,
      isAvailable: true,
    });

    res.status(201).json({
      success: true,
      message: "Driver registered successfully.",
      data: {
        user: {
          name: newUser.name,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber,
        },
        driver: {
          id: newDriver._id,
          vehicle: newVehicle._id,
        },
      },
    });
  } catch (err) {
    console.error("Error during driver signup process: ", err);
    res.status(500).json({
      success: false,
      message: "An error occurred during registration. Please try again later.",
    });
  }
};

exports.loginUser=async(req,res)=>{
try{
  const {email,password}=req.body;

  const user=await User.findOne({email})
  if(!user){
    return res.status(401).json({
      success: false,
      message: "Invalid email",
    });
  }

  const isPasswordValid=await bcrypt.compare(password,user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: "Invalid password",
    });
  }

  const token=jwt.sign(
    {userId:user._id,role:user.role},
    process.env.JWT_SECRET,
    {expiresIn:'24h'}
  )

  res.cookie('token',token,{
    expires:new Date(Date.now()+3*24*60*1000),
    httpOnly:true
  })

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    token,
  });

  }
catch(err){
  console.error("Error during login process: ", err);
  res.status(500).json({
    success: false,
    message: "An error occurred during login. Please try again later.",
  });
}
}

