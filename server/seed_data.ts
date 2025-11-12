import mongoose from 'mongoose';
import User from './src/models/User.model';
import Profile from './src/models/Profile.model';
import dotenv from 'dotenv';
import { ROLES, PROFILE_STATUS } from './src/config/constants';
import { faker } from '@faker-js/faker';

dotenv.config();

const PLATFORMS = ['youtube', 'tiktok', 'instagram', 'twitter', 'facebook'];
const NICHES = ['Tech', 'Beauty', 'Gaming', 'Fitness', 'Fashion', 'Lifestyle', 'Education', 'Finance'];
const INDUSTRIES = ['E-commerce', 'SaaS', 'Health', 'Education', 'Finance', 'Entertainment', 'Fashion'];
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aacp');
    console.log('Connected to MongoDB.');

    const numCreators = 100;
    const numBusinesses = 100;
    
    console.log(`Generating ${numCreators} creators and ${numBusinesses} businesses...`);

    for (let i = 0; i < numCreators; i++) {
      const user = new User({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: 'password123',
        role: ROLES.CREATOR,
        profileStatus: PROFILE_STATUS.APPROVED,
        isActive: true,
        coinBalance: faker.number.int({ min: 10, max: 500 }),
        avatar: faker.image.avatar()
      });
      await user.save();

      const profile = new Profile({
        userId: user._id,
        bio: faker.lorem.paragraph(),
        location: faker.location.city(),
        niche: faker.helpers.arrayElements(NICHES, { min: 1, max: 3 }),
        skills: faker.helpers.arrayElements(['Video Editing', 'Copywriting', 'SEO', 'Public Speaking', 'Graphic Design'], { min: 1, max: 3 }),
        followers: faker.number.int({ min: 1000, max: 5000000 }),
        platform: faker.helpers.arrayElement(PLATFORMS),
        socialLinks: {
          instagram: faker.internet.url(),
          youtube: faker.internet.url(),
        },
        performanceMetrics: {
          avgViews: faker.number.int({ min: 500, max: 1000000 }),
          avgLikes: faker.number.int({ min: 100, max: 100000 }),
          engagementRate: faker.number.float({ min: 1, max: 15, fractionDigits: 2 }),
          completedCollaborations: faker.number.int({ min: 0, max: 50 }),
          averageRating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
          totalEarnings: faker.number.int({ min: 0, max: 50000 })
        },
        approvalStatus: PROFILE_STATUS.APPROVED
      });
      await profile.save();
    }

    for (let i = 0; i < numBusinesses; i++) {
      const user = new User({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: 'password123',
        role: ROLES.BUSINESS,
        profileStatus: PROFILE_STATUS.APPROVED,
        isActive: true,
        coinBalance: faker.number.int({ min: 100, max: 1000 }),
        avatar: faker.image.avatar()
      });
      await user.save();

      const profile = new Profile({
        userId: user._id,
        bio: faker.lorem.paragraph(),
        location: faker.location.city(),
        businessName: faker.company.name(),
        industry: faker.helpers.arrayElement(INDUSTRIES),
        companySize: faker.helpers.arrayElement(COMPANY_SIZES),
        targetAudience: faker.lorem.words(3),
        website: faker.internet.url(),
        approvalStatus: PROFILE_STATUS.APPROVED
      });
      await profile.save();
    }

    console.log('✅ Successfully seeded 100 creators and 100 business accounts with profiles.');
  } catch (error: any) {
    console.error('❌ Error during seeding:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

seedData();
