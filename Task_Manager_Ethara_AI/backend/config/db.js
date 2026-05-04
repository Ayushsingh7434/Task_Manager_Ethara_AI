const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("Missing MONGO_URI environment variable. Create a /backend/.env file with MONGO_URI=<your_mongodb_url>");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message || error);
    process.exit(1);
  }
};

module.exports = connectDB;