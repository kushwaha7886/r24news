import express from 'express';
const router = express.Router();
import User from '../models/User.model.js';
import { verifyToken, verifyRole } from '../middleware/Auth.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { createJournalist, deleteJournalist, getCurrentUser, registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, updateAccountDetails, updateUserAvatar, getUserChannelProfile, getWatchHistory, forgotPassword } from '../controllers/User.controller.js';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

// Get all users
router.get('/', verifyToken, verifyRole(['admin']), asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.status(200).json({
    success: true,
    data: users
  });
}));

// Get all journalists
router.get('/journalists', verifyToken, asyncHandler(async (req, res) => {
  const journalists = await User.find({ role: 'journalist' }).select('-password');
  res.status(200).json({
    success: true,
    data: journalists
  });
}));

// Get current user (alternative endpoint)
router.get('/current-user', verifyToken, getCurrentUser);

// Get user by ID
router.get('/:id', verifyToken, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  res.status(200).json({
    success: true,
    data: user
  });
}));

// Update user role
router.patch('/:id/role', verifyToken, verifyRole(['admin']), asyncHandler(async (req, res) => {
  const { role } = req.body;
  const validRoles = ['reader', 'journalist', 'editor', 'admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role'
    });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    data: user
  });
}));

// Delete user
router.delete('/:id', verifyToken, verifyRole(['admin']), asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  res.status(200).json({
    success: false,
    message: 'User deleted successfully'
  });
}));

// Create journalist
router.post('/journalists', verifyToken, verifyRole(['editor', 'admin']), upload.any(), createJournalist);

// Delete journalist
router.delete('/journalists/:id', verifyToken, verifyRole(['editor', 'admin']), deleteJournalist);

// Get current user
router.get('/me', verifyToken, getCurrentUser);

// Register user
router.post('/register', registerUser);

// Login user
router.post('/login', loginUser);

// Logout user
router.post('/logout', verifyToken, logoutUser);

// Refresh access token
router.post('/refresh-token', refreshAccessToken);

// Change current password
router.post('/change-password', verifyToken, changeCurrentPassword);

// Update account details
router.patch('/update-account', verifyToken, updateAccountDetails);

// Update user avatar
router.patch('/avatar', verifyToken, upload.single('avatar'), updateUserAvatar);

// Get user channel profile
router.get('/c/:username', verifyToken, getUserChannelProfile);

// Get watch history
router.get('/history', verifyToken, getWatchHistory);

// Forgot password
router.post('/forgot-password', forgotPassword);

export default router;
