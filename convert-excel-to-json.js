const XLSX = require('xlsx');
const fs = require('fs');

// Read the Excel file
const workbook = XLSX.readFile('Tool without 2026 Aug 9.xlsx');

// Get the first worksheet
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const jsonData = XLSX.utils.sheet_to_json(worksheet);

console.log('Excel file converted to JSON');
console.log('Total records:', jsonData.length);
console.log('Sample record:', JSON.stringify(jsonData[0], null, 2));

// Save to JSON file
fs.writeFileSync('tool-data.json', JSON.stringify(jsonData, null, 2));
console.log('Saved to tool-data.json');

// Show field names
if (jsonData.length > 0) {
  console.log('\nField names in Excel file:');
  Object.keys(jsonData[0]).forEach((field, index) => {
    console.log((index + 1) + '. ' + field);
  });
}




