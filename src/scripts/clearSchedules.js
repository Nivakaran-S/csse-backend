const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const clearSchedules = async () => {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    const collection = db.collection('schedules');
    
    // Drop all indexes except _id
    console.log('Dropping all indexes...');
    try {
      await collection.dropIndexes();
      console.log('All indexes dropped');
    } catch (error) {
      console.log('No indexes to drop or error:', error.message);
    }
    
    // Clear all existing schedules
    console.log('Clearing all existing schedules...');
    const deleteResult = await collection.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} schedules`);
    
    // Create only the necessary non-unique indexes
    console.log('Creating new indexes...');
    await collection.createIndex({ staffId: 1, shiftDate: 1 });
    await collection.createIndex({ departmentId: 1, shiftDate: 1 });
    await collection.createIndex({ shiftDate: 1, status: 1 });
    
    console.log('Database cleared and indexes recreated successfully');
    
  } catch (error) {
    console.error('Error clearing schedules:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

clearSchedules();
