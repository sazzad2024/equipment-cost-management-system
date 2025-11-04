# Complete Flow: From Equipment Selection to Calculator Summary

This document shows the complete code flow from the very beginning (equipment selection) to the Calculator Summary section.

---

## STEP 1: Equipment List - User Selects Equipment

**File:** `frontend/src/app/equipment-list/equipment-list.component.ts`

When user double-clicks on an equipment card:

```typescript
// Line 157-160
onEquipmentCardDoubleClick(equipment: Equipment) {
  if (this.isManageEquipment) return;
  this.router.navigate(['/county-selection'], { state: { equipment } });
}
```

**What happens:**
- Equipment data is passed via router state to County Selection page
- Equipment object contains all database fields (Category, Sub_Category, Size, Original_price, etc.)

---

## STEP 2: County Selection - User Selects County & Quarter

**File:** `frontend/src/app/county-selection/county-selection.component.ts`

```typescript
// Line 91-104
onCountySelect() {
  if (this.selectedCounty) {
    this.storageService.setItem('selectedCounty', this.selectedCounty);
    const equipment = history.state.equipment || null;

    this.router.navigate(['/equipment-details'], {
      state: {
        county: this.selectedCounty,
        quarter: this.selectedQuarter,
        equipment: equipment  // Pass equipment data forward
      }
    });
  }
}
```

**What happens:**
- County and Quarter are selected
- Equipment data is preserved and passed to Equipment Details page

---

## STEP 3: Equipment Details - Load Equipment & Calculate Costs

**File:** `frontend/src/app/equipment-details/equipment-details.component.ts`

### 3.1: Initialize Component (ngOnInit)

```typescript
// Line 76-133
ngOnInit(): void {
  // Get equipment from router state
  this.equipment = history.state.equipment || this.storageService.getItem('selectedEquipment');

  if (!this.equipment) {
    this.router.navigate(['/equipment-list']);
    return;
  }

  // Get County and Quarter from state
  this.selectedCounty = history.state.county || this.storageService.getItem('selectedCounty') || 'Not Selected';
  this.selectedQuarter = history.state.quarter || this.storageService.getItem('selectedQuarter') || 'Not Selected';

  // Get fuel type from equipment
  const fuelCode = this.equipment?.['Reimbursable Fuel_type (1 diesel, 2 gas, 3 other)'];
  this.selectedFuelType = fuelCode ? fuelCode.toString() : '3';

  // Fetch fuel price from MongoDB
  this.setFuelUnitPriceFromMongo();

  // Format decimal fields to 4 decimals
  this.formatDecimalFields();

  // Calculate all default values
  this.calculateDefaultValues();
}
```

### 3.2: Fetch Fuel Price from MongoDB

```typescript
// Line 135-155
private setFuelUnitPriceFromMongo(): void {
  const fuelTypeLabel = this.getFuelTypeLabel();
  
  this.fuelPriceService.getFuelPrice(this.selectedCounty, this.selectedQuarter, fuelTypeLabel)
    .subscribe({
      next: (response) => {
        const price = parseFloat(response.fuelPrice);
        this.selectedFuelUnitPrice = price;
        
        if (this.equipment) {
          this.equipment.Fuel_unit_price = price;
          this.calculateFuelCost();
          this.calculateTotalOperatingCost();
        }
      },
      error: (err) => {
        console.error('Fuel price fetch failed:', err);
      }
    });
}
```

### 3.3: Calculate Default Values (Ownership & Operating Costs)

