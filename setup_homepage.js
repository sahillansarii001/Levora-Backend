import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: 'c:/Users/ADMIN/Levora Academy/Server/.env' });
import SiteContent from './src/models/SiteContent.js';

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    // Clear all homepage content first
    await SiteContent.deleteMany({ page: 'homepage' });

    const fullHomepage = [
      { page: 'homepage', section: 'hero', key: 'homepage.hero.title', value: 'Empowering the Next Generation of Leaders' },
      { page: 'homepage', section: 'hero', key: 'homepage.hero.subtitle', value: 'Experience world-class education with Levora Academy. We nurture talent, foster innovation, and build futures.' },
      
      { page: 'homepage', section: 'programs', key: 'homepage.programs.enabled', value: 'true' },
      { page: 'homepage', section: 'why', key: 'homepage.why.enabled', value: 'true' },
      { page: 'homepage', section: 'notes', key: 'homepage.notes.enabled', value: 'true' },
      { page: 'homepage', section: 'faculty_showcase', key: 'homepage.faculty_showcase.enabled', value: 'true' },
      { page: 'homepage', section: 'results_showcase', key: 'homepage.results_showcase.enabled', value: 'true' },
      { page: 'homepage', section: 'coding', key: 'homepage.coding.enabled', value: 'true' },
      { page: 'homepage', section: 'testimonials', key: 'homepage.testimonials.enabled', value: 'true' }
    ];

    const bulkOps = fullHomepage.map(item => ({
      insertOne: {
        document: { ...item, type: 'html' }
      }
    }));
    
    await SiteContent.bulkWrite(bulkOps);
    
    console.log('Homepage successfully restored!');
  } catch (err) { console.error('Error:', err); }
  process.exit(0);
});
