import cloudinary from '../lib/cloudinary.js';
import { generateToken } from '../lib/utils.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const signup = async (req, res) => {
  const {
    body: { fullName, email, password, bio },
  } = req;
  try {
    if (!fullName || !email || !password || !bio) {
      return res.json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (password.length < 6) {
      return res.json({
        success: false,
        message: 'Password must be atleast 6 characters.',
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({
        success: false,
        message: 'Account already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    const token = generateToken(user._id, res);

    return res.json({
      success: true,
      user,
      token,
      message: 'Account created successfully',
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  const {
    body: { email, password },
  } = req;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: 'Account not found',
      });
    }

    const userPassword = await bcrypt.compare(password, user.password);

    if (!userPassword) {
      return res.json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(user._id, res);

    return res.json({
      success: true,
      user,
      token,
      message: 'Login successful',
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = async (_, res) => {
  try {
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });

    return res.json({
      success: true,
      message: 'Logged Out',
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const checkAuth = (req, res) => {
  return res.json({ success: true, user: req.user });
};

export const updateProfile = async (req, res) => {
  try {
    const {
      body: { profilePic, bio, fullName },
      user: { _id: userId },
    } = req;

    let updatedUser;

    if (!profilePic) {
      await User.findById(userId, { bio, fullName }, { new: true });
    } else {
      const upload = await cloudinary.uploader.upload(profilePic);

      updatedUser = await User.findByIdAndUpdate(userId, {
        profilePic: upload.secure_url,
        bio,
        fullName,
      });
    }
    return res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
