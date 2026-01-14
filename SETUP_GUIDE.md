# Equipment Cost Management System - Setup Guide

This guide explains how to set up and run the project on your local computer.

---

## Prerequisites

Before you begin, make sure you have the following installed:

| Software | Version | Download Link |
|----------|---------|---------------|
| Node.js | v18+ | https://nodejs.org/ |
| npm | (comes with Node.js) | - |
| Git | Latest | https://git-scm.com/ |

To verify installation, run:
```bash
node --version   # Should show v18.x.x or higher
npm --version    # Should show 9.x.x or higher
```

---

## Project Structure

```
IDOT_Project/
├── backend/                 # Node.js/Express API server
│   ├── app/
│   │   ├── config/         # Database and auth configuration
│   │   ├── controllers/    # API logic
│   │   ├── middlewares/    # Authentication middleware
│   │   ├── models/         # MongoDB schemas
│   │   └── routes/         # API routes
│   ├── app.js              # Express app setup
│   ├── server.js           # Server entry point
│   ├── package.json        # Backend dependencies
│   └── .env                # Environment variables (you need to create this)
│
├── frontend/               # Angular 15 web application
│   ├── src/
│   │   ├── app/           # Angular components and services
│   │   └── assets/        # Static files
│   ├── angular.json       # Angular configuration
│   └── package.json       # Frontend dependencies
│
└── README.md              # This file
```

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/sazzad2024/equipment-cost-management-system.git
cd equipment-cost-management-system
```

---

## Step 2: Set Up the Backend

### 2.1 Navigate to backend folder
```bash
cd backend
```

### 2.2 Install dependencies
```bash
npm install
```

### 2.3 Create environment file

Create a file named `.env` in the `backend/` folder with the following content:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/test
COOKIE_SECRET=your_random_secret_key_here
```

**Note:** Replace `<username>`, `<password>`, and `<cluster>` with your MongoDB Atlas credentials.

To get MongoDB credentials:
1. Go to https://cloud.mongodb.com
2. Create a free account and cluster
3. Create a database user
4. Get the connection string

### 2.4 Start the backend server
```bash
npm start
```

You should see:
```
Server is running on http://0.0.0.0:8083
Successfully connected to MongoDB.
```

---

## Step 3: Set Up the Frontend

### 3.1 Open a new terminal and navigate to frontend folder
```bash
cd frontend
```

### 3.2 Install dependencies
```bash
npm install
```

### 3.3 Start the Angular development server
```bash
npm start
```

You should see:
```
** Angular Live Development Server is listening on localhost:4200 **
```

---

## Step 4: Access the Application

Open your web browser and go to:

**http://localhost:4200**

### Default Login Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Administrator |
| idot | idot123 | Regular User |

---

## Quick Start Summary

```bash
# Terminal 1 - Backend
cd backend
npm install
# Create .env file with MongoDB URI
npm start

# Terminal 2 - Frontend
cd frontend
npm install
npm start

# Open browser: http://localhost:4200
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register new user |
| POST | /api/auth/signin | Login |
| POST | /api/auth/signout | Logout |
| GET | /api/test/years | Get all available years |
| GET | /api/test/all/:year | Get equipment data for a year |
| PUT | /api/test/edit | Edit equipment |
| POST | /api/test/saveModel | Save calculator model |
| GET | /api/fuel/fuel-price | Get fuel prices |

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Angular 15, TypeScript, SCSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Authentication | JWT (JSON Web Tokens) |

---

## Troubleshooting

### Port already in use
```bash
# Kill process on port 8083
lsof -ti:8083 | xargs kill -9

# Kill process on port 4200
lsof -ti:4200 | xargs kill -9
```

### MongoDB connection error
- Verify your `MONGODB_URI` in `.env`
- Ensure your IP is whitelisted in MongoDB Atlas (Network Access → Add IP Address → Allow Access from Anywhere)

### Module not found errors
```bash
# In backend folder
rm -rf node_modules
npm install

# In frontend folder
rm -rf node_modules
npm install
```

---

## Contact

For questions or issues, please contact the development team.

