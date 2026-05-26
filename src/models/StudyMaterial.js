import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String },
  board: { type: String, enum: ['CBSE', 'ICSE', 'State', 'All'], default: 'All' },
  category: { 
    type: String, 
    enum: ['notes', 'pyqs', 'handwritten', 'formula', 'worksheet', 'assignment'],
    required: true 
  },
  fileUrl: { type: String, required: true },
  previewUrl: { type: String },
  isPremium: { type: Boolean, default: false },
  downloadCount: { type: Number, default: 0 }
}, {
  timestamps: true,
});

export default mongoose.model('StudyMaterial', studyMaterialSchema);
