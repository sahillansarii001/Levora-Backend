import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: 'c:/Users/ADMIN/Levora Academy/Server/.env' });
import SiteContent from './src/models/SiteContent.js';

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const page = 'homepage';
    // Let's pretend updates only has homepage.stats.students
    const updateKeys = ['homepage.stats.students'];
    const res = await SiteContent.deleteMany({ page, key: { $nin: updateKeys } });
    console.log('Delete result:', res);
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
});
