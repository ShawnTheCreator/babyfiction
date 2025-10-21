import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/glide_shop';
    const dbNameEnv = process.env.MONGO_DB_NAME;
    const hasDbInUri = /\/[A-Za-z0-9_.-]+(\?|$)/.test(mongoUri.replace('mongodb+srv://','mongodb://'));
    const dbName = dbNameEnv || (hasDbInUri ? undefined : 'BabyfictionsDB');
    const conn = await mongoose.connect(mongoUri, dbName ? { dbName } : {});
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;