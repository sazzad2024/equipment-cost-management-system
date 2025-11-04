const XLSX = require('xlsx');

// Read the Excel file
const workbook = XLSX.readFile('Tool without 2026 Aug 9.xlsx');

// Get the 2025 sheet
const worksheet = workbook.Sheets['2025'];

// Convert to JSON
const jsonData = XLSX.utils.sheet_to_json(worksheet);

console.log('2025 sheet data:');
console.log('Total records:', jsonData.length);

// Show first few actual data records (skip header row)
if (jsonData.length > 1) {
  console.log('\nFirst actual data record:');
  console.log(JSON.stringify(jsonData[1], null, 2));
  
  console.log('\nSecond actual data record:');
  console.log(JSON.stringify(jsonData[2], null, 2));
  
  // Show the specific fields we need to fix
  const sampleRecord = jsonData[1];
  console.log('\nKey fields from Excel 2025:');
  console.log('Sales_Tax:', sampleRecord['__EMPTY_4']);
  console.log('Salvage_Value:', sampleRecord['__EMPTY_6']);
  console.log('Annual_Overhead_rate:', sampleRecord['__EMPTY_20']);
  console.log('Annual_Overhaul_Parts_cost_rate:', sampleRecord['__EMPTY_21']);
  console.log('Annual_Field_Repair_Parts_and_misc_supply_parts_cost_rate:', sampleRecord['__EMPTY_22']);
}




