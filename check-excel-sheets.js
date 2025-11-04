const XLSX = require('xlsx');
const fs = require('fs');

// Read the Excel file
const workbook = XLSX.readFile('Tool without 2026 Aug 9.xlsx');

console.log('Excel file sheets:');
workbook.SheetNames.forEach((sheetName, index) => {
  console.log((index + 1) + '. ' + sheetName);
});

// Check each sheet
workbook.SheetNames.forEach((sheetName) => {
  console.log('\n=== Sheet:', sheetName, '===');
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
  console.log('Records in this sheet:', jsonData.length);
  
  if (jsonData.length > 0) {
    console.log('Sample record:', JSON.stringify(jsonData[0], null, 2));
    console.log('Field names:');
    Object.keys(jsonData[0]).forEach((field, index) => {
      console.log((index + 1) + '. ' + field);
    });
  }
});




