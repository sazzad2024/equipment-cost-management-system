const path = require('path');
const mongoose = require('mongoose');
const ExcelJS = require('exceljs');

// Use the TEST database (same as EC2 uses)
const MONGODB_URI = 'mongodb+srv://alamakmsazzadul_db_user:jybG7nHWYVPbcuic@idot-project.kvjtojk.mongodb.net/test';

const EXCEL_PATH = path.resolve(__dirname, '..', '..', 'Tool without 2026 Aug 9.xlsx');
const COLLECTION_PREFIX = process.env.COLLECTION_PREFIX || '';
const CURRENT_YEAR_COLLECTION = COLLECTION_PREFIX
  ? `${COLLECTION_PREFIX}currentyear`
  : 'currentyear';

const HEADER_MAP = {
  Category: 'Category',
  Sub_Category: 'Sub_Category',
  Size: 'Size',
  'Reimbursable Fuel_type (1 diesel, 2 gas, 3 other)': 'Reimbursable Fuel_type (1 diesel, 2 gas, 3 other)',
  Fuel_unit_price: 'Fuel_unit_price',
  Original_price: 'Original_price',
  Sales_Tax: 'Sales_Tax',
  Discount: 'Discount',
  Salvage_Value: 'Salvage_Value',
  Current_Market_Year_Resale_Value: 'Current_Market_Year_Resale_Value',
  Annual_Overhaul_Labor_Hours: 'Annual_Overhaul_Labor_Hours',
  Annual_Field_Labor_Hours: 'Annual_Field_Labor_Hours',
  Cost_of_A_New_Set_of_Tires: 'Cost_of_A_New_Set_of_Tires',
  Tire_Life_Hours: 'Tire_Life_Hours',
  Hourly_Lube_Costs: 'Hourly_Lube_Costs',
  Hourly_Wage: 'Hourly_Wage',
  'Adjustment for fuel cost': 'Adjustment for fuel cost',
  Horse_power: 'Horse_power',
  Economic_Life_in_months: 'Economic_Life_in_months',
  Monthly_use_hours: 'Monthly_use_hours',
  Usage_rate: 'Usage_rate',
  Initial_Freight_cost_rate: 'Initial_Freight_cost',
  Annual_Overhead_rate: 'Annual_Overhead_rate',
  Annual_Overhaul_Parts_cost_rate: 'Annual_Overhaul_Parts_cost_rate',
  Annual_Field_Repair_Parts_and_misc_supply_parts_cost_rate: 'Annual_Field_Repair_Parts_and_misc_supply_parts_Cost_rate',
  Annual_Ground_Engaging_Component_rate: 'Annual_Ground_Engaging_Component_rate',
  Cost_of_Capital_rate: 'Cost_of_Capital_rate',
  Depreciation_Ownership_cost_Monthly: 'Depreciation_Ownership_cost_Monthly',
  Cost_of_Facilities_Capital_Ownership_cost_Monthly: 'Cost_of_Facilities_Capital_Ownership_cost_Monthly',
  Overhead_Ownership_cost_Monthly: 'Overhead_Ownership_cost_Monthly',
  Overhaul_Labor_Ownership_cost_Monthly: 'Overhaul_Labor_Ownership_cost_Monthly',
  Overhaul_Parts_Ownership_cost_Monthly: 'Overhaul_Parts_Ownership_cost_Monthly',
  Total_ownership_cost_hourly: 'Total_ownership_cost_hourly',
  Field_Labor_Operating_cost_Hourly: 'Field_Labor_Operating_cost_Hourly',
  Field_Parts_Operating_cost_Hourly: 'Field_Parts_Operating_cost_Hourly',
  Ground_Engaging_Component_Cost_Operating_cost_Hourly: 'Ground_Engaging_Component_Cost_Operating_cost_Hourly',
  Lube_Operating_cost_Hourly: 'Lube_Operating_cost_Hourly',
  Fuel_by_horse_power_Operating_cost_Hourly: 'Fuel_by_horse_power_Operating_cost_Hourly',
  Tire_Costs_Operating_cost_Hourly: 'Tire_Costs_Operating_cost_Hourly',
  Total_operating_cost: 'Total_operating_cost',
  Total_cost_recovery: 'Total_cost_recovery',
  Stand_by_rate: 'Stand_by_rate'
};

