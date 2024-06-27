const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel')

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      console.log(token);
      res.status(401);
      throw new Error('Not authorized');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});


const protectAdmin = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Log the token for debugging purposes
      // console.log("Token:", token);

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get admin from Token
      req.admin = await User.findById(decoded.id).select('-password');

      // Call next middleware
      next();
    } catch (error) {
      console.error("JWT Error:", error);

      if (error.name === 'JsonWebTokenError') {
        res.status(401).json({ message: "Invalid token" });
      } else if (error.name === 'TokenExpiredError') {
        res.status(401).json({ message: "Token expired" });
      } else {
        res.status(401).json({ message: "Not authorized" });
      }
    }
  } else {
    res.status(401).json({ message: "No token, authorization denied" });
  }
});



module.exports = { protect, protectAdmin }

