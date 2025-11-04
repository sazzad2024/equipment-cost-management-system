const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://alamakmsazzadul_db_user:jybG7nHWYVPbcuic@idot-project.kvjtojk.mongodb.net/bezkoder_db';

// Models
const FuelPrice = require('./app/models/fuel.model');

async function uploadFuelData() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB Atlas');

    console.log('\n📊 Uploading Fuel Price Data...');
    
    const csvPath = path.join(__dirname, '../frontend/src/assets/data/illinois_fuel_prices.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.log('⚠️  Fuel prices CSV file not found');
      return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    
    // Parse CSV synchronously
    const results = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true
    });
    
    const fuelData = results.data;
    console.log(`📋 Found ${fuelData.length} fuel price records`);

    // Clear existing fuel data
    await FuelPrice.deleteMany({});
    console.log('🗑️  Cleared existing fuel price data');

    // Insert data in smaller batches to avoid connection issues
    const batchSize = 100;
    for (let i = 0; i < fuelData.length; i += batchSize) {
      const batch = fuelData.slice(i, i + batchSize);
      const bulkOps = batch.map(record => ({
        updateOne: {
          filter: { 
            County: record.County, 
            Quarter: record.Quarter, 
            'Fuel Type': record['Fuel Type'] 
          },
          update: { $set: { 'Fuel Price': parseFloat(record['Fuel Price']) || 0 } },
          upsert: true
        }
      }));

      await FuelPrice.bulkWrite(bulkOps);
      console.log(`✅ Uploaded batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(fuelData.length/batchSize)}`);
    }
    
    console.log('🎉 Fuel price data uploaded successfully!');
    console.log('📈 Your MongoDB now contains fuel prices for all counties and quarters');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the upload
uploadFuelData().catch(console.error);