```typescript
// Line 206-327
private calculateDefaultValues(): void {
  if (this.equipment) {
    this.calculateTotalOperatingCost();
    
    if (this.equipment !== undefined && this.ModelYear !== undefined) {
      const denominator = this.equipment.Economic_Life_in_months / 12;

      // Calculate Current Market Resale Value
      this.equipment.Current_Market_Year_Resale_Value = Math.round(
        denominator
          ? Math.max(
              this.equipment.Original_price -
                ((this.currYear - this.ModelYear) *
                  this.equipment.Original_price *
                  (1 - this.equipment.Salvage_Value)) /
                  denominator,
              this.equipment.Original_price * this.equipment.Salvage_Value
            )
          : 0
      );

      // Calculate Ownership Costs (Monthly)
      this.equipment.Depreciation_Ownership_cost_Monthly =
        (this.equipment.Original_price *
          (1 + this.equipment.Sales_Tax) *
          (1 - this.equipment.Discount) *
          (1 - this.equipment.Salvage_Value) +
          this.equipment.Initial_Freight_cost *
            this.equipment.Original_price) /
        this.equipment.Economic_Life_in_months /
        this.equipment.Usage_rate;

      this.equipment.Cost_of_Facilities_Capital_Ownership_cost_Monthly =
        (this.equipment.Cost_of_Capital_rate *
          this.equipment.Original_price) /
        12 /
        this.equipment.Usage_rate;

      this.equipment.Overhead_Ownership_cost_Monthly =
        (this.equipment.Annual_Overhead_rate *
          this.equipment.Current_Market_Year_Resale_Value) /
        12 /
        this.equipment.Usage_rate;

      this.equipment.Overhaul_Labor_Ownership_cost_Monthly =
        (this.equipment.Hourly_Wage *
          this.equipment.Annual_Overhaul_Labor_Hours) /
        12 /
        this.equipment.Usage_rate;

      this.equipment.Overhaul_Parts_Ownership_cost_Monthly =
        (this.equipment.Annual_Overhaul_Parts_cost_rate *
          this.equipment.Original_price) /
        12 /
        this.equipment.Usage_rate;

      // ⭐ CALCULATE TOTAL OWNERSHIP COST (HOURLY) - This becomes unadjustedRate
      this.equipment.Total_ownership_cost_hourly =
        (this.equipment.Depreciation_Ownership_cost_Monthly +
          this.equipment.Cost_of_Facilities_Capital_Ownership_cost_Monthly +
          this.equipment.Overhead_Ownership_cost_Monthly +
          this.equipment.Overhaul_Labor_Ownership_cost_Monthly +
          this.equipment.Overhaul_Parts_Ownership_cost_Monthly) /
        176;

      // Calculate Operating Costs (Hourly)
      this.equipment.Field_Labor_Operating_cost_Hourly =
        (this.equipment.Annual_Field_Labor_Hours *
          this.equipment.Hourly_Wage) /
        12 /
        this.equipment.Monthly_use_hours;

      this.equipment.Field_Parts_Operating_cost_Hourly =
        (this.equipment
          .Annual_Field_Repair_Parts_and_misc_supply_parts_Cost_rate *
          this.equipment.Original_price) /
        12 /
        this.equipment.Monthly_use_hours;

      this.equipment.Ground_Engaging_Component_Cost_Operating_cost_Hourly =
        (this.equipment.Annual_Ground_Engaging_Component_rate *
          this.equipment.Original_price) /
        12 /
        this.equipment.Monthly_use_hours;

      this.equipment.Fuel_by_horse_power_Operating_cost_Hourly =
        (Number(this.selectedFuelType) === 1
          ? 0.04
          : Number(this.selectedFuelType) === 2
          ? 0.06
          : 0) *
        this.equipment.Horse_power *
        this.equipment.Fuel_unit_price;

      this.equipment.Tire_Costs_Operating_cost_Hourly =
        this.equipment.Tire_Life_Hours === 0
          ? 0
          : this.equipment.Cost_of_A_New_Set_of_Tires /
            this.equipment.Tire_Life_Hours;

      // ⭐ CALCULATE TOTAL OPERATING COST - This becomes operCost
      this.equipment.Total_operating_cost =
        this.equipment.Field_Labor_Operating_cost_Hourly +
        this.equipment.Field_Parts_Operating_cost_Hourly +
        this.equipment.Ground_Engaging_Component_Cost_Operating_cost_Hourly +
        this.equipment.Lube_Operating_cost_Hourly +
        this.equipment.Fuel_by_horse_power_Operating_cost_Hourly +
        this.equipment.Tire_Costs_Operating_cost_Hourly;

      this.equipment.Total_cost_recovery =
        this.equipment.Total_ownership_cost_hourly +
        this.equipment.Total_operating_cost;
    }
  }
}
```

### 3.4: Navigate to Calculator with Calculated Values

```typescript
// Line 329-345
onCalculateCostsClicked(btnType?: string) {
  if (btnType === 'calculate' && this.equipment) {
    this.router.navigate([
      '/calculator',
      {
        modelYear: this.ModelYear,
        unadjustedRate: this.equipment.Total_ownership_cost_hourly,  // ⭐ From calculation
        operCost: this.equipment.Total_operating_cost,                  // ⭐ From calculation
        selectedItem: JSON.stringify(this.equipment),
        selectedCounty: this.selectedCounty,
        selectedQuarter: this.selectedQuarter,
      },
    ]);
  } else if (btnType === 'view' && this.equipment) {
    this.calculateDefaultValues();
  }
}
```

