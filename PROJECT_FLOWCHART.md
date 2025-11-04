# IDOT Project - Complete Flowchart

## 🏗️ Application Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Angular)                      │
│                    CloudFront CDN → S3 Bucket                  │
│                    https://dj42lwp4p3ce5.cloudfront.net         │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS
                            │ API Calls
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js/Express)                  │
│                    EC2 Instance: 13.220.51.254:8083             │
│                    - RESTful API                                │
│                    - JWT Authentication                          │
│                    - CORS Enabled                               │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ MongoDB Connection
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (MongoDB Atlas)                   │
│                    - Equipment Collections (2003-2025)          │
│                    - User Collection                             │
│                    - FuelPrices Collection                       │
│                    - SavedModels Collection                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
┌─────────────┐
│   User      │
│  Browser    │
└──────┬──────┘
       │
       │ 1. Navigate to /login
       ▼
┌─────────────────────────────────┐
│    LoginComponent               │
│  - Username & Password Input    │
└──────────────┬──────────────────┘
               │
               │ 2. Submit Form
               ▼
┌─────────────────────────────────┐
│    AuthService.login()          │
│  POST /api/auth/signin          │
└──────────────┬──────────────────┘
               │
               │ 3. HTTP Request
               ▼
┌─────────────────────────────────┐
│    Backend: AuthController      │
│  - Validate Credentials         │
│  - Check MongoDB User          │
│  - Compare Password (bcrypt)   │
└──────────────┬──────────────────┘
               │
               │ 4. Generate JWT
               ▼
┌─────────────────────────────────┐
│    Response: JWT Token          │
│  - Stored in HttpOnly Cookie    │
│  - User Data + Roles            │
└──────────────┬──────────────────┘
               │
               │ 5. Save to Storage
               ▼
┌─────────────────────────────────┐
│    StorageService.saveUser()    │
│  - Store in Session Storage     │
│  - Update UI State              │
└──────────────┬──────────────────┘
               │
               │ 6. Redirect
               ▼
┌─────────────────────────────────┐
│    HomeComponent / Dashboard    │
│  - Show Navigation Menu         │
│  - Display User Role           │
└─────────────────────────────────┘
```

---

## 📋 Main User Flow: Equipment Selection to Calculator

```
START
  │
  ▼
┌─────────────────────────────────────┐
│   Home Page                          │
│   - Login/Register                   │
│   - Navigation Menu                  │
└───────────┬──────────────────────────┘
            │
            │ Click "Equipment"
            ▼
┌─────────────────────────────────────┐
│   BoardAdminComponent                │
│   - Year Selection Dropdown         │
│   - Contractor Selection (optional)  │
└───────────┬──────────────────────────┘
            │
            │ Select Year → Load Equipment
            ▼
┌─────────────────────────────────────┐
│   EquipmentListComponent             │
│   - Filter: Category, Subcategory   │
│   - Filter: Size                     │
│   - Filter: Search                   │
│   - Exclude Caterpillar              │
│   - Display Equipment Cards          │
└───────────┬──────────────────────────┘
            │
            │ Double-Click Equipment Card
            ▼
┌─────────────────────────────────────┐
│   CountySelectionComponent           │
│   - Select County                    │
│   - Select Quarter                   │
│   - Pass Equipment Data Forward     │
└───────────┬──────────────────────────┘
            │
            │ Submit County & Quarter
            ▼
┌─────────────────────────────────────┐
│   EquipmentDetailsComponent          │
│   ┌─────────────────────────────┐   │
│   │ 1. Load Equipment Data      │   │
│   │ 2. Fetch Fuel Price from DB │   │
│   │ 3. Calculate Costs:          │   │
│   │    - Ownership Costs         │   │
│   │    - Operating Costs         │   │
│   │ 4. Display Form Fields       │   │
│   │ 5. Allow Edits (if Admin)   │   │
│   └─────────────────────────────┘   │
└───────────┬──────────────────────────┘
            │
            │ Click "Calculate Costs"
            ▼
