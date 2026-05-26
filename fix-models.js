import fs from 'fs';
const files = ['TestResult.js', 'Testimonial.js', 'Test.js', 'FeeRecord.js', 'Enquiry.js', 'Attendance.js', 'Admission.js'];
files.forEach(f => {
  const name = f.replace('.js', '');
  const content = `import mongoose from 'mongoose';\n\nconst schema = new mongoose.Schema({}, { strict: false, timestamps: true });\n\nconst ${name} = mongoose.models.${name} || mongoose.model('${name}', schema);\n\nexport default ${name};\n`;
  fs.writeFileSync('./src/models/' + f, content, 'utf8');
});
console.log('Fixed Sequelize models');
