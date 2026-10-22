const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Failed: ${error.message}`);
    console.error(`\n To fix this:`);
    console.error(`1. If using MongoDB Atlas (Cloud): Set your MONGO_URI in 'server/.env'`);
    console.error(`   Example: MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/notes-app`);
    console.error(`2. If using local MongoDB: Ensure your MongoDB service/daemon is running on port 27017.\n`);
    process.exit(1);
  }
};

module.exports = connectDB;

