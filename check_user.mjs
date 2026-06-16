import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/levora';
mongoose.connect(uri);

async function check() {
  const student = await mongoose.connection.collection('students').findOne({ email: 'kiyer@levora.edu' });
  const faculty = await mongoose.connection.collection('faculties').findOne({ email: 'kiyer@levora.edu' });
  console.log('Student:', student);
  console.log('Faculty:', faculty);
  process.exit(0);
}
check();
