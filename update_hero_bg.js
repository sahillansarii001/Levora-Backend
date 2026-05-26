import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: 'c:/Users/ADMIN/Levora Academy/Server/.env' });
import SiteContent from './src/models/SiteContent.js';

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const bgImageUrl = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';

    await SiteContent.findOneAndUpdate(
      { page: 'homepage', section: 'hero', key: 'homepage.hero.bg_image' },
      { 
        $set: { 
          page: 'homepage', 
          section: 'hero', 
          key: 'homepage.hero.bg_image', 
          value: bgImageUrl, 
          type: 'html' 
        } 
      },
      { upsert: true, new: true }
    );
    
    console.log('Hero Background Image successfully updated!');
  } catch (err) { 
    console.error('Error:', err); 
  }
  process.exit(0);
});
