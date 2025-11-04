require('dotenv').config();
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://alamakmsazzadul_db_user:jybG7nHWYVPbcuic@idot-project.kvjtojk.mongodb.net/bezkoder_db';

async function removeCaterpillarFrom2025() {
  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('bezkoder_db');
    const collection2025 = db.collection('2025');

    // Find all documents with Manufacturer = "Caterpillar"
    const caterpillarEntries = await collection2025.find({ Manufacturer: 'Caterpillar' }).toArray();
    console.log(`📊 Found ${caterpillarEntries.length} entries with Manufacturer = "Caterpillar"`);

    if (caterpillarEntries.length === 0) {
      console.log('ℹ️  No Caterpillar entries found in 2025 collection');
      return;
    }

    // Delete all Caterpillar entries
    const result = await collection2025.deleteMany({ Manufacturer: 'Caterpillar' });
    
    console.log(`✅ Successfully deleted ${result.deletedCount} Caterpillar entries from 2025 collection`);
    
    // Verify deletion
    const remaining = await collection2025.find({ Manufacturer: 'Caterpillar' }).count();
    console.log(`✅ Verification: ${remaining} Caterpillar entries remaining (should be 0)`);

  } catch (error) {
    console.error('❌ Error removing Caterpillar entries:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('✅ MongoDB connection closed');
    }
  }
}

// Run the script
removeCaterpillarFrom2025()
  .then(() => {
    console.log('🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });

