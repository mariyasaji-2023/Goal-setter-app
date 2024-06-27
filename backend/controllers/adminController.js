const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// Admin login
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && user.isAdmin && (await bcrypt.compare(password, user.password))) {
    if (user.isBlock) {
      res.status(403); // Forbidden
      throw new Error('User is blocked');
    }

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      // phone: user.phone,
      profileUrl: user.profileUrl,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('wrong email or password');
  }
});

// User login
const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    if (user.isBlock) {
      res.status(403); // Forbidden
      throw new Error('User is blocked');
    }

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid credentials');
  }
});

const adminAccount = asyncHandler(async (req, res) => {
  res.json({ message: 'Admin and User data' });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isAdmin: false });

  if (users) {
    res.status(200).json({ users });
  } else {
    res.status(404);
    throw new Error('Users not found');
  }
});

// Block and Unblock Users
const userBlock = asyncHandler(async (req, res) => {
  const userId = req.body.userId;
  const user = await User.findById(userId);

  if (!user) {
    res.status(400);
    throw new Error('User not found');
  }
  user.isBlock = !user.isBlock;
  await user.save();
  const users = await User.find({ isAdmin: false });
  res.status(200).json({ users });
});

// Edit user
const editUser = asyncHandler(async (req, res) => {
  const { userId, name,  email } = req.body;
  const updateUser = await User.findByIdAndUpdate(userId, { name, email }, { new: true });
  const users = await User.find({ isAdmin: false });

  if (users) {
    res.status(200).json({ users });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// Search User
const searchUser = asyncHandler(async (req, res) => {
  const { query } = req.body;
  // Create a regular expression for substring search
  const regex = new RegExp(query, 'i');

  // Find users whose name contains the query as a substring
  const users = await User.find({ name: { $regex: regex } });
  res.status(200).json({ users });
});


// Generate JWT
const generateToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });  
  console.log("Generated Token:", token);
  return token;
};


// Add user from Admin Side
const registerUser = asyncHandler(async (req, res) => {
  const { name, email,  password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please add all Fields');
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('Email already registered');
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,  
  });
   
  // Fetch all non-admin users
  const users = await User.find({ isAdmin: false });

  if (user) {
    res.status(200).json({ users });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

module.exports = {
  loginAdmin,
  userLogin, // Exporting userLogin
  adminAccount,
  getUsers,
  editUser,
  userBlock,
  searchUser,
  registerUser,
};
