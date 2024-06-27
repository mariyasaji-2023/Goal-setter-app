const express = require('express')
const router = express.Router()
const {  registerValidation, 
  loginValidation,
  registerUser,
  loginUser,
  getMe,
  editUser,
  profileUpload
} = require('../controllers/userController')
const { protect } = require('../middleware/authMiddileware')

router.post('/',registerValidation, registerUser)
router.post('/login',loginValidation, loginUser)
router.get('/me', protect, getMe)
router.put('/:userId',protect,editUser)
router.post('/profile/upload',protect,profileUpload)


module.exports = router