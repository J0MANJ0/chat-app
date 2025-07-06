import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';
import connectDB from './lib/db.js';
import userRouter from './routes/user.routes.js';
import messageRouter from './routes/message.routes.js';
import { Server } from 'socket.io';

const app = express();

const server = http.createServer(app);

export const io = new Server(server, {
  cors: { origin: '*' },
});

export const userSocketMap = {};

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  console.log('User connected', userId);

  if (userId) userSocketMap[userId] = socket.id;

  io.emit('onlineUsers', Object.keys(userSocketMap));

  socket.on('disconnect', () => {
    console.log('User disconnected', userId);
    delete userSocketMap[userId];
    io.emit('onlineUsers', Object.keys(userSocketMap));
  });
});

app.use(express.json({ limit: '4mb' }));
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

app.get('/api/status', (_, res) => res.send('Server is live'));

app.use('/api/auth', userRouter);
app.use('/api/messages', messageRouter);

// const token = crypto.randomBytes(128).toString('hex');

// console.log(token);

connectDB()
  .then(() => {
    if (process.env.NODE_ENV !== 'production') {
      const PORT = process.env.PORT || 5000;
      server.listen(PORT, () =>
        console.log(`Server running on http://localhost:${PORT}`)
      );
    }
  })
  .catch((err) => console.log(err));

// for vercel
export default server;
