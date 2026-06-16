import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/levora';
mongoose.connect(uri);

async function check() {
  const students = await mongoose.connection.collection('students').find().toArray();
  const faculties = await mongoose.connection.collection('faculties').find().toArray();
  const admins = await mongoose.connection.collection('admins').find().toArray();
  
  console.log('Total students:', students.length);
  console.log('Total faculties:', faculties.length);
  
  // Find any student with an email that is 'kiyer@levora.edu'
  const s = students.find(s => s.email === 'kiyer@levora.edu');
  console.log('Student match:', s);
  
  process.exit(0);
}
check();
