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

const fixIndexes = async () => {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    const collection = db.collection('schedules');
    
    // Check if collection exists
    const collections = await db.listCollections().toArray();
    const scheduleCollection = collections.find(col => col.name === 'schedules');
    
    if (!scheduleCollection) {
      console.log('Schedules collection does not exist yet. Creating it...');
      // Create the collection by inserting a dummy document and then deleting it
      await collection.insertOne({ dummy: true });
      await collection.deleteOne({ dummy: true });
    }
    
    // Get all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);
    
    // Check if there's a unique index on staffId alone
    const staffIdIndex = indexes.find(index => 
      index.key && 
      index.key.staffId === 1 && 
      Object.keys(index.key).length === 1 &&
      index.unique === true
    );
    
    if (staffIdIndex) {
      console.log('Found problematic unique index on staffId:', staffIdIndex);
      console.log('Dropping unique index on staffId...');
      await collection.dropIndex(staffIdIndex.name);
      console.log('Dropped unique index on staffId');
    }
    
    // Create proper compound index (not unique)
    console.log('Creating proper compound index...');
    await collection.createIndex({ staffId: 1, shiftDate: 1 });
    await collection.createIndex({ departmentId: 1, shiftDate: 1 });
    await collection.createIndex({ shiftDate: 1, status: 1 });
    
    console.log('Indexes fixed successfully');
    
  } catch (error) {
    console.error('Error fixing indexes:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

fixIndexes();