**Key Values Passed:**
- `unadjustedRate`: `equipment.Total_ownership_cost_hourly` (calculated hourly ownership cost)
- `operCost`: `equipment.Total_operating_cost` (calculated hourly operating cost)
- `modelYear`: Model year from equipment
- `selectedItem`: Full equipment object as JSON string
- `selectedCounty`: Selected county
- `selectedQuarter`: Selected quarter

---

## STEP 4: Calculator Component - Receive Values & Calculate Rates

**File:** `frontend/src/app/calculator/calculator.component.ts`

### 4.1: Initialize Calculator (ngOnInit)

```typescript
// Line 37-107
ngOnInit(): void {
  this.route.paramMap.subscribe((params) => {
    // Extract values from route parameters
    const unadjustedRateParam = params.get('unadjustedRate');
    const operCostparam = params.get('operCost');
    const selectItem = params.get('selectedItem');
    const modelYear = params.get('modelYear');
    const selectedCounty = params.get('selectedCounty');
    const selectedQuarter = params.get('selectedQuarter');

    if (
      unadjustedRateParam !== null &&
      operCostparam !== null &&
      selectItem &&
      modelYear
    ) {
      this.modelYear = +modelYear;
      this.selectedItem = JSON.parse(selectItem) as Equipment;
      
      // ⭐ Set unadjustedRate: Multiply by 176 (standard monthly hours)
      this.unadjustedRate = +unadjustedRateParam * 176;
      
      // ⭐ Set operCost directly
      this.operCost = +operCostparam;
      
      this.unadjustedRate = this.roundTo(this.unadjustedRate, 2);
      this.operCost = this.roundTo(this.operCost, 2);
      
      // Calculate rates
      this.updateRate();
      this.updateStandByRate();
    }

    // Get County and Quarter from route params
    if (selectedCounty) {
      this.modelCounty = selectedCounty;
    }
    if (selectedQuarter) {
      this.modelQuarter = selectedQuarter;
      // Extract year from quarter if not already set
      if (!this.modelYear) {
        const yearMatch = selectedQuarter.match(/(\d{4})/);
        if (yearMatch) {
          this.modelYear = +yearMatch[1];
        }
      }
    }
  });
}
```

### 4.2: Component Properties (Default Values)

```typescript
// Line 109-136
modelYear?: number;
unadjustedRate: number = 0;           // ⭐ From equipment.Total_ownership_cost_hourly * 176
modelRate: number = 100;               // Default: 100% (user can adjust)
regionalRate: number = 100;            // Default: 100% (user can adjust)
rateUsed: number = 0;                   // ⭐ Calculated: FHWA Rate
hours: number = 176;                   // Default: 176 (standard monthly hours)
operCost: number = 0;                   // ⭐ From equipment.Total_operating_cost
operCostMultiplier: number = 0.5;      // Default: 0.5 (user can adjust)
standByRate: number = 0;               // ⭐ Calculated: Standby Rate
selectedItem?: Equipment;
modelCounty: string = '';
modelQuarter: string = '';
```

### 4.3: Calculate FHWA Rate (rateUsed)

```typescript
// Line 178-187
updateRate() {
  this.rateUsed = Number(
    (this.unadjustedRate *
      (this.modelRate / 100) *
      (this.regionalRate / 100)) /
      this.hours +
      Number(this.operCost)
  );
  // Use full precision, no rounding
}
```

**Formula:**
```
rateUsed = (unadjustedRate × (modelRate/100) × (regionalRate/100)) / hours + operCost
```

**Example:**
- `unadjustedRate` = 1000 (from equipment calculation × 176)
- `modelRate` = 100%
- `regionalRate` = 100%
- `hours` = 176
- `operCost` = 50

```
rateUsed = (1000 × 1.0 × 1.0) / 176 + 50
         = 1000 / 176 + 50
         = 5.68 + 50
         = 55.68 per hour
```

### 4.4: Calculate Standby Rate (standByRate)

```typescript
// Line 189-198
updateStandByRate() {
  this.standByRate = Number(
    ((this.unadjustedRate *
      (this.modelRate / 100) *
      (this.regionalRate / 100)) /
      this.hours) *
      Number(this.operCostMultiplier)
  );
  // Use full precision, no rounding
}
```

