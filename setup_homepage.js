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
      { page: 'homepage', section: 'hero', key: 'homepage.hero.bg_image', value: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
      
      { page: 'homepage', section: 'programs', key: 'homepage.programs.title', value: 'Premium Programs' },
      { page: 'homepage', section: 'programs', key: 'homepage.programs.subtitle', value: 'Expertly crafted curriculums designed to nurture potential at every stage of learning.' },
      
      { page: 'homepage', section: 'why', key: 'homepage.why.title', value: 'A holistic ecosystem for Academic Excellence.' },
      { page: 'homepage', section: 'why', key: 'homepage.why.subtitle', value: 'We go beyond traditional teaching methods. Our data-driven approach, combined with world-class faculty, ensures that every student achieves their absolute highest potential.' },
      
      { page: 'homepage', section: 'notes', key: 'homepage.notes.title', value: 'Premium Study Materials' },
      { page: 'homepage', section: 'notes', key: 'homepage.notes.subtitle', value: 'Our proprietary study materials are crafted by top experts.' },
      
      { page: 'homepage', section: 'faculty_showcase', key: 'homepage.faculty_showcase.title', value: 'Learn from the Best' },
      { page: 'homepage', section: 'faculty_showcase', key: 'homepage.faculty_showcase.subtitle', value: 'Our expert faculty members are dedicated to your success.' },
      
      { page: 'homepage', section: 'results_showcase', key: 'homepage.results_showcase.title', value: 'Outstanding Results' },
      { page: 'homepage', section: 'results_showcase', key: 'homepage.results_showcase.subtitle', value: 'Our students consistently achieve top ranks.' },
      
      { page: 'homepage', section: 'coding', key: 'homepage.coding.title', value: 'Levora Coder' },
      { page: 'homepage', section: 'coding', key: 'homepage.coding.subtitle', value: 'Master programming with our specialized coding courses.' },
      
      { page: 'homepage', section: 'testimonials', key: 'homepage.testimonials.title', value: 'Student Success Stories' },
      { page: 'homepage', section: 'testimonials', key: 'homepage.testimonials.subtitle', value: 'Hear what our top students have to say about their journey.' }
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