┌─────────────────────────────────────┐
│   CalculatorComponent                │
│   ┌─────────────────────────────┐   │
│   │ 1. Receive:                  │   │
│   │    - unadjustedRate         │   │
│   │    - operCost               │   │
│   │    - equipment object       │   │
│   │ 2. Calculate:                │   │
│   │    - FHWA Rate              │   │
│   │    - Standby Rate           │   │
│   │ 3. Allow Adjustments:       │   │
│   │    - Model Rate %           │   │
│   │    - Regional Rate %        │   │
│   │ 4. Display Summary          │   │
│   │ 5. Save Model (optional)    │   │
│   └─────────────────────────────┘   │
└───────────┬──────────────────────────┘
            │
            │ Click "Save Model"
            ▼
┌─────────────────────────────────────┐
│   UserService.saveModel()           │
│   POST /api/test/savemodel         │
│   - Store in MongoDB               │
│   - Show Success Notification      │
└─────────────────────────────────────┘
            │
            │ View Saved Models
            ▼
┌─────────────────────────────────────┐
│   SavedModelsComponent               │
│   - Display All Saved Models       │
│   - Click to Navigate to Calculator │
└─────────────────────────────────────┘
```

---

## 🔄 Data Flow: Equipment Details Calculation

```
┌─────────────────────────────────────┐
│   Equipment Object (from DB)        │
│   - Original_price                  │
│   - Sales_Tax                       │
│   - Discount                        │
│   - Salvage_Value                   │
│   - Economic_Life_in_months         │
│   - Monthly_use_hours               │
│   - Hourly_Wage                     │
│   - Horse_power                     │
│   - ... (all fields)                │
└───────────┬──────────────────────────┘
            │
            │ calculateDefaultValues()
            ▼
┌─────────────────────────────────────┐
│   Step 1: Calculate Resale Value    │
│   Current_Market_Year_Resale_Value = │
│   Original_price - Depreciation      │
└───────────┬──────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│   Step 2: Calculate Usage Rate      │
│   Usage_rate = Monthly_use_hours/176│
└───────────┬──────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│   Step 3: Ownership Costs (Monthly)  │
│   ├─ Depreciation                   │
│   ├─ Capital Cost                   │
│   ├─ Overhead                       │
│   ├─ Overhaul Labor                 │
│   └─ Overhaul Parts                 │
└───────────┬──────────────────────────┘
            │
            │ Sum all ownership costs
            │ Divide by 176 (hours)
            ▼
┌─────────────────────────────────────┐
│   Total_ownership_cost_hourly       │
│   ⭐ This becomes: unadjustedRate    │
└───────────┬──────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│   Step 4: Operating Costs (Hourly)  │
│   ├─ Field Labor                    │
│   ├─ Field Parts                    │
│   ├─ Ground Engaging Component      │
│   ├─ Lube                           │
│   ├─ Fuel (by Horse Power)          │
│   └─ Tire Costs                     │
└───────────┬──────────────────────────┘
            │
            │ Sum all operating costs
            ▼
┌─────────────────────────────────────┐
│   Total_operating_cost              │
│   ⭐ This becomes: operCost         │
└───────────┬──────────────────────────┘
            │
            │ Navigate to Calculator
            ▼
┌─────────────────────────────────────┐
│   Calculator Receives:              │
│   - unadjustedRate (× 176)          │
│   - operCost                         │
│   - equipment (full object)         │
└─────────────────────────────────────┘
```

---

## 🧮 Calculator Flow

```
┌─────────────────────────────────────┐
│   CalculatorComponent               │
│   Receives Route Parameters:        │
│   - unadjustedRate                  │
│   - operCost                        │
│   - selectedItem                    │
│   - modelYear                       │
│   - selectedCounty                  │
│   - selectedQuarter                 │
└───────────┬──────────────────────────┘
            │
            │ Initialize
            ▼
┌─────────────────────────────────────┐
│   Default Values:                   │
│   - unadjustedRate: 0               │
│   - modelRate: 100%                 │
│   - regionalRate: 100%              │
│   - hours: 176                      │
│   - operCost: 0                     │
│   - operCostMultiplier: 0.5         │
└───────────┬──────────────────────────┘
            │
            │ User Inputs
            ▼
