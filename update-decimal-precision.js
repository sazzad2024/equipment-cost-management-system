const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB');
  
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  
  // Get all year collections (2003-2025)
  const yearCollections = collections
    .map(col => col.name)
    .filter(name => /^\d{4}$/.test(name))
    .sort();
  
  console.log('Found year collections:', yearCollections);
  
  let totalUpdated = 0;
  
  for (const year of yearCollections) {
    console.log('\nUpdating collection:', year);
    
    const collection = db.collection(year);
    const count = await collection.countDocuments();
    console.log('Documents in', year + ':', count);
    
    if (count > 0) {
      // Get all documents and update them with proper 4 decimal places
      const documents = await collection.find({}).toArray();
      
      for (const doc of documents) {
        // Round to 4 decimal places
        const updates = {};
        if (doc.Sales_Tax !== undefined) {
          updates.Sales_Tax = Math.round((doc.Sales_Tax || 0) * 10000) / 10000;
        }
        if (doc.Salvage_Value !== undefined) {
          updates.Salvage_Value = Math.round((doc.Salvage_Value || 0) * 10000) / 10000;
        }
        if (doc.Annual_Overhead_rate !== undefined) {
          updates.Annual_Overhead_rate = Math.round((doc.Annual_Overhead_rate || 0) * 10000) / 10000;
        }
        if (doc.Annual_Overhaul_Parts_cost_rate !== undefined) {
          updates.Annual_Overhaul_Parts_cost_rate = Math.round((doc.Annual_Overhaul_Parts_cost_rate || 0) * 10000) / 10000;
        }
        if (doc.Annual_Field_Repair_Parts_and_misc_supply_parts_Cost_rate !== undefined) {
          updates.Annual_Field_Repair_Parts_and_misc_supply_parts_Cost_rate = Math.round((doc.Annual_Field_Repair_Parts_and_misc_supply_parts_Cost_rate || 0) * 10000) / 10000;
        }
        
        await collection.updateOne(
          { _id: doc._id },
          { $set: updates }
        );
      }
      
      console.log('Updated', documents.length, 'documents in', year);
      totalUpdated += documents.length;
    }
  }
  
  console.log('\nTotal documents updated:', totalUpdated);
  
  // Verify the update by checking a sample
  console.log('\nVerifying update...');
  const sample = await db.collection('2025').findOne({});
  if (sample) {
    console.log('Sample data after update:');
    console.log('Sales_Tax:', sample.Sales_Tax, 'Type:', typeof sample.Sales_Tax);
    console.log('Salvage_Value:', sample.Salvage_Value, 'Type:', typeof sample.Salvage_Value);
    console.log('Annual_Overhead_rate:', sample.Annual_Overhead_rate, 'Type:', typeof sample.Annual_Overhead_rate);
    console.log('Annual_Overhaul_Parts_cost_rate:', sample.Annual_Overhaul_Parts_cost_rate, 'Type:', typeof sample.Annual_Overhaul_Parts_cost_rate);
    console.log('Annual_Field_Repair_Parts_and_misc_supply_parts_Cost_rate:', sample.Annual_Field_Repair_Parts_and_misc_supply_parts_Cost_rate, 'Type:', typeof sample.Annual_Field_Repair_Parts_and_misc_supply_parts_Cost_rate);
  }
  
  mongoose.disconnect();
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});




