import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: 'c:/Users/ADMIN/Levora Academy/Server/.env' });
import SiteContent from './src/models/SiteContent.js';

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const updates = [
      { key: 'homepage.hero_999.title', value: 'Test Title', page: 'homepage', section: 'hero_999' }
    ];
    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { key: update.key },
        update: { 
          $set: { value: update.value },
          $setOnInsert: { page: update.page || 'homepage', section: update.section || 'general', type: 'html' }
        },
        upsert: true
      }
    }));
    const res = await SiteContent.bulkWrite(bulkOps);
    console.log('Success:', res);
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
});