┌─────────────────────────────────────┐
│   Calculate FHWA Rate:               │
│   rateUsed =                        │
│   (unadjustedRate × modelRate% ×    │
│    regionalRate%) / hours + operCost │
└───────────┬──────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│   Calculate Standby Rate:            │
│   standByRate =                     │
│   ((unadjustedRate × modelRate% ×   │
│     regionalRate%) / hours) ×        │
│   operCostMultiplier                │
└───────────┬──────────────────────────┘
            │
            │ Display Results
            ▼
┌─────────────────────────────────────┐
│   Summary Display:                  │
│   - FHWA Rate: $XX.XX per hour      │
│   - Standby Rate: $XX.XX per hour   │
│   - Unadjusted Monthly Ownership    │
│     Cost: $XX.XX                    │
│   - Model Rate Adjustment: XX%      │
│   - Regional Rate Adjustment: XX%   │
│   - Operation Cost: $XX.XX          │
└─────────────────────────────────────┘
```

---

## 🗄️ Database Structure

```
MongoDB Atlas (bezkoder_db)
│
├── Collections:
│   │
│   ├── 2003, 2004, ..., 2025
│   │   └── Equipment Documents
│   │       ├── Category
│   │       ├── Sub_Category
│   │       ├── Size
│   │       ├── Manufacturer
│   │       ├── Original_price
│   │       ├── Sales_Tax
│   │       ├── Salvage_Value
│   │       ├── Annual_Overhead_rate
│   │       ├── Annual_Overhaul_Parts_cost_rate
│   │       ├── Annual_Field_Repair_Parts_...
│   │       ├── Total_ownership_cost_hourly
│   │       ├── Total_operating_cost
│   │       └── ... (all equipment fields)
│   │
│   ├── users
│   │   ├── username
│   │   ├── email
│   │   ├── password (hashed)
│   │   └── roles[]
│   │
│   ├── roles
│   │   ├── name: "user"
│   │   ├── name: "moderator"
│   │   └── name: "admin"
│   │
│   ├── fuelcosts
│   │   ├── diesel_price
│   │   ├── gasoline_price
│   │   └── other
│   │
│   ├── fuelprices
│   │   ├── County
│   │   ├── Quarter
│   │   ├── Fuel Type
│   │   └── Fuel Price
│   │
│   ├── savedmodels
│   │   └── Array of saved model JSON strings
│   │
│   └── currentyear
│       └── currentyear: 2025
```

---

## 🔌 API Endpoints Flow

```
Frontend Request
    │
    ▼
┌─────────────────────────────────────┐
│   HTTP Interceptor                  │
│   - Adds JWT Token to Headers       │
│   - Handles Errors                  │
└───────────┬──────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│   Backend: CORS Middleware          │
│   - Validates Origin                │
│   - Allows Credentials              │
└───────────┬──────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│   Backend: Auth Middleware           │
│   - Verify JWT Token                │
│   - Check User Role                 │
│   - Authorize Access                │
└───────────┬──────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│   Controller Method                 │
│   - Process Request                 │
│   - Query MongoDB                   │
│   - Calculate Values                │
│   - Return Response                 │
└───────────┬──────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│   Frontend: Service                 │
│   - Receive Response                │
│   - Update Component Data           │
│   - Update UI                       │
└─────────────────────────────────────┘
```

---

## 📊 Component Hierarchy

```
AppComponent (Root)
│
├── Navbar
│   ├── Home Link
│   ├── Equipment Link (if logged in)
│   ├── Manage Equipment Data (if admin)
│   ├── Saved Models (if logged in)
│   ├── Login/Register (if not logged in)
│   └── Profile/Logout (if logged in)
│
├── Router Outlet
│   │
│   ├── HomeComponent
│   │
│   ├── LoginComponent
│   │   └── ForgotPasswordComponent
│   │
│   ├── RegisterComponent
│   │
│   ├── BoardAdminComponent (Equipment Main)
│   │   └── EquipmentListComponent
│   │       ├── Filter Controls
│   │       ├── Equipment Cards
│   │       └── EditFormComponent (modal)
│   │
│   ├── CountySelectionComponent
│   │
│   ├── EquipmentDetailsComponent
│   │   ├── Equipment Form Fields
│   │   ├── Calculated Costs Section
│   │   └── Print Button
│   │
│   ├── CalculatorComponent
│   │   ├── FHWA Rate Section
│   │   ├── Standby Rate Section
│   │   ├── Summary Section
│   │   └── Print Button
│   │
│   ├── SavedModelsComponent
│   │   └── Saved Models Table
│   │
│   └── EquipmentManagerComponent
│       ├── Year Selection
│       ├── Equipment Data Management
│       ├── Fuel Price Management
│       └── Labor Wage Management
│
└── NotificationComponent (Global)
```

---

## 🔄 Backend API Routes

```
/api/auth/
├── POST /signup          → Register new user
├── POST /signin          → Login user
├── POST /signout         → Logout user
├── POST /forgot-password → Request password reset
└── POST /reset-password  → Reset password with token

