const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://alamakmsazzadul_db_user:jybG7nHWYVPbcuic@idot-project.kvjtojk.mongodb.net/bezkoder_db';

async function generateAllYears() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Get the base equipment data from 2023
    const baseYear = '2023';
    const baseCollection = mongoose.connection.db.collection(baseYear);
    const baseData = await baseCollection.find({}).toArray();
    
    if (baseData.length === 0) {
      console.log('❌ No base data found for 2023. Please run the equipment upload first.');
      return;
    }

    console.log(`📋 Found ${baseData.length} base equipment records for ${baseYear}`);

    // Generate years 2003-2022 (going backwards from 2023)
    const yearsToGenerate = [];
    for (let year = 2003; year <= 2022; year++) {
      yearsToGenerate.push(year.toString());
    }

    // Also generate 2024-2025 (going forwards from 2023)
    for (let year = 2024; year <= 2025; year++) {
      yearsToGenerate.push(year.toString());
    }

    console.log(`🚀 Generating data for ${yearsToGenerate.length} years: ${yearsToGenerate.join(', ')}`);

    for (const year of yearsToGenerate) {
      console.log(`\n📅 Generating data for year ${year}...`);
      
      const yearCollection = mongoose.connection.db.collection(year);
      
      // Check if data already exists
      const existingData = await yearCollection.find({}).toArray();
      if (existingData.length > 0) {
        console.log(`⚠️  Year ${year} already has data (${existingData.length} records). Skipping.`);
        continue;
      }

      // Calculate price adjustment based on year difference
      const baseYearNum = parseInt(baseYear);
      const targetYearNum = parseInt(year);
      const yearDiff = targetYearNum - baseYearNum;
      
      // Apply 3% annual inflation/deflation
      const priceAdjustment = Math.pow(1.03, yearDiff);
      
      const adjustedData = baseData.map(equipment => {
        let adjusted = { ...equipment };
        
        // Adjust prices based on year difference
        adjusted.Original_price = Math.round(equipment.Original_price * priceAdjustment);
        adjusted.Current_Market_Year_Resale_Value = Math.round(equipment.Current_Market_Year_Resale_Value * priceAdjustment);
        
        // Recalculate costs based on adjusted prices
        adjusted = calculateDefaultValues(adjusted, year, year);
        
        return adjusted;
      });

      // Insert the adjusted data
      await yearCollection.insertMany(adjustedData);
      console.log(`✅ Generated ${adjustedData.length} equipment records for year ${year}`);
    }

    console.log('\n🎉 All years generated successfully!');
    console.log('📈 Your MongoDB now contains equipment data for years 2003-2025');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Simplified calculateDefaultValues function (based on the original)
function calculateDefaultValues(equipment, latestYear, ModelYear) {
  const adjusted = { ...equipment };
  
  // Basic calculations (simplified version)
  const originalPrice = parseFloat(adjusted.Original_price) || 0;
  const salesTax = parseFloat(adjusted.Sales_Tax) || 0;
  const discount = parseFloat(adjusted.Discount) || 0;
  const salvageValue = parseFloat(adjusted.Salvage_Value) || 0;
  const economicLifeMonths = parseFloat(adjusted.Economic_Life_in_months) || 0;
  const monthlyUseHours = parseFloat(adjusted.Monthly_use_hours) || 0;
  const usageRate = parseFloat(adjusted.Usage_rate) || 0;
  const hourlyWage = parseFloat(adjusted.Hourly_Wage) || 0;
  const horsePower = parseFloat(adjusted.Horse_power) || 0;
  const fuelUnitPrice = parseFloat(adjusted.Fuel_unit_price) || 0;
  
  // Calculate basic costs
  const purchasePrice = originalPrice * (1 + salesTax) * (1 - discount);
  const depreciationMonthly = (purchasePrice * (1 - salvageValue)) / economicLifeMonths;
  const usageRateAdjusted = monthlyUseHours / 176; // Assuming 176 hours per month
  
  // Set calculated values
  adjusted.Depreciation_Ownership_cost_Monthly = depreciationMonthly;
  adjusted.Cost_of_Facilities_Capital_Ownership_cost_Monthly = depreciationMonthly * 0.1;
  adjusted.Overhead_Ownership_cost_Monthly = (adjusted.Annual_Overhead_rate * originalPrice) / 12 / usageRateAdjusted;
  adjusted.Overhaul_Labor_Ownership_cost_Monthly = (adjusted.Annual_Overhaul_Labor_Hours * hourlyWage) / 12;
  adjusted.Overhaul_Parts_Ownership_cost_Monthly = (adjusted.Annual_Overhaul_Parts_cost_rate * originalPrice) / 12;
  
  // Total ownership costs
  const totalOwnershipMonthly = 
    adjusted.Depreciation_Ownership_cost_Monthly +
    adjusted.Cost_of_Facilities_Capital_Ownership_cost_Monthly +
    adjusted.Overhead_Ownership_cost_Monthly +
    adjusted.Overhaul_Labor_Ownership_cost_Monthly +
    adjusted.Overhaul_Parts_Ownership_cost_Monthly;
  
  adjusted.Total_ownership_cost_hourly = totalOwnershipMonthly / monthlyUseHours;
  
  // Operating costs
  adjusted.Field_Labor_Operating_cost_Hourly = hourlyWage;
  adjusted.Field_Parts_Operating_cost_Hourly = (adjusted.Annual_Field_Repair_Parts_and_misc_supply_parts_Cost_rate * originalPrice) / (monthlyUseHours * 12);
  adjusted.Ground_Engaging_Component_Cost_Operating_cost_Hourly = (adjusted.Annual_Ground_Engaging_Component_rate * originalPrice) / (monthlyUseHours * 12);
  adjusted.Lube_Operating_cost_Hourly = adjusted.Hourly_Lube_Costs || 0;
  adjusted.Fuel_by_horse_power_Operating_cost_Hourly = (horsePower * fuelUnitPrice * 0.06); // Assuming 0.06 gallons per HP per hour
  adjusted.Tire_Costs_Operating_cost_Hourly = (adjusted.Cost_of_A_New_Set_of_Tires / adjusted.Tire_Life_Hours) || 0;
  
  // Total operating cost
  const totalOperatingHourly = 
    adjusted.Field_Labor_Operating_cost_Hourly +
    adjusted.Field_Parts_Operating_cost_Hourly +
    adjusted.Ground_Engaging_Component_Cost_Operating_cost_Hourly +
    adjusted.Lube_Operating_cost_Hourly +
    adjusted.Fuel_by_horse_power_Operating_cost_Hourly +
    adjusted.Tire_Costs_Operating_cost_Hourly;
  
  adjusted.Total_operating_cost = totalOperatingHourly;
  adjusted.Total_cost_recovery = adjusted.Total_ownership_cost_hourly + totalOperatingHourly;
  
  return adjusted;
}

// Run the generation
generateAllYears().catch(console.error);
