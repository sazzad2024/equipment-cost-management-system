# Equipment Cost Management System

A comprehensive web application for calculating equipment ownership and operating costs, including FHWA (Federal Highway Administration) rates and standby rates for construction equipment.

## 🚀 Features

- **Equipment Cost Calculator**: Calculate FHWA hourly rates and standby rates based on equipment specifications
- **Equipment Management**: Manage equipment data by year and contractor
- **Cost Calculations**: Automatic calculation of ownership costs and operating costs
- **User Authentication**: JWT-based authentication with role-based access control (Admin, User)
- **Data Management**: View, edit, and manage equipment data across multiple years
- **Fuel Price Management**: Manage fuel prices by county and quarter
- **Saved Models**: Save and retrieve calculator models for future reference
- **Print Functionality**: Print equipment details and calculator results

## 🏗️ Architecture

- **Frontend**: Angular 15 with TypeScript
- **Backend**: Node.js with Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT tokens with HttpOnly cookies
- **Deployment**: 
  - Frontend: AWS S3 + CloudFront CDN
  - Backend: AWS EC2

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB instance)
- Angular CLI (installed as dependency)

## 🛠️ Installation

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   COOKIE_SECRET=your_cookie_secret
   PORT=8083
   NODE_ENV=development
   ```

4. Start the server:
   ```bash
   npm start
   # Or for development with auto-reload:
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update API URLs in `src/app/_services/`:
   - `user.service.ts`: Set `API_URL` to your backend URL
   - `auth.service.ts`: Set `AUTH_API` to your backend URL
   - `fuel-price.service.ts`: Set `API_URL` to your backend URL

4. Start development server:
   ```bash
   npm start
   # Or:
   ng serve
   ```

5. Open browser:
   ```
   http://localhost:4200
   ```

## 🔐 Environment Variables

Create a `.env` file in the `backend` directory with:

```env
# MongoDB Connection URI
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Cookie Secret for session encryption
COOKIE_SECRET=your_random_secret_string

# Port (optional - defaults to 8083)
PORT=8083

# Node Environment
NODE_ENV=development
```

## 📁 Project Structure

```
equipment-cost-management-system/
├── backend/
│   ├── app/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/      # API controllers
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   └── middlewares/     # Auth & validation
│   ├── server.js            # Server entry point
│   ├── app.js               # Express app setup
│   └── .env                 # Environment variables (create this)
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── _services/   # API services
    │   │   ├── calculator/  # Calculator component
    │   │   ├── equipment-details/  # Equipment details
    │   │   └── ...          # Other components
    │   └── assets/           # Static assets
    └── angular.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Equipment Data
- `GET /api/test/model-data/:year` - Get equipment by year
- `GET /api/test/contractor-data/:contractor` - Get equipment by contractor
- `PUT /api/test/editEquipment` - Edit equipment
- `POST /api/test/addequipment` - Add new equipment
- `GET /api/test/years` - Get all available years
- `GET /api/test/contractors` - Get all contractors

### Calculator
- `POST /api/test/savemodel` - Save calculator model
- `GET /api/test/savedmodels` - Get all saved models

### Fuel Prices
- `GET /api/fuel/fuel-price` - Get fuel price by county/quarter/type
- `GET /api/fuel/fuel-metadata` - Get counties and quarters
- `POST /api/fuel/update` - Update fuel price
- `POST /api/fuel/bulk-upload` - Bulk upload fuel prices

## 🧮 Key Calculations

### Ownership Costs (Monthly)
- Depreciation
- Capital Cost
- Overhead
- Overhaul Labor
- Overhaul Parts

**Total Ownership Cost (Hourly)** = Sum of all ownership costs / 176

### Operating Costs (Hourly)
- Field Labor
- Field Parts
- Ground Engaging Component
- Lube
- Fuel (by Horse Power)
- Tire Costs

**Total Operating Cost** = Sum of all operating costs

### Calculator Rates
- **FHWA Rate** = ((Unadjusted Monthly Cost × Model Rate% × Regional Rate%) / 176) + Operating Cost
- **Standby Rate** = ((Unadjusted Monthly Cost × Model Rate% × Regional Rate%) / 176) × Operating Cost Multiplier

## 🚀 Deployment

### Frontend Deployment to S3

1. Build the Angular application:
   ```bash
   cd frontend
   npm run build
   ```

2. Sync to S3:
   ```bash
   aws s3 sync static/ s3://your-bucket-name --delete
   ```

3. Invalidate CloudFront cache (if using CloudFront):
   ```bash
   aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
   ```

### Backend Deployment to EC2

1. Build and transfer files:
   ```bash
   scp -r backend/* user@ec2-ip:~/backend/
   ```

2. SSH into EC2 and restart:
   ```bash
   ssh user@ec2-ip
   cd backend
   pm2 restart app
   ```

## 📚 Documentation

- [Complete Flow Documentation](./FLOW_DOCUMENTATION.md) - Detailed code flow from equipment selection to calculator
- [Project Flowchart](./PROJECT_FLOWCHART.md) - Visual representation of application architecture and flows
- [Git Security Guide](./GIT_SECURITY_GUIDE.md) - Security best practices for git repository

## 🔒 Security

- **Never commit** `.env` files
- **Never commit** files containing passwords or API keys
- Use environment variables for all sensitive data
- See [GIT_SECURITY_GUIDE.md](./GIT_SECURITY_GUIDE.md) for details

## 🧪 Technologies Used

- **Frontend**: Angular 15, TypeScript, Bootstrap, Angular Material
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT, bcryptjs, cookie-session
- **Deployment**: AWS S3, CloudFront, EC2
- **Database**: MongoDB Atlas

## 📝 License

This project is proprietary software.

## 👥 Author

Created for equipment cost management and calculation.

## 🤝 Contributing

This is a private project. For contributions or questions, please contact the project owner.

---

**Note**: Make sure to set up your `.env` file with proper credentials before running the application.

