require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./app/models/user.model');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Clear all savedModels from all users
    const result = await User.updateMany({}, { $set: { savedModels: [] } });
    console.log(`Cleared saved models from ${result.modifiedCount} users`);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
