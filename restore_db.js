import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: 'c:/Users/ADMIN/Levora Academy/Server/.env' });
import SiteContent from './src/models/SiteContent.js';

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const defaultHomepage = [
      { page: 'homepage', section: 'hero', key: 'homepage.hero.title', value: 'Empowering the Next Generation of Leaders' },
      { page: 'homepage', section: 'hero', key: 'homepage.hero.subtitle', value: 'Experience world-class education with Levora Academy. We nurture talent, foster innovation, and build futures.' },
      { page: 'homepage', section: 'stats', key: 'homepage.stats.students', value: '10,000+' },
      { page: 'homepage', section: 'stats', key: 'homepage.stats.success', value: '98%' },
      { page: 'homepage', section: 'stats', key: 'homepage.stats.faculty', value: '500+' }
    ];

    const bulkOps = defaultHomepage.map(item => ({
      updateOne: {
        filter: { key: item.key },
        update: { $set: item, $setOnInsert: { type: 'html' } },
        upsert: true
      }
    }));
    await SiteContent.bulkWrite(bulkOps);
    
    // Explicitly delete the test one that was bothering them!
    await SiteContent.deleteOne({ key: 'homepage.hero_999.title' });
    
    console.log('Restored');
  } catch (err) { console.error('Error:', err); }
  process.exit(0);
});
