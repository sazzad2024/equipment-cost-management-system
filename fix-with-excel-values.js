const mongoose = require('mongoose');
const XLSX = require('xlsx');
require('dotenv').config();

// Read the Excel file
const workbook = XLSX.readFile('Tool without 2026 Aug 9.xlsx');

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
    
    // Check if Excel sheet exists for this year
    if (!workbook.SheetNames.includes(year)) {
      console.log('No Excel sheet found for year', year, '- skipping');
      continue;
    }
    
    const worksheet = workbook.Sheets[year];
    const excelData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log('Excel data for', year + ':', excelData.length, 'records');
    
    const collection = db.collection(year);
    const count = await collection.countDocuments();
    console.log('Database records in', year + ':', count);
    
    if (count > 0 && excelData.length > 1) {
      // Get all documents and update them with correct values from Excel
      const documents = await collection.find({}).toArray();
      
      for (const doc of documents) {
        // Find matching record in Excel data (skip header row)
        const excelRecord = excelData.find((excel, index) => {
          if (index === 0) return false; // Skip header row
          return excel['Model year'] === doc.Category &&
                 excel['2025'] === doc.Sub_Category &&
                 excel['__EMPTY'] === doc.Size;
        });
        
        if (excelRecord) {
          const updates = {};
          
          // Update Sales_Tax with exact Excel value
          if (excelRecord['__EMPTY_4'] !== undefined) {
            updates.Sales_Tax = Math.round(excelRecord['__EMPTY_4'] * 10000) / 10000; // 4 decimal places
          }
          
          // Update Salvage_Value with exact Excel value
          if (excelRecord['__EMPTY_6'] !== undefined) {
            updates.Salvage_Value = Math.round(excelRecord['__EMPTY_6'] * 10000) / 10000; // 4 decimal places
          }
          
          // Update Annual_Overhead_rate with exact Excel value
          if (excelRecord['__EMPTY_20'] !== undefined) {
            updates.Annual_Overhead_rate = Math.round(excelRecord['__EMPTY_20'] * 10000) / 10000; // 4 decimal places
          }
          
          // Update Annual_Overhaul_Parts_cost_rate with exact Excel value
          if (excelRecord['__EMPTY_21'] !== undefined) {
            updates.Annual_Overhaul_Parts_cost_rate = Math.round(excelRecord['__EMPTY_21'] * 10000) / 10000; // 4 decimal places
          }
          
          // Update Annual_Field_Repair_Parts_and_misc_supply_parts_Cost_rate with exact Excel value
          if (excelRecord['__EMPTY_22'] !== undefined) {
            updates.Annual_Field_Repair_Parts_and_misc_supply_parts_Cost_rate = Math.round(excelRecord['__EMPTY_22'] * 10000) / 10000; // 4 decimal places
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
    console.log('Sales_Tax:', sample.Sales_Tax, '(from Excel: should be 0.0625)');
    console.log('Salvage_Value:', sample.Salvage_Value, '(from Excel: should be 0.2)');
    console.log('Annual_Overhead_rate:', sample.Annual_Overhead_rate, '(from Excel: should be 0.041)');
    console.log('Annual_Overhaul_Parts_cost_rate:', sample.Annual_Overhaul_Parts_cost_rate, '(from Excel: should be 0.049)');
    console.log('Annual_Field_Repair_Parts_and_misc_supply_parts_Cost_rate:', sample.Annual_Field_Repair_Parts_and_misc_supply_parts_Cost_rate, '(from Excel: should be 0.056)');
  }
  
  mongoose.disconnect();
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});