/api/test/
├── GET /all              → Public content
├── GET /user             → User board (requires auth)
├── GET /mod              → Moderator board (requires auth + mod role)
├── GET /admin            → Admin board (requires auth + admin role)
├── POST /savemodel       → Save calculator model
├── GET /savedmodels      → Get all saved models
├── GET /years            → Get all available years
├── GET /contractors      → Get all contractors
├── GET /model-data/:year → Get equipment by year
├── GET /contractor-data/:contractor → Get equipment by contractor
├── PUT /editEquipment    → Edit equipment data
├── POST /addequipment    → Add new equipment
├── POST /generate-2025   → Generate next year data
├── GET /fuelcosts        → Get fuel costs
├── PUT /editfuelcosts    → Edit fuel costs
├── GET /hrlabourwage     → Get hourly wage
├── PUT /edithrlabourwage → Edit hourly wage
├── GET /currentyear      → Get current year
└── POST /exportdata      → Export equipment data

/api/fuel/
├── GET /fuel-price       → Get fuel price by county/quarter/type
├── GET /fuel-metadata    → Get counties and quarters
├── POST /update          → Update fuel price
└── POST /bulk-upload     → Bulk upload fuel prices
```

---

## 🔐 Security Flow

```
Request
    │
    ▼
┌─────────────────────────────────────┐
│   CORS Check                        │
│   - Validate Origin                 │
│   - Allow: localhost, CloudFront, S3 │
└───────────┬──────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│   JWT Token Verification             │
│   - Extract from Cookie/Header      │
│   - Verify Signature                │
│   - Check Expiration                │
└───────────┬──────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│   Role Check (if needed)            │
│   - Get User from Token             │
│   - Check User Role in DB           │
│   - Verify: admin/mod/user           │
└───────────┬──────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│   Process Request                   │
│   - Authorized Access               │
└─────────────────────────────────────┘
```

---

## 📱 Frontend Services

```
┌─────────────────────────────────────┐
│   AuthService                       │
│   - login()                         │
│   - register()                      │
│   - logout()                        │
│   - forgotPassword()                │
│   - resetPassword()                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   UserService                       │
│   - getModelDataByYear()            │
│   - getModelDataByContractor()      │
│   - editEquipment()                 │
│   - addEquipment()                  │
│   - saveModel()                     │
│   - getSavedModels()                │
│   - generateNextYearEquipData()     │
│   - getFuelCosts()                  │
│   - editFuelCosts()                 │
│   - getHourlyWage()                 │
│   - editHourlyWage()                │
│   - getCurrentYear()                │
│   - exportData()                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   FuelPriceService                  │
│   - getFuelPrice()                  │
│   - getFuelMetadata()               │
│   - updateFuelPrices()              │
│   - bulkUploadFuelPrices()          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   StorageService                    │
│   - saveUser()                      │
│   - getUser()                       │
│   - saveToken()                     │
│   - getToken()                      │
│   - isLoggedIn()                    │
│   - clean()                         │
│   - getItem()                       │
│   - setItem()                       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   NotificationService               │
│   - triggerNotification()            │
│   - Show success/error messages     │
└─────────────────────────────────────┘
```

---

## 🎯 Key User Journeys

### Journey 1: Calculate Equipment Rate
```
Login → Equipment → Select Year → Filter Equipment → 
Select Equipment → Select County/Quarter → 
Equipment Details → Calculate Costs → 
Calculator → Adjust Rates → Save Model
```

### Journey 2: View Saved Models
```
Login → Saved Models → Click Model → 
Calculator (with pre-filled data)
```

### Journey 3: Admin Manage Equipment
```
Login (as Admin) → Manage Equipment Data → 
Select Year → Edit Equipment → Save Changes
```

### Journey 4: Admin Generate Next Year
```
Login (as Admin) → Manage Equipment Data → 
Generate Next Year → Set Price Increase → 
Confirm → Data Generated
```

---

## 🔧 Key Calculations

### Ownership Cost Calculation:
```
Usage_rate = Monthly_use_hours / 176

