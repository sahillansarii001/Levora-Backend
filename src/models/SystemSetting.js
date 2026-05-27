import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema({
  academyName: { type: String, default: 'Levora Academy' },
  contactEmail: { type: String, default: 'support@levoraacademy.com' },
  contactPhone: { type: String, default: '+91 9876543210' },
  academicYear: { type: String, default: '2024-2025' },
  admissionsOpen: { type: Boolean, default: true },
  maintenanceMode: { type: Boolean, default: false }
}, {
  timestamps: true,
});

const SystemSetting = mongoose.models.SystemSetting || mongoose.model('SystemSetting', systemSettingSchema);
export default SystemSetting;
