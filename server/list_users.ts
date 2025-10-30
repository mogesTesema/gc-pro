import mongoose from 'mongoose';
import User from './src/models/User.model';
import dotenv from 'dotenv';

dotenv.config();

async function listUsers() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aacp');
  const users = await User.find({}, 'name email role');
  console.log('Current Users:');
  console.log(JSON.stringify(users, null, 2));
  await mongoose.connection.close();
}

listUsers();