Depreciation = (Original_price × (1 + Sales_Tax) × 
                (1 - Discount) × (1 - Salvage_Value) + 
                Initial_Freight_cost × Original_price) / 
               Economic_Life_in_months / Usage_rate

Capital_Cost = (Cost_of_Capital_rate × Original_price) / 
               12 / Usage_rate

Overhead = (Annual_Overhead_rate × Resale_Value) / 
           12 / Usage_rate

Overhaul_Labor = (Hourly_Wage × Annual_Overhaul_Labor_Hours) / 
                 12 / Usage_rate

Overhaul_Parts = (Annual_Overhaul_Parts_cost_rate × 
                  Original_price) / 12 / Usage_rate

Total_Ownership_Cost_Hourly = 
  (Depreciation + Capital_Cost + Overhead + 
   Overhaul_Labor + Overhaul_Parts) / 176
```

### Operating Cost Calculation:
```
Field_Labor = (Annual_Field_Labor_Hours × Hourly_Wage) / 
              12 / Monthly_use_hours

Field_Parts = (Annual_Field_Repair_Parts_rate × 
               Original_price) / 12 / Monthly_use_hours

Ground_Engaging = (Annual_Ground_Engaging_Component_rate × 
                   Original_price) / 12 / Monthly_use_hours

Fuel = (Fuel_Multiplier × Horse_power × Fuel_unit_price)

Tire_Costs = Cost_of_Tires / Tire_Life_Hours

Total_Operating_Cost = 
  Field_Labor + Field_Parts + Ground_Engaging + 
  Lube + Fuel + Tire_Costs
```

### Calculator Rate Calculation:
```
FHWA_Rate = 
  ((Unadjusted_Monthly_Cost × Model_Rate% × Regional_Rate%) / 
   176) + Operating_Cost

Standby_Rate = 
  ((Unadjusted_Monthly_Cost × Model_Rate% × Regional_Rate%) / 
   176) × Operating_Cost_Multiplier
```

---

## 📦 Deployment Architecture

```
┌─────────────────────────────────────┐
│   Development                        │
│   - Local Angular Dev Server        │
│   - Localhost:4200                  │
└───────────┬──────────────────────────┘
            │
            │ Build: ng build
            ▼
┌─────────────────────────────────────┐
│   Production Build                   │
│   - static/ directory               │
│   - Optimized bundles               │
│   - Minified code                   │
└───────────┬──────────────────────────┘
            │
            │ Deploy: aws s3 sync
            ▼
┌─────────────────────────────────────┐
│   AWS S3 Bucket                     │
│   idot-frontend-1758593939           │
│   - Static website hosting           │
│   - All frontend files               │
└───────────┬──────────────────────────┘
            │
            │ CloudFront Distribution
            ▼
┌─────────────────────────────────────┐
│   CloudFront CDN                     │
│   dj42lwp4p3ce5.cloudfront.net      │
│   - Global distribution              │
│   - Caching                          │
│   - HTTPS                            │
└───────────┬──────────────────────────┘
            │
            │ API Calls
            ▼
┌─────────────────────────────────────┐
│   EC2 Instance                      │
│   13.220.51.254:8083                │
│   - Node.js Backend                 │
│   - PM2 Process Manager              │
│   - Express.js Server               │
└───────────┬──────────────────────────┘
            │
            │ MongoDB Connection
            ▼
┌─────────────────────────────────────┐
│   MongoDB Atlas                     │
│   - Cloud Database                  │
│   - Multiple Collections            │
│   - JWT User Management             │
└─────────────────────────────────────┘
```

---

This flowchart covers the complete architecture, data flow, and user journeys of the IDOT Project!

