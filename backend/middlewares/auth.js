const jwt = require("jsonwebtoken");

exports.auth = async (req, res, next) => {
  try {
    let token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorization")?.replace("Bearer", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    try {
      const decoded = await jwt.verify(token, process.env.JWT_SECRET);
      console.log("decoded : ",decoded)
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid",
      });
    }
  } catch (err) {
    console.error("Error during token verification:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while verifying the token",
    });
  }
};