const STRING_FIELDS = new Set(['Category', 'Sub_Category', 'Size']);

async function main() {
  console.log('🔗 Connecting to MongoDB (TEST database)...');
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('✅ Connected to MongoDB');

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(EXCEL_PATH);

  const yearSheets = workbook.worksheets.filter((sheet) => {
    return /^\d{4}/.test(sheet.name);
  });

  if (!yearSheets.length) {
    console.warn('⚠️  No year worksheets found in the Excel file.');
    return;
  }

  for (const sheet of yearSheets) {
    const yearMatch = sheet.name.match(/\d{4}/);
    if (!yearMatch) {
      continue;
    }

    const numericYear = parseInt(yearMatch[0], 10);
    const collectionName = `${COLLECTION_PREFIX}${yearMatch[0]}`;
    console.log(`\n📄 Processing worksheet "${sheet.name}" -> collection "${collectionName}"`);

    const headerRow = sheet.getRow(2);
    const rawHeaders = headerRow.values.slice(1);
    const mappedHeaders = rawHeaders.map((header) => HEADER_MAP[header]);

    if (!mappedHeaders.every(Boolean)) {
      console.warn(`⚠️  Skipping worksheet "${sheet.name}" because some headers are unrecognised.`);
      continue;
    }

    const records = [];

    for (let rowNumber = 3; rowNumber <= sheet.rowCount; rowNumber++) {
      const row = sheet.getRow(rowNumber);
      if (row.cellCount === 0) {
        continue;
      }

      const record = { 'Model Year': numericYear };
      let hasCategory = false;

      mappedHeaders.forEach((targetKey, index) => {
        const cell = row.getCell(index + 1);
        const value = extractCellValue(cell);
        const normalized = normalizeValue(targetKey, value);
        if (targetKey === 'Category' && normalized) {
          hasCategory = true;
        }
        record[targetKey] = normalized;
      });

      if (hasCategory) {
        records.push(record);
      }
    }

    console.log(`   • Parsed ${records.length} records`);

    const collection = mongoose.connection.db.collection(collectionName);
    await collection.deleteMany({});
    console.log('   • Cleared existing collection data');

    if (records.length) {
      await collection.insertMany(records, { ordered: false });
      console.log('   • Inserted updated records');
    }
  }

  const yearPattern = new RegExp(`^${COLLECTION_PREFIX ? COLLECTION_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : ''}\\d{4}$`);

  const targetCollections = await mongoose.connection.db
    .listCollections({ name: yearPattern })
    .toArray();

  const latestYear = targetCollections
    .map((info) => parseInt(info.name.replace(COLLECTION_PREFIX, ''), 10))
    .filter((year) => !Number.isNaN(year))
    .sort((a, b) => b - a)[0];

  if (latestYear) {
    const currentYearCollection = mongoose.connection.db.collection(CURRENT_YEAR_COLLECTION);
    await currentYearCollection.deleteMany({});
    await currentYearCollection.insertOne({ year: latestYear });
    console.log(`\n🗓️  Updated currentyear to ${latestYear}`);
  }

  await mongoose.disconnect();
  console.log('\n✅ Import complete. MongoDB connection closed.');
}

function extractCellValue(cell) {
  if (!cell || cell.value === null || cell.value === undefined) {
    return null;
  }

  if (typeof cell.value === 'object') {
    if ('result' in cell.value) {
      return cell.value.result;
    }
    if ('text' in cell.value) {
      return cell.value.text;
    }
    if ('richText' in cell.value) {
      return cell.value.richText.map((chunk) => chunk.text).join('');
    }
  }

  return cell.value;
}

function normalizeValue(key, value) {
  if (value === null || value === undefined || value === '') {
    return STRING_FIELDS.has(key) ? '' : 0;
  }

  if (STRING_FIELDS.has(key)) {
    return String(value).trim();
  }

  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return 0;
  }

  return Number(numeric.toFixed(4));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Import failed:', error);
    process.exit(1);
  });




