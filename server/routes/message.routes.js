import express from 'express';
import { protectRoute } from '../middleware/auth.js';
import {
  getMessages,
  getUsers,
  markMessageRead,
  sendMessage,
} from '../controllers/message.controller.js';

const messageRouter = express.Router();

messageRouter.get('/users', protectRoute, getUsers);
messageRouter.get('/:id', protectRoute, getMessages);
messageRouter.put('/mark/:id', protectRoute, markMessageRead);
messageRouter.post('/send/:id', protectRoute, sendMessage);

export default messageRouter;
