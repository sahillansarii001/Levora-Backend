import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: 'c:/Users/ADMIN/Levora Academy/Server/.env' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const collection = mongoose.connection.collection('sitecontents');
  const docs = await collection.find({}).toArray();
  console.log('Total docs:', docs.length);
  console.log(docs);
  process.exit(0);
});
