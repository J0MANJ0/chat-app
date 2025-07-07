import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';
import connectDB from './lib/db.js';
import userRouter from './routes/user.routes.js';
import messageRouter from './routes/message.routes.js';
import { Server } from 'socket.io';
import path from 'path';

const app = express();

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://chat-app-nu-rust.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST'],
  },
  transports: ['polling', 'websocket'],
});

io.engine.on('connection_error', (err) => {
  console.error('Socket.IO connection error:', {
    message: err.message,
    context: err.context,
    code: err.code,
    request: err.req, // Log request details
  });
});

export const userSocketMap = {};

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  console.log('User connected', userId, 'Socket ID:', socket.id);

  if (userId) userSocketMap[userId] = socket.id;

  io.emit('onlineUsers', Object.keys(userSocketMap));

  socket.on('disconnect', () => {
    console.log('User disconnected', userId, 'Socket ID:', socket.id);
    delete userSocketMap[userId];
    io.emit('onlineUsers', Object.keys(userSocketMap));
  });
});

const __dirname = path.resolve();
app.use(express.json({ limit: '4mb' }));
app.use(cookieParser());
app.use(
  cors({
    origin: [
      'http://localhost:5173', // ✅ Development frontend
      'https://chat-app-nu-rust.vercel.app', // ✅ Production frontend
    ],
    credentials: true,
  })
);

app.get('/api/status', (_, res) => res.send('Server is live'));

app.use('/api/auth', userRouter);
app.use('/api/messages', messageRouter);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, '../client', 'dist', 'index.html'));
  });
}
connectDB()
  .then(() => {
    if (process.env.NODE_ENV !== 'production') {
      const PORT = process.env.PORT || 5000;
      server.listen(PORT, () =>
        console.log(`Server running on http://localhost:${PORT}`)
      );
    }
  })
  .catch((err) => console.log('Database connection error:', err));

// for vercel
export default server;
