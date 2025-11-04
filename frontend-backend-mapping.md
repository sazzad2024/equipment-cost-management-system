# Frontend to Backend Mapping Diagram

## 🔗 Complete Frontend-Backend Mapping

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Frontend-Backend Mapping                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        Frontend Services                               │   │
│  │                                                                         │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐       │   │
│  │  │   AuthService   │  │   UserService   │  │ FuelPriceService│       │   │
│  │  │                 │  │                 │  │                 │       │   │
│  │  │ • login()       │  │ • saveModel()   │  │ • getFuelPrice()│       │   │
│  │  │ • register()    │  │ • getSavedModels│  │ • getFuelMetadata│       │   │
│  │  │ • logout()      │  │ • getAllYears() │  │ • bulkUpload()   │       │   │
│  │  │ • forgotPwd()   │  │ • editEquipment │  │ • updateFuel()   │       │   │
│  │  │ • resetPwd()    │  │ • generateData() │  │                 │       │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘       │   │
│  │                                                                         │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐       │   │
│  │  │ StorageService   │  │ NotificationSvc  │  │ CalculatorSvc    │       │   │
│  │  │                 │  │                 │  │                 │       │   │
│  │  │ • saveUser()    │  │ • triggerNotif()│  │ • calculateRate │       │   │
│  │  │ • getToken()    │  │ • showSuccess() │  │ • updateRate()   │       │   │
│  │  │ • getUser()     │  │ • showError()   │  │ • updateStandBy()│       │   │
│  │  │ • isLoggedIn()  │  │ • positionMsg()  │  │                 │       │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘       │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                           │
│                                    │ HTTP Requests                             │
│                                    ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        Backend API Endpoints                           │   │
│  │                                                                         │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐       │   │
│  │  │   Auth Routes   │  │   User Routes   │  │  Fuel Routes    │       │   │
│  │  │   /api/auth/*   │  │   /api/test/*   │  │   /api/fuel/*   │       │   │
│  │  │                 │  │                 │  │                 │       │   │
│  │  │ • POST /signin  │  │ • POST /savemodel│  │ • GET /fuel-price│     │   │
│  │  │ • POST /signup  │  │ • GET /savedmodels│ │ • GET /fuel-metadata│   │   │
│  │  │ • POST /signout │  │ • GET /years    │  │ • POST /update  │       │   │
│  │  │ • POST /forgot- │  │ • GET /contractors│ │ • POST /bulk-   │       │   │
│  │  │   password      │  │ • GET /model-data│  │   upload        │       │   │
│  │  │ • POST /reset-  │  │ • PUT /editEquipment│                 │       │   │
│  │  │   password/:token│ │ • POST /generate-│  │                 │       │   │
│  │  │                 │  │   2025          │  │                 │       │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘       │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                           │
│                                    │ Route to Controllers                     │
│                                    ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        Backend Controllers                             │   │
│  │                                                                         │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐       │   │
│  │  │ AuthController   │  │ UserController   │  │ FuelPriceController│     │   │
│  │  │                 │  │                 │  │                 │       │   │
│  │  │ • signin()      │  │ • saveModel()   │  │ • getFuelPrice() │       │   │
│  │  │ • signup()      │  │ • getAllModels()│  │ • getAllFuelMeta │       │   │
│  │  │ • signout()     │  │ • adminBoard()  │  │ • updateFuelPrice│       │   │
│  │  │ • forgotPassword│  │ • userBoard()   │  │ • bulkUploadFuel │       │   │
│  │  │ • resetPassword │  │                 │  │                 │       │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘       │   │
│  │                                                                         │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐       │   │
│  │  │ DataController   │  │ Middleware      │  │ Models           │       │   │
│  │  │                 │  │                 │  │                 │       │   │
│  │  │ • getAllYears() │  │ • authJwt       │  │ • User Model    │       │   │
│  │  │ • editEquipment │  │ • verifySignUp  │  │ • Role Model    │       │   │
│  │  │ • generate2025  │  │ • verifyToken  │  │ • Data Model    │       │   │
│  │  │ • getModelData  │  │ • isAdmin       │  │ • Fuel Model    │       │   │
│  │  │ • addEquipment  │  │ • isGeneralUser │  │                 │       │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘       │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                           │
│                                    │ Database Operations                       │
│                                    ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        MongoDB Atlas Database                          │   │
│  │                                                                         │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐       │   │
│  │  │   Users         │  │   Equipment      │  │   Fuel Prices   │       │   │
│  │  │   Collection    │  │   Collections   │  │   Collection    │       │   │
│  │  │                 │  │                 │  │                 │       │   │
│  │  │ • User accounts │  │ • 2003-2025     │  │ • County/Quarter│       │   │
│  │  │ • Roles         │  │   equipment data │  │   fuel prices   │       │   │
│  │  │ • Saved models  │  │ • Equipment     │  │ • Fuel metadata │       │   │
│  │  │ • JWT tokens    │  │   specifications │  │ • Price updates │       │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘       │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 📋 Detailed Service-to-Endpoint Mapping

### 🔐 Authentication Service Mapping

| Frontend Method | HTTP Request | Backend Route | Controller Method | Purpose |
|----------------|--------------|---------------|------------------|---------|
| `login()` | `POST /api/auth/signin` | `/api/auth/signin` | `authController.signin` | User login with JWT |
| `register()` | `POST /api/auth/signup` | `/api/auth/signup` | `authController.signup` | User registration |
| `logout()` | `POST /api/auth/signout` | `/api/auth/signout` | `authController.signout` | User logout |
| `forgotPassword()` | `POST /api/auth/forgot-password` | `/api/auth/forgot-password` | `authController.forgotPassword` | Password reset request |
| `resetPassword()` | `POST /api/auth/reset-password/:token` | `/api/auth/reset-password/:token` | `authController.resetPassword` | Password reset confirmation |

### 👤 User Service Mapping

| Frontend Method | HTTP Request | Backend Route | Controller Method | Purpose |
|----------------|--------------|---------------|------------------|---------|
| `saveModel()` | `POST /api/test/savemodel` | `/api/test/savemodel` | `userController.saveModel` | Save equipment model |
| `getSavedModels()` | `GET /api/test/savedmodels` | `/api/test/savedmodels` | `userController.getAllModels` | Get user's saved models |
| `getAllYears()` | `GET /api/test/years` | `/api/test/years` | `dataController.getAllYears` | Get available years |
| `getAllContractors()` | `GET /api/test/contractors` | `/api/test/contractors` | `dataController.getAllContractors` | Get contractors list |
| `getModelDataByYear()` | `GET /api/test/model-data/:year` | `/api/test/model-data/:year` | `dataController.getModelDataByYear` | Get equipment by year |
| `editEquipment()` | `PUT /api/test/editEquipment` | `/api/test/editEquipment` | `dataController.editEquipment` | Update equipment data |
| `generateNextYearEquipData()` | `POST /api/test/generate-2025` | `/api/test/generate-2025` | `dataController.generate2025Data` | Generate new year data |
| `getAdminBoard()` | `GET /api/test/admin` | `/api/test/admin` | `userController.adminBoard` | Admin dashboard access |
| `getUserBoard()` | `GET /api/test/user` | `/api/test/user` | `userController.userBoard` | User dashboard access |

### ⛽ Fuel Price Service Mapping

| Frontend Method | HTTP Request | Backend Route | Controller Method | Purpose |
|----------------|--------------|---------------|------------------|---------|
| `getFuelPrice()` | `GET /api/fuel/fuel-price` | `/api/fuel/fuel-price` | `fuelPriceController.getFuelPrice` | Get fuel price by location |
| `getFuelMetadata()` | `GET /api/fuel/fuel-metadata` | `/api/fuel/fuel-metadata` | `fuelPriceController.getAllFuelMetadata` | Get counties/quarters |
| `updateFuelPrices()` | `POST /api/fuel/update` | `/api/fuel/update` | `fuelPriceController.updateFuelPrice` | Update fuel prices |
| `bulkUploadFuelPrices()` | `POST /api/fuel/bulk-upload` | `/api/fuel/bulk-upload` | `fuelPriceController.bulkUploadFuel` | Bulk upload fuel data |

## 🔄 Data Flow Examples

### 1. User Login Flow
```
LoginComponent → AuthService.login() → POST /api/auth/signin → AuthController.signin() → MongoDB Users Collection → JWT Token → StorageService.saveUser() → UI Update
```

### 2. Save Model Flow
```
CalculatorComponent → UserService.saveModel() → POST /api/test/savemodel → UserController.saveModel() → MongoDB Users.savedModels → NotificationService → UI Success Message
```

### 3. Equipment Data Flow
```
EquipmentListComponent → UserService.getModelDataByYear() → GET /api/test/model-data/:year → DataController.getModelDataByYear() → MongoDB Equipment Collections → Component Display
```

### 4. Fuel Price Flow
```
EquipmentDetailsComponent → FuelPriceService.getFuelPrice() → GET /api/fuel/fuel-price → FuelPriceController.getFuelPrice() → MongoDB Fuel Collection → Cost Calculation
```

## 🛡️ Authentication & Authorization Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│                 │    │                 │    │                 │
│ 1. Login Form   │───►│ 2. Auth Route   │───►│ 3. User Lookup  │
│                 │    │                 │    │                 │
│ 4. Store Token  │◄───│ 5. JWT Token   │◄───│ 6. User Data    │
│                 │    │                 │    │                 │
│ 7. API Calls    │───►│ 8. Verify Token│───►│ 9. Role Check   │
│                 │    │                 │    │                 │
│ 10. UI Update   │◄───│ 11. Response   │◄───│ 12. Data Query  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 Component-to-Service Mapping

### Authentication Components
- **LoginComponent** → AuthService.login()
- **RegisterComponent** → AuthService.register()
- **ForgotPasswordComponent** → AuthService.forgotPassword()
- **ResetPasswordComponent** → AuthService.resetPassword()
- **ProfileComponent** → StorageService.getUser()

### Equipment Components
- **EquipmentListComponent** → UserService.getModelDataByYear()
- **EquipmentDetailsComponent** → FuelPriceService.getFuelPrice()
- **EquipmentManagerComponent** → UserService.editEquipment()
- **CalculatorComponent** → UserService.saveModel()

### User Management Components
- **BoardAdminComponent** → UserService.getAdminBoard()
- **BoardUserComponent** → UserService.getUserBoard()
- **SavedModelsComponent** → UserService.getSavedModels()

### Utility Components
- **NotificationComponent** → NotificationService.triggerNotification()
- **LoadingSpinnerComponent** → Used by all services during API calls
- **PaginationComponent** → Used with UserService data methods

## 🔧 HTTP Interceptor Integration

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Component     │    │   HTTP          │    │   Backend       │
│                 │    │   Interceptor   │    │                 │
│ Service Call    │───►│                 │───►│ API Endpoint   │
│                 │    │ • Add JWT Token │    │                 │
│                 │    │ • Handle Errors │    │                 │
│ Response        │◄───│ • Retry Logic   │◄───│ Response       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🌐 Base URLs Configuration

### Frontend Service URLs
```typescript
// AuthService
const AUTH_API = 'http://13.220.51.254:8083/api/auth/';

// UserService  
const API_URL = 'http://13.220.51.254:8083/api/test/';

// FuelPriceService
private API_URL = 'http://13.220.51.254:8083/api/';
```

### Backend Route Structure
```
/api/auth/*     → Authentication endpoints
/api/test/*     → User and equipment management endpoints  
/api/fuel/*     → Fuel pricing endpoints
```

## 🔒 Security Mapping

### JWT Token Flow
1. **Login** → Backend generates JWT token
2. **Storage** → Frontend stores token in sessionStorage
3. **Requests** → HTTP Interceptor adds token to headers
4. **Verification** → Backend middleware verifies token
5. **Authorization** → Role-based access control

### Role-Based Access
- **Admin** → Full access to all endpoints
- **User** → Limited access to user-specific endpoints
- **Moderator** → Intermediate access (currently unused)

This mapping shows how the frontend Angular services directly correspond to backend Express routes and controllers, creating a clean separation of concerns while maintaining tight integration between the client and server layers.




