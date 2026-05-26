import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SiteContent from '../models/SiteContent.js';

dotenv.config();

const defaultContent = [
  // Homepage
  { page: 'homepage', section: 'hero', key: 'homepage.hero.title', value: 'Empowering the Next Generation of Leaders' },
  { page: 'homepage', section: 'hero', key: 'homepage.hero.subtitle', value: 'Experience world-class education with Levora Academy. We nurture talent, foster innovation, and build futures.' },
  { page: 'homepage', section: 'stats', key: 'homepage.stats.students', value: '10,000+' },
  { page: 'homepage', section: 'stats', key: 'homepage.stats.success', value: '98%' },
  { page: 'homepage', section: 'stats', key: 'homepage.stats.faculty', value: '500+' },

  // About Us
  { page: 'about', section: 'header', key: 'about.header.title', value: 'About Levora Academy' },
  { page: 'about', section: 'header', key: 'about.header.content', value: '<p>Levora Academy has been at the forefront of educational excellence for over two decades. Our commitment to holistic development ensures every student reaches their full potential.</p>' },
  { page: 'about', section: 'vision', key: 'about.vision.title', value: 'Our Vision' },
  { page: 'about', section: 'vision', key: 'about.vision.content', value: '<p>To be the premier institution of learning, recognized globally for academic excellence and character development.</p>' },

  // Contact
  { page: 'contact', section: 'header', key: 'contact.header.title', value: 'Get In Touch' },
  { page: 'contact', section: 'header', key: 'contact.header.subtitle', value: 'We are here to answer any questions you may have about Levora Academy.' },
  { page: 'contact', section: 'info', key: 'contact.info.address', value: '123 Education Boulevard, Knowledge City' },
  { page: 'contact', section: 'info', key: 'contact.info.phone', value: '+1 (555) 123-4567' },
  { page: 'contact', section: 'info', key: 'contact.info.email', value: 'info@levoraacademy.com' }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/levora_academy');
    console.log('Connected to MongoDB');

    // Only insert if they don't exist
    for (const item of defaultContent) {
      const exists = await SiteContent.findOne({ key: item.key });
      if (!exists) {
        await SiteContent.create(item);
        console.log(`Seeded: ${item.key}`);
      }
    }

    console.log('Content seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
