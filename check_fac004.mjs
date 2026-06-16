import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/levora';
mongoose.connect(uri);

async function check() {
  const s = await mongoose.connection.collection('students').findOne({ $or: [{email: 'FAC004'}, {studentId: 'FAC004'}] });
  console.log('Student match:', s);
  
  process.exit(0);
}
check();
