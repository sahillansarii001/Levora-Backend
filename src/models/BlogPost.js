import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String
  },
  coverImage: {
    type: String
  },
  category: {
    type: String
  },
  tags: [{
    type: String
  }],
  publishedAt: {
    type: Date
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('BlogPost', blogPostSchema);
