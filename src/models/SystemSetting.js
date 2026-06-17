import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema({
  academyName: { type: String, default: 'Levora Academy' },
  contactEmail: { type: String, default: 'support@levoraacademy.com' },
  contactPhone: { type: String, default: '+91 9876543210' },
  address: { type: String, default: 'Mohite Patil Nagar, Shop no-74, Mankhurd West, Mumbai - 400043' },
  visitingHours: { type: String, default: 'Mon - Sun: 8:00 AM - 9:00 PM' },
  facebookUrl: { type: String, default: 'https://facebook.com/levoraacademy' },
  instagramUrl: { type: String, default: 'https://instagram.com/levoraacademy' },
  youtubeUrl: { type: String, default: 'https://youtube.com/@levoraacademy' },
  twitterUrl: { type: String, default: 'https://twitter.com/levoraacademy' },
  trustBadge1: { type: String, default: 'ISO Certified' },
  trustBadge2: { type: String, default: '15+ Years Trust' },
  academicYear: { type: String, default: '2024-2025' },
  admissionsOpen: { type: Boolean, default: true },
  maintenanceMode: { type: Boolean, default: false }
}, {
  timestamps: true,
});

const SystemSetting = mongoose.models.SystemSetting || mongoose.model('SystemSetting', systemSettingSchema);
export default SystemSetting;
