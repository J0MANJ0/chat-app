import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () =>
      console.log('Database quick_chat connected')
    );
    await mongoose.connect(`${process.env.MONGODB_URI}/quick_chat`);
  } catch (error) {
    console.log('Error connecting DB:', error);
  }
};

export default connectDB;
