# Equipment Cost Management System

A comprehensive web application for calculating equipment ownership and operating costs, including FHWA (Federal Highway Administration) rates and standby rates for construction equipment.

## Features

- **Equipment Cost Calculator**: Calculate FHWA hourly rates and standby rates based on equipment specifications
- **Equipment Management**: Manage equipment data by year and contractor
- **Cost Calculations**: Automatic calculation of ownership costs and operating costs
- **User Authentication**: JWT-based authentication with role-based access control (Admin, User)
- **Data Management**: View, edit, and manage equipment data across multiple years
- **Fuel Price Management**: Manage fuel prices by county and quarter
- **Saved Models**: Save and retrieve calculator models for future reference
- **Print Functionality**: Print equipment details and calculator results

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Angular 15, TypeScript, SCSS, Angular Material |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Authentication | JWT (JSON Web Tokens) |

## Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)
- MongoDB Atlas account (free tier available)

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/sazzad2024/equipment-cost-management-system.git
cd equipment-cost-management-system
```

### 2. Set up Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/test
COOKIE_SECRET=your_random_secret_key_here
```

Start the backend:
```bash
npm start
```

### 3. Set up Frontend
Open a new terminal:
```bash
cd frontend
npm install
npm start
```

### 4. Access the Application
Open browser: **http://localhost:4200**

## Project Structure

```
equipment-cost-management-system/
├── backend/
│   ├── app/
│   │   ├── config/         # Database and auth configuration
│   │   ├── controllers/    # API logic (auth, data, fuel-price, user)
│   │   ├── models/         # MongoDB schemas (user, role, data, fuel)
│   │   ├── routes/         # API routes
│   │   └── middlewares/    # Authentication & validation
│   ├── server.js           # Server entry point
│   ├── app.js              # Express app setup
│   └── package.json        # Backend dependencies
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── _services/      # API services
    │   │   ├── calculator/     # Calculator component
    │   │   ├── equipment-details/   # Equipment details
    │   │   ├── equipment-list/      # Equipment listing
    │   │   ├── login/          # Login component
    │   │   └── ...             # Other components
    │   └── assets/             # Static assets
    ├── angular.json            # Angular configuration
    └── package.json            # Frontend dependencies
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register new user |
| POST | /api/auth/signin | Login |
| POST | /api/auth/signout | Logout |

### Equipment Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/test/years | Get all available years |
| GET | /api/test/all/:year | Get equipment data for a year |
| PUT | /api/test/edit | Edit equipment |
| POST | /api/test/addequipment | Add new equipment |

### Calculator
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/test/savemodel | Save calculator model |
| GET | /api/test/savedmodels | Get saved models |

### Fuel Prices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/fuel/fuel-price | Get fuel price |
| GET | /api/fuel/fuel-metadata | Get counties and quarters |

## Key Calculations

### Ownership Costs (Monthly)
- Depreciation Ownership Cost
- Capital Cost (Cost of Facilities)
- Overhead Ownership Cost
- Overhaul Labor Ownership Cost
- Overhaul Parts Ownership Cost

**Total Ownership Cost (Hourly)** = Sum of all 5 monthly costs ÷ 176

### Operating Costs (Hourly)
- Field Labor Operating Cost
- Field Parts Operating Cost
- Ground Engaging Component Cost
- Lube Operating Cost
- Fuel by Horse Power Operating Cost
- Tire Costs Operating Cost

**Total Operating Cost** = Sum of all operating costs

### FHWA Rate Formula
```
FHWA Rate = (Monthly Ownership Cost × Model Rate% × Regional Rate%) ÷ 176 + Operating Cost
```

## Troubleshooting

### Port already in use
```bash
# Kill process on port 8083 (backend)
lsof -ti:8083 | xargs kill -9

# Kill process on port 4200 (frontend)
lsof -ti:4200 | xargs kill -9
```

### MongoDB connection error
- Verify your `MONGODB_URI` in `.env`
- Ensure your IP is whitelisted in MongoDB Atlas

### Module not found
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

## License

This project is for educational purposes.

---

**Note**: Remember to create the `.env` file with your MongoDB credentials before running the backend.
