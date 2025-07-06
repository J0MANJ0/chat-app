import cloudinary from '../lib/cloudinary.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { io, userSocketMap } from '../server.js';

export const getUsers = async (req, res) => {
  try {
    const {
      user: { _id: userId },
    } = req;

    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      '-password'
    );

    const unseenMessages = {};

    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });

      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });

    await Promise.all(promises);

    return res.json({
      success: true,
      users: filteredUsers,
      unseenMessages,
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const {
      params: { id: selectedUserId },
      user: { _id: userId },
    } = req;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: userId },
      ],
    });

    await Message.updateMany(
      { senderId: selectedUserId, receiverId: userId },
      { seen: true }
    );

    return res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const markMessageRead = async (req, res) => {
  try {
    const {
      params: { id },
    } = req;
    await Message.findOneAndUpdate(id, { seen: true });

    return res.json({
      success: true,
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const {
      body: { text, image },
      params: { id: receiverId },
      user: { _id: senderId },
    } = req;

    let imageUrl;

    if (image) {
      const uploadResponse = cloudinary.uploader.upload(image);
      imageUrl = (await uploadResponse).secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', newMessage);
    }

    return res.json({
      success: true,
      newMessage,
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
