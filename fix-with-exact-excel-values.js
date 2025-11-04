const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Read the original JSON file
const jsonFilePath = path.join(__dirname, 'frontend/src/assets/data/wheel_tractors.json');
let originalData = [];

try {
  const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
  originalData = JSON.parse(jsonData);
  console.log('Loaded original JSON data:', originalData.length, 'records');
} catch (error) {
  console.error('Error reading JSON file:', error.message);
  process.exit(1);
}

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
      // Get all documents and update them with correct values from original JSON
      const documents = await collection.find({}).toArray();
      
      for (const doc of documents) {
        // Find matching record in original JSON data
        const originalRecord = originalData.find(orig => 
          orig.Category === doc.Category &&
          orig.Sub_Category === doc.Sub_Category &&
          orig.Size === doc.Size
        );
        
        if (originalRecord) {
          const updates = {};
          
          // Convert percentage strings to decimal values
          if (originalRecord.Sales_Tax) {
            const salesTaxPercent = parseFloat(originalRecord.Sales_Tax.replace('%', ''));
            updates.Sales_Tax = Math.round((salesTaxPercent / 100) * 10000) / 10000; // 4 decimal places
          }
          
          if (originalRecord.Salvage_Value) {
            const salvagePercent = parseFloat(originalRecord.Salvage_Value.replace('%', ''));
            updates.Salvage_Value = Math.round((salvagePercent / 100) * 10000) / 10000; // 4 decimal places
          }
          
          // Calculate Annual_Overhead_rate from Annual_Overhead / Original_price
          if (originalRecord.Annual_Overhead && originalRecord.Original_price) {
            const overheadRate = originalRecord.Annual_Overhead / originalRecord.Original_price;
            updates.Annual_Overhead_rate = Math.round(overheadRate * 10000) / 10000; // 4 decimal places
          }
          
          // Calculate Annual_Overhaul_Parts_cost_rate from Annual_Overhaul_Parts_Cost / Original_price
          if (originalRecord.Annual_Overhaul_Parts_Cost && originalRecord.Original_price) {
            const overhaulPartsRate = originalRecord.Annual_Overhaul_Parts_Cost / originalRecord.Original_price;
            updates.Annual_Overhaul_Parts_cost_rate = Math.round(overhaulPartsRate * 10000) / 10000; // 4 decimal places
          }
          
          // Calculate Annual_Field_Repair_Parts_and_misc_supply_parts_Cost_rate
          if (originalRecord.Annual_Field_Repair_Parts_Cost && originalRecord.Annual_Misc_Supply_Parts && originalRecord.Original_price) {
            const totalFieldPartsCost = originalRecord.Annual_Field_Repair_Parts_Cost + originalRecord.Annual_Misc_Supply_Parts;
            const fieldPartsRate = totalFieldPartsCost / originalRecord.Original_price;
            updates.Annual_Field_Repair_Parts_and_misc_supply_parts_Cost_rate = Math.round(fieldPartsRate * 10000) / 10000; // 4 decimal places
          }
          
          await collection.updateOne(
            { _id: doc._id },
            { $set: updates }
          );
        }
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
    console.log('Sales_Tax:', sample.Sales_Tax, '(from original JSON)');
    console.log('Salvage_Value:', sample.Salvage_Value, '(from original JSON)');
    console.log('Annual_Overhead_rate:', sample.Annual_Overhead_rate, '(calculated from original JSON)');
    console.log('Annual_Overhaul_Parts_cost_rate:', sample.Annual_Overhaul_Parts_cost_rate, '(calculated from original JSON)');
    console.log('Annual_Field_Repair_Parts_and_misc_supply_parts_Cost_rate:', sample.Annual_Field_Repair_Parts_and_misc_supply_parts_Cost_rate, '(calculated from original JSON)');
  }
  
  mongoose.disconnect();
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});




