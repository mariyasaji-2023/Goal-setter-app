const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const { check, validationResult } = require('express-validator')
const User = require('../models/userModel')

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}

// Validation middleware for registration
const registerValidation = [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
]

// Validation middleware for login
const loginValidation = [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
]

// Helper function to format validation errors
const formatValidationErrors = (errors) => {
    return errors.array().reduce((acc, error) => {
        acc[error.param] = error.msg
        return acc
    }, {})
}

//@desc Register new user
//@route POST /api/users
//@access public
const registerUser = asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: formatValidationErrors(errors) })
    }

    const { name, email, password } = req.body
    const userExists = await User.findOne({ email })

    if (userExists) {
        return res.status(400).json({ errors: { email: 'User already exists' } })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword
    })

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
         
        })
    } else {
        res.status(400)
        throw new Error('Invalid user data')
    }
})

//@desc Authenticate a user
//@route POST /api/users/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
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

//@desc Get user data
//@route GET /api/users/me
//@access private
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user)
})

//@desc Get home
//@route GET /api/users/home
//@access private
const getHome = asyncHandler(async (req, res) => {
    res.status(200).json(req.user)
})

//@desc Edit user
//@route PUT /api/users
//@access private
const editUser = asyncHandler(async (req, res) => {
    const { userId, name, email } = req.body
    const user = await User.findByIdAndUpdate(userId, { name, email }, { new: true })

    if (user) {
        res.status(200).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            profileUrl: user.profileUrl,
            token: req.token
        })
    } else {
        res.status(404)
        throw new Error('User not found')
    }
})

//@desc Upload profile photo URL
//@route PUT /api/users/profile-upload
//@access private
const profileUpload =  asyncHandler(async (req, res) => {
    const { url } = req.body;
  
    if (!url) {
      res.status(400).json({ message: "No URL provided" });
      return;
    }
  
    const user = await User.findByIdAndUpdate(req.user.id, {
      profileUrl: url
    }, { new: true });
  
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  });

module.exports = {
    registerValidation,
    loginValidation,
    registerUser,
    loginUser,
    getMe,
    profileUpload,
    editUser,
    getHome
}
