import mongoose from 'mongoose';

const siteContentSchema = new mongoose.Schema({
  page: { 
    type: String, 
    required: true,
    index: true 
  },
  section: { 
    type: String, 
    required: true 
  },
  key: { 
    type: String, 
    required: true, 
    unique: true 
  },
  value: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['text', 'html', 'image'], 
    default: 'html' 
  }
}, { timestamps: true });

export default mongoose.model('SiteContent', siteContentSchema);
