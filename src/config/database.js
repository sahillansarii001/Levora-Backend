import prisma from './prisma.js';

const connectDB = async () => {
  try {
    // Connect to PostgreSQL via Prisma
    await prisma.$connect();
    console.log(`✓ PostgreSQL Connected via Prisma`);
  } catch (error) {
    console.error(`Error connecting to database: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
