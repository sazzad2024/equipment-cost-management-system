const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://alamakmsazzadul_db_user:jybG7nHWYVPbcuic@idot-project.kvjtojk.mongodb.net/bezkoder_db';

// Models
const FuelPrice = require('./app/models/fuel.model');
const Modeldata = require('./app/models/data.model');

async function uploadData() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB Atlas');

    // 1. Upload Fuel Price Data (CSV)
    console.log('\n📊 Uploading Fuel Price Data...');
    await uploadFuelPrices();

    // 2. Upload Equipment Data (JSON)
    console.log('\n🚜 Uploading Equipment Data...');
    await uploadEquipmentData();

    console.log('\n🎉 All data uploaded successfully!');
    console.log('📈 Your MongoDB now contains:');
    console.log('   - Fuel prices for all counties and quarters');
    console.log('   - Equipment data for multiple years');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

async function uploadFuelPrices() {
  const csvPath = path.join(__dirname, '../frontend/src/assets/data/illinois_fuel_prices.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.log('⚠️  Fuel prices CSV file not found');
    return;
  }

  const csvContent = fs.readFileSync(csvPath, 'utf8');
  
  Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      const fuelData = results.data;
      console.log(`📋 Found ${fuelData.length} fuel price records`);

      // Clear existing fuel data
      await FuelPrice.deleteMany({});
      console.log('🗑️  Cleared existing fuel price data');

      // Insert new fuel data
      const bulkOps = fuelData.map(record => ({
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
      console.log('✅ Fuel price data uploaded successfully');
    }
  });
}

async function uploadEquipmentData() {
  const jsonPath = path.join(__dirname, '../frontend/src/assets/data/wheel_tractors.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.log('⚠️  Equipment JSON file not found');
    return;
  }

  const equipmentData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`📋 Found ${equipmentData.length} equipment records`);

  // Group equipment by year (assuming ModelYear field exists)
  const equipmentByYear = {};
  
  equipmentData.forEach(equipment => {
    // Extract year from equipment data or use a default year
    const year = equipment.ModelYear || equipment.Year || '2023';
    
    if (!equipmentByYear[year]) {
      equipmentByYear[year] = [];
    }
    
    // Clean and format equipment data
    const cleanEquipment = {
      Category: equipment.Category || '',
      Sub_Category: equipment.Sub_Category || '',
      Size: equipment.Size || '',
      Reimbursable: parseFloat(equipment.Reimbursable) || 0,
      Fuel_type: parseInt(equipment.Fuel_type) || 0,
      Fuel_unit_price: parseFloat(equipment.Fuel_unit_price) || 0,
      Original_price: parseFloat(equipment.Original_price) || 0,
      Sales_Tax: parseFloat(equipment.Sales_Tax) || 0,
      Discount: parseFloat(equipment.Discount) || 0,
      Salvage_Value: parseFloat(equipment.Salvage_Value) || 0,
      Current_Market_Year_Resale_Value: parseFloat(equipment.Current_Market_Year_Resale_Value) || 0,
      Annual_Overhaul_Labor_Hours: parseFloat(equipment.Annual_Overhaul_Labor_Hours) || 0,
      Annual_Field_Labor_Hours: parseFloat(equipment.Annual_Field_Labor_Hours) || 0,
      Cost_of_A_New_Set_of_Tires: parseFloat(equipment.Cost_of_A_New_Set_of_Tires) || 0,
      Tire_Life_Hours: parseFloat(equipment.Tire_Life_Hours) || 0,
      Hourly_Lube_Costs: parseFloat(equipment.Hourly_Lube_Costs) || 0,
      Hourly_Wage: parseFloat(equipment.Hourly_Wage) || 0,
      Adjustment_for_fuel_cost: parseFloat(equipment.Adjustment_for_fuel_cost) || 0,
      Horse_power: parseFloat(equipment.Horse_power) || 0,
      Economic_Life_in_months: parseFloat(equipment.Economic_Life_in_months) || 0,
      Monthly_use_hours: parseFloat(equipment.Monthly_use_hours) || 0,
      Usage_rate: parseFloat(equipment.Usage_rate) || 0,
      Initial_Freight_cost: parseFloat(equipment.Initial_Freight_cost) || 0,
      Annual_Overhead_rate: parseFloat(equipment.Annual_Overhead_rate) || 0,
      Annual_Overhaul_Parts_cost_rate: parseFloat(equipment.Annual_Overhaul_Parts_cost_rate) || 0,
      Annual_Field_Repair_Parts_and_misc_supply_parts_Cost_rate: parseFloat(equipment.Annual_Field_Repair_Parts_and_misc_supply_parts_Cost_rate) || 0,
      Annual_Ground_Engaging_Component_rate: parseFloat(equipment.Annual_Ground_Engaging_Component_rate) || 0,
      Cost_of_Capital_rate: parseFloat(equipment.Cost_of_Capital_rate) || 0,
      Depreciation_Ownership_cost_Monthly: parseFloat(equipment.Depreciation_Ownership_cost_Monthly) || 0,
      Cost_of_Facilities_Capital_Ownership_cost_Monthly: parseFloat(equipment.Cost_of_Facilities_Capital_Ownership_cost_Monthly) || 0,
      Overhead_Ownership_cost_Monthly: parseFloat(equipment.Overhead_Ownership_cost_Monthly) || 0,
      Overhaul_Labor_Ownership_cost_Monthly: parseFloat(equipment.Overhaul_Labor_Ownership_cost_Monthly) || 0,
      Overhaul_Parts_Ownership_cost_Monthly: parseFloat(equipment.Overhaul_Parts_Ownership_cost_Monthly) || 0,
      Total_ownership_cost_hourly: parseFloat(equipment.Total_ownership_cost_hourly) || 0,
      Field_Labor_Operating_cost_Hourly: parseFloat(equipment.Field_Labor_Operating_cost_Hourly) || 0,
      Field_Parts_Operating_cost_Hourly: parseFloat(equipment.Field_Parts_Operating_cost_Hourly) || 0,
      Ground_Engaging_Component_Cost_Operating_cost_Hourly: parseFloat(equipment.Ground_Engaging_Component_Cost_Operating_cost_Hourly) || 0,
      Lube_Operating_cost_Hourly: parseFloat(equipment.Lube_Operating_cost_Hourly) || 0,
      Fuel_by_horse_power_Operating_cost_Hourly: parseFloat(equipment.Fuel_by_horse_power_Operating_cost_Hourly) || 0,
      Tire_Costs_Operating_cost_Hourly: parseFloat(equipment.Tire_Costs_Operating_cost_Hourly) || 0,
      Total_operating_cost: parseFloat(equipment.Total_operating_cost) || 0,
      Total_cost_recovery: parseFloat(equipment.Total_cost_recovery) || 0
    };
    
    equipmentByYear[year].push(cleanEquipment);
  });

  // Upload equipment data by year
  for (const [year, equipment] of Object.entries(equipmentByYear)) {
    console.log(`📅 Uploading ${equipment.length} equipment records for year ${year}`);
    
    // Create year-specific collection
    const YearCollection = mongoose.connection.db.collection(year);
    
    // Clear existing data for this year
    await YearCollection.deleteMany({});
    
    // Insert new data
    await YearCollection.insertMany(equipment);
    console.log(`✅ Year ${year} equipment data uploaded successfully`);
  }

  console.log(`🎯 Equipment data uploaded for ${Object.keys(equipmentByYear).length} years`);
}

// Run the upload
uploadData().catch(console.error);





