import mongoose from 'mongoose';
import User from './src/models/User.model';
import dotenv from 'dotenv';

dotenv.config();

async function promoteToAdmin(email: string) {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aacp');
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: 'admin' },
      { new: true }
    );
    
    if (user) {
      console.log(`✅ Success! User ${email} is now an ADMIN.`);
    } else {
      console.log(`❌ Error: User with email ${email} not found.`);
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

const email = process.argv[2];
if (!email) {
  console.log('Usage: npx ts-node promote_admin.ts <email>');
  process.exit(1);
}

promoteToAdmin(email);