**Formula:**
```
standByRate = ((unadjustedRate × (modelRate/100) × (regionalRate/100)) / hours) × operCostMultiplier
```

**Example:**
- Same values as above
- `operCostMultiplier` = 0.5

```
standByRate = (1000 × 1.0 × 1.0) / 176 × 0.5
            = 1000 / 176 × 0.5
            = 5.68 × 0.5
            = 2.84 per hour
```

---

## STEP 5: Summary Section - Display All Values

**File:** `frontend/src/app/calculator/calculator.component.ts` (printCalculator method)

```typescript
// Line 407-417
<div style="margin-top: 30px; text-align: center;">
  <h3>Summary</h3>
  <p><strong>FHWA Rate:</strong> $${this.rateUsed?.toFixed(2)} per hour</p>
  <p><strong>Standby Rate:</strong> $${this.standByRate?.toFixed(2)} per hour</p>
  <p><strong>Unadjusted Rate:</strong> $${this.unadjustedRate}</p>
  <p><strong>Model Rate Adjustment:</strong> ${this.modelRate}%</p>
  <p><strong>Regional Rate Adjustment:</strong> ${this.regionalRate}%</p>
  <p><strong>Hours:</strong> ${this.hours}</p>
  <p><strong>Operation Cost:</strong> $${this.operCost}</p>
  <p><strong>Operation Cost Multiplier:</strong> ${this.operCostMultiplier}</p>
</div>
```

---

## BACKEND: How Values Are Calculated in Database

**File:** `backend/app/controllers/data.controller.js`

### Database Calculation Function

```javascript
// Line 926-980
const calculateDefaultValues = (equipment, latestYear, ModelYear) => {
  if (!equipment) return;
  equipment = transformEquipmentData(equipment);
  const denominator = (equipment.Economic_Life_in_months / 12);
  
  // Calculate Current Market Resale Value
  equipment.Current_Market_Year_Resale_Value = Math.round(
    denominator ?
      Math.max(
        equipment.Original_price - ((latestYear - ModelYear) * equipment.Original_price * (1 - equipment.Salvage_Value)) / denominator,
        equipment.Original_price * equipment.Salvage_Value
      )
      : 0
  );
  
  equipment.Usage_rate = equipment.Monthly_use_hours / 176;

  // Ownership Costs (Monthly)
  equipment.Depreciation_Ownership_cost_Monthly = 
    (equipment.Original_price * (1 + equipment.Sales_Tax) * (1 - equipment.Discount) * (1 - equipment.Salvage_Value) + 
     (equipment.Initial_Freight_cost * equipment.Original_price)) / 
    equipment.Economic_Life_in_months / 
    equipment.Usage_rate;
  
  equipment.Cost_of_Facilities_Capital_Ownership_cost_Monthly = 
    equipment.Cost_of_Capital_rate * equipment.Original_price / 12 / equipment.Usage_rate;
  
  equipment.Overhead_Ownership_cost_Monthly = 
    equipment.Annual_Overhead_rate * equipment.Current_Market_Year_Resale_Value / 12 / equipment.Usage_rate;
  
  equipment.Overhaul_Labor_Ownership_cost_Monthly = 
    equipment.Hourly_Wage * equipment.Annual_Overhaul_Labor_Hours / 12 / equipment.Usage_rate;
  
  equipment.Overhaul_Parts_Ownership_cost_Monthly = 
    equipment.Annual_Overhaul_Parts_cost_rate * equipment.Original_price / 12 / equipment.Usage_rate;

  // ⭐ TOTAL OWNERSHIP COST (HOURLY) - This is what becomes unadjustedRate
  equipment.Total_ownership_cost_hourly = 
    (equipment.Depreciation_Ownership_cost_Monthly + 
     equipment.Cost_of_Facilities_Capital_Ownership_cost_Monthly + 
     equipment.Overhead_Ownership_cost_Monthly + 
     equipment.Overhaul_Labor_Ownership_cost_Monthly + 
     equipment.Overhaul_Parts_Ownership_cost_Monthly) / 176;

  // Operating Costs (Hourly)
  equipment.Field_Labor_Operating_cost_Hourly = 
    equipment.Annual_Field_Labor_Hours * equipment.Hourly_Wage / 12 / equipment.Monthly_use_hours;
  
  equipment.Field_Parts_Operating_cost_Hourly = 
    equipment.Annual_Field_Repair_Parts_and_misc_supply_parts_Cost_rate * equipment.Original_price / 12 / equipment.Monthly_use_hours;
  
  equipment.Ground_Engaging_Component_Cost_Operating_cost_Hourly = 
    equipment.Annual_Ground_Engaging_Component_rate * equipment.Original_price / 12 / equipment.Monthly_use_hours;
  
  equipment.Fuel_by_horse_power_Operating_cost_Hourly = 
    fuelMultiplier * equipment.Horse_power * equipment.Fuel_unit_price;

  equipment.Tire_Costs_Operating_cost_Hourly = 
    (equipment.Cost_of_A_New_Set_of_Tires && equipment.Tire_Life_Hours) ? 
    equipment.Cost_of_A_New_Set_of_Tires / equipment.Tire_Life_Hours : 0;

  // ⭐ TOTAL OPERATING COST - This is what becomes operCost
  equipment.Total_operating_cost = 
    equipment.Field_Labor_Operating_cost_Hourly + 
    equipment.Field_Parts_Operating_cost_Hourly + 
    equipment.Ground_Engaging_Component_Cost_Operating_cost_Hourly + 
    equipment.Lube_Operating_cost_Hourly + 
    equipment.Fuel_by_horse_power_Operating_cost_Hourly + 
    equipment.Tire_Costs_Operating_cost_Hourly;

  equipment.Total_cost_recovery = 
    equipment.Total_ownership_cost_hourly + 
    equipment.Total_operating_cost;

  return equipment;
};
```

