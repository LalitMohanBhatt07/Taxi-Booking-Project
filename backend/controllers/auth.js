const User = require("../models/userSchema");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const Customer = require("../models/customerSchema");
const bcrypt = require("bcrypt");
const mailSender = require("../utils/mailSender");
require("dotenv").config();

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
    if (now > new Date(existingOTP.createdAt).getTime() + 5 * 60 * 1000) {
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

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.cookie("token", token, {
      expires: new Date(Date.now() + 3 * 24 * 60 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
    });
  } catch (err) {
    console.error("Error during login process: ", err);
    res.status(500).json({
      success: false,
      message: "An error occurred during login. Please try again later.",
    });
  }
};

exports.logoutUser = async (req, res) => {
  try {
    res.cookie("token", "", { expires: new Date(0), httpOnly: true });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    console.error("Error during logout process: ", err);
    res.status(500).json({
      success: false,
      message: "An error occurred during logout. Please try again later.",
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Old password, new password, and confirmation password are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirmation password do not match",
      });
    }

    const userId = await req.user.userId;

    const userDetails = await User.findById(userId);

    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    );

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "The old password is incorrect",
      });
    }

    const encryptedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.userId,
      { password: encryptedPassword },
      { new: true }
    );

    const emailResponse = await mailSender(
      updatedUserDetails.email,
      "Password for your account has been updated",
      `Dear ${userDetails.name},

Your password has been successfully updated. If you did not make this change, please contact our support team immediately.

Best regards,
The Support Team`
    );

    res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (err) {
    console.error("Error during password reset process:", err);
    res.status(500).json({
      success: false,
      message:
        "An error occurred during password reset. Please try again later.",
    });
  }
};

exports.forgotPasswordToken = async (req, res) => {
  try {
    const email = req.body.email;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.json({
        success: false,
        message: "Your Email is not registered with us !",
      });
    }

    const token = crypto.randomUUID();

    const updatedDetails = await User.findOneAndUpdate(
      {
        email: email,
      },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      {
        new: true,
      }
    );

    console.log("updated details : ", updatedDetails);

    const url = `http://localhost:5173/reset-password/${token}`;

    await mailSender(
      email,
      "Password Reset Link",
      `Password reset Link : ${url}`
    );

    return res.json({
      success: true,
      message:
        "Email send successfully . Please check email and change password",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Cannot send reset Password message",
      error: err.message,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body;

    if (password !== confirmPassword) {
      return res.json({
        success: false,
        message: "Password not matching",
      });
    }

    const userDetails = await User.find({ token: token });

    if (!userDetails) {
      return res.json({
        success: false,
        message: "Token Invalid",
      });
    }

    console.log("User Details for resetPassword", userDetails);

    if(userDetails.resetPasswordExpires<Date.now()){
      return res.json({
          success:false,
          message:"Token is Expired . Please regenerate your token"
      })

      const hashedPassword=await bcrypt.hash(password,10)

      console.log("hashedPassword",hashedPassword)

      const updated=await User.findOneAndUpdate(
        { token: token },
        { password: hashedPassword },
        { new: true },
      );

      console.log("updated details: ",updated)

      return res.status(200).json({
        updated,
        success:true,
        message:"Password reset successful"
    })
  }
  } catch (err) {
    console.log(err)
    res.status(500).json({
        error:err,
        message:false,
        message:"Cannot Reset Password"
    })
  }
};
