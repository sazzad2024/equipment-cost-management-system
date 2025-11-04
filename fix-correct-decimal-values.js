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
      // Get all documents and update them with correct values
      const documents = await collection.find({}).toArray();
      
      for (const doc of documents) {
        const updates = {};
        
        // Fix Sales_Tax: Should be 0.051 (5.1%)
        if (doc.Sales_Tax !== undefined) {
          updates.Sales_Tax = 0.051; // Fixed value from JSON: 5.1%
        }
        
        // Fix Salvage_Value: Should be 0.15 (15.0%)
        if (doc.Salvage_Value !== undefined) {
          updates.Salvage_Value = 0.15; // Fixed value from JSON: 15.0%
        }
        
        // Fix Annual_Overhead_rate: Calculate from Annual_Overhead / Original_price
        if (doc.Annual_Overhead !== undefined && doc.Original_price !== undefined) {
          const overheadRate = doc.Annual_Overhead / doc.Original_price;
          updates.Annual_Overhead_rate = Math.round(overheadRate * 10000) / 10000; // 4 decimal places
        }
        
        // Fix Annual_Overhaul_Parts_cost_rate: Should be 0.04 (4%)
        if (doc.Annual_Overhaul_Parts_cost_rate !== undefined) {
          updates.Annual_Overhaul_Parts_cost_rate = 0.04; // Fixed value: 4%
        }
        
        // Fix Annual_Field_Repair_Parts_and_misc_supply_parts_Cost_rate: Should be 0.03 (3%)
        if (doc.Annual_Field_Repair_Parts_and_misc_supply_parts_Cost_rate !== undefined) {
          updates.Annual_Field_Repair_Parts_and_misc_supply_parts_Cost_rate = 0.03; // Fixed value: 3%
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
    console.log('Sales_Tax:', sample.Sales_Tax, '(should be 0.051)');
    console.log('Salvage_Value:', sample.Salvage_Value, '(should be 0.15)');
    console.log('Annual_Overhead_rate:', sample.Annual_Overhead_rate, '(calculated from Annual_Overhead/Original_price)');
    console.log('Annual_Overhaul_Parts_cost_rate:', sample.Annual_Overhaul_Parts_cost_rate, '(should be 0.04)');
    console.log('Annual_Field_Repair_Parts_and_misc_supply_parts_Cost_rate:', sample.Annual_Field_Repair_Parts_and_misc_supply_parts_Cost_rate, '(should be 0.03)');
  }
  
  mongoose.disconnect();
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});




