const mongoose = require('mongoose');

const connectDB = async () => {
  const maxRetries = 3;
  let retryCount = 0;

  const tryConnection = async (uri, name) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`Attempting to connect to ${name}... (attempt ${i + 1}/${maxRetries})`);
        await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 10000,
        });
        console.log(`✅ ${name} connected successfully`);
        return true;
      } catch (error) {
        console.log(`❌ ${name} connection attempt ${i + 1} failed:`, error.message);
        if (i < maxRetries - 1) {
          console.log(`Retrying in 2 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    return false;
  };

  // First try local MongoDB
  const localConnected = await tryConnection('mongodb://localhost:27017/jobtracker', 'Local MongoDB');
  
  if (!localConnected) {
    console.log('\n🔄 Local MongoDB failed, trying Atlas...');
    
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('❌ MONGODB_URI not found in environment variables');
    } else {
      const atlasConnected = await tryConnection(mongoURI, 'MongoDB Atlas');
      
      if (!atlasConnected) {
        console.error('❌ All MongoDB connections failed!');
        console.log('\n🔧 SOLUTIONS:');
        console.log('1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
        console.log('2. Add your IP to Atlas whitelist: 0.0.0.0/0 (allow all)');
        console.log('3. Check your internet connection');
        console.log('4. Verify MongoDB Atlas credentials in .env file');
        console.log('\n⚠️  Server will continue without database connection...');
      }
    }
  }

  // Handle connection events
  mongoose.connection.on('disconnected', () => {
    console.log('❌ MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected');
  });
};

module.exports = connectDB;