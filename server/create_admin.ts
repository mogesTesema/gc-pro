import mongoose from 'mongoose';
import User from './src/models/User.model';
import dotenv from 'dotenv';
import { ROLES, PROFILE_STATUS } from './src/config/constants';

dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aacp');
    
    // Check if the user already exists
    let admin = await User.findOne({ email: 'admin@kira.com' });
    if (admin) {
      console.log('Admin user already exists. Email: admin@kira.com, Password: adminpassword');
    } else {
      admin = new User({
        name: 'Kira Admin',
        email: 'admin@kira.com',
        password: 'adminpassword',
        role: ROLES.ADMIN,
        profileStatus: PROFILE_STATUS.APPROVED,
        isActive: true,
        coinBalance: 9999
      });
      await admin.save();
      console.log('✅ Created new Admin user. Email: admin@kira.com, Password: adminpassword');
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

createAdmin();