---

## COMPLETE DATA FLOW DIAGRAM

```
1. User selects equipment
   ↓
2. County Selection page
   ↓
3. Equipment Details page
   ├─ Fetch equipment from MongoDB
   ├─ Fetch fuel price from MongoDB
   ├─ Calculate Ownership Costs (Monthly)
   │  ├─ Depreciation
   │  ├─ Capital Cost
   │  ├─ Overhead
   │  ├─ Overhaul Labor
   │  └─ Overhaul Parts
   ├─ Calculate Total Ownership Cost (Hourly) = Sum of all ownership costs / 176
   │  ⭐ This becomes: unadjustedRate
   ├─ Calculate Operating Costs (Hourly)
   │  ├─ Field Labor
   │  ├─ Field Parts
   │  ├─ Ground Engaging Component
   │  ├─ Lube
   │  ├─ Fuel
   │  └─ Tire
   └─ Calculate Total Operating Cost = Sum of all operating costs
      ⭐ This becomes: operCost
   ↓
4. Navigate to Calculator with:
   - unadjustedRate (Total_ownership_cost_hourly × 176)
   - operCost (Total_operating_cost)
   - modelYear
   - selectedItem (full equipment object)
   ↓
5. Calculator Component
   ├─ Receive values from route params
   ├─ Calculate FHWA Rate (rateUsed):
   │  rateUsed = (unadjustedRate × (modelRate/100) × (regionalRate/100)) / hours + operCost
   ├─ Calculate Standby Rate (standByRate):
   │  standByRate = ((unadjustedRate × (modelRate/100) × (regionalRate/100)) / hours) × operCostMultiplier
   └─ Display Summary:
      ├─ FHWA Rate
      ├─ Standby Rate
      ├─ Unadjusted Rate
      ├─ Model Rate Adjustment
      ├─ Regional Rate Adjustment
      ├─ Hours
      ├─ Operation Cost
      └─ Operation Cost Multiplier
```

---

## KEY VALUES SUMMARY

| Value | Source | Calculation |
|-------|--------|-------------|
| **unadjustedRate** | `equipment.Total_ownership_cost_hourly` | `(Sum of Ownership Costs Monthly) / 176 × 176` |
| **operCost** | `equipment.Total_operating_cost` | `Sum of all Operating Costs` |
| **rateUsed** (FHWA) | Calculated in Calculator | `(unadjustedRate × modelRate% × regionalRate%) / hours + operCost` |
| **standByRate** | Calculated in Calculator | `((unadjustedRate × modelRate% × regionalRate%) / hours) × operCostMultiplier` |
| **modelRate** | User input | Default: 100% |
| **regionalRate** | User input | Default: 100% |
| **hours** | User input | Default: 176 |
| **operCostMultiplier** | User input | Default: 0.5 |

---

This is the complete flow from equipment selection to the Calculator Summary section!

