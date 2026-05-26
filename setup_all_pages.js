import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import SiteContent from './src/models/SiteContent.js';

const initialContent = [
  // About Page
  { page: 'about', section: 'about_vision_1', key: 'about.about_vision_1.vision_title', value: 'Our Vision', type: 'text' },
  { page: 'about', section: 'about_vision_1', key: 'about.about_vision_1.vision_content', value: '<p>To be the global benchmark in educational excellence, nurturing minds to become leaders of tomorrow.</p>', type: 'html' },
  { page: 'about', section: 'about_vision_1', key: 'about.about_vision_1.mission_title', value: 'Our Mission', type: 'text' },
  { page: 'about', section: 'about_vision_1', key: 'about.about_vision_1.mission_content', value: '<p>To deliver innovative, student-centric, and outcome-oriented education through expert faculty, smart learning systems, and holistic development programs that prepare students for life.</p>', type: 'html' },
  { page: 'about', section: 'about_founder_2', key: 'about.about_founder_2.founder_title', value: 'Message from the Founder', type: 'text' },
  { page: 'about', section: 'about_founder_2', key: 'about.about_founder_2.founder_message', value: '<p>"Education is not just about scoring marks; it\'s about building a foundation for a successful life. At Levora Academy, we don\'t just teach subjects—we teach students how to think, how to solve problems, and how to believe in themselves."</p>', type: 'html' },
  { page: 'about', section: 'about_founder_2', key: 'about.about_founder_2.founder_name', value: 'Dr. Vikram Singhania', type: 'text' },
  { page: 'about', section: 'about_founder_2', key: 'about.about_founder_2.founder_role', value: 'Founder & Director', type: 'text' },
  { page: 'about', section: 'about_founder_2', key: 'about.about_founder_2.founder_image', value: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', type: 'text' },

  // Contact Page
  { page: 'contact', section: 'contact_info_1', key: 'contact.contact_info_1.title', value: 'Get in Touch', type: 'text' },
  { page: 'contact', section: 'contact_info_1', key: 'contact.contact_info_1.subtitle', value: 'Have questions? We\'re here to help you.', type: 'text' },
  { page: 'contact', section: 'contact_info_1', key: 'contact.contact_info_1.address', value: '123 Education Hub, Knowledge Park, New Delhi, India', type: 'text' },
  { page: 'contact', section: 'contact_info_1', key: 'contact.contact_info_1.phone', value: '+91 98765 43210', type: 'text' },
  { page: 'contact', section: 'contact_info_1', key: 'contact.contact_info_1.email', value: 'hello@levoraacademy.com', type: 'text' },
  { page: 'contact', section: 'contact_form_2', key: 'contact.contact_form_2.form_title', value: 'Send us a Message', type: 'text' },

  // Courses Page
  { page: 'courses', section: 'courses_grid_1', key: 'courses.courses_grid_1.title', value: 'Explore Our Courses', type: 'text' },
  { page: 'courses', section: 'courses_grid_1', key: 'courses.courses_grid_1.subtitle', value: 'Find the perfect course to accelerate your learning journey.', type: 'text' },

  // Faculty Page
  { page: 'faculty', section: 'faculty_grid_1', key: 'faculty.faculty_grid_1.title', value: 'Our Expert Faculty', type: 'text' },
  { page: 'faculty', section: 'faculty_grid_1', key: 'faculty.faculty_grid_1.subtitle', value: 'Meet the brilliant minds dedicated to shaping your future.', type: 'text' },

  // Results Page
  { page: 'results', section: 'results_grid_1', key: 'results.results_grid_1.title', value: 'Our Wall of Fame', type: 'text' },
  { page: 'results', section: 'results_grid_1', key: 'results.results_grid_1.subtitle', value: 'Celebrating the extraordinary achievements of our brilliant students.', type: 'text' },

  // Study Materials Page
  { page: 'study-materials', section: 'materials_grid_1', key: 'study-materials.materials_grid_1.title', value: 'Study Materials & Downloads', type: 'text' },
  { page: 'study-materials', section: 'materials_grid_1', key: 'study-materials.materials_grid_1.subtitle', value: 'Access premium Levora notes, formula sheets, and past year question papers.', type: 'text' }
];

async function setupAllPages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    // Clear old data for these pages to ensure a clean slate
    await SiteContent.deleteMany({ page: { $in: ['about', 'contact', 'courses', 'faculty', 'results', 'study-materials'] } });
    console.log('Cleared old page content.');

    for (const item of initialContent) {
      await SiteContent.create(item);
    }
    
    console.log('Successfully injected all new page content!');
    process.exit(0);
  } catch (err) {
    console.error('Setup failed:', err);
    process.exit(1);
  }
}

setupAllPages();
