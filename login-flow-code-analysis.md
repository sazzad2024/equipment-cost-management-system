# Complete Login Flow Code Analysis

## 🔐 Login Flow: LoginComponent → AuthService.login() → POST /api/auth/signin → AuthController.signin() → MongoDB → JWT Token → StorageService → UI Update

---

## 📱 Step 1: Frontend - LoginComponent (User Interaction)

### **login.component.html** - User Interface
```html
<form
  *ngIf="!isLoggedIn"
  name="form"
  (ngSubmit)="f.form.valid && onSubmit()"
  #f="ngForm"
  novalidate
>
  <div class="form-group">
    <label for="username">Username</label>
    <input
      type="text"
      class="form-control"
      name="username"
      [(ngModel)]="form.username"
      required
      #username="ngModel"
    />
  </div>
  <div class="form-group">
    <label for="password">Password</label>
    <input
      type="password"
      class="form-control"
      name="password"
      [(ngModel)]="form.password"
      required
      minlength="6"
      #password="ngModel"
    />
  </div>
  <div class="form-group">
    <button class="btn btn-primary btn-block">
      Login
    </button>
  </div>
  <div class="form-group">
    <div *ngIf="f.submitted && isLoginFailed" class="alert alert-danger" role="alert">
      Login failed: {{ errorMessage }}
    </div>
  </div>
</form>

<div class="alert alert-success" *ngIf="isLoggedIn">
  Logged in as {{ roles }}.
</div>
```

### **login.component.ts** - Component Logic
```typescript
export class LoginComponent implements OnInit {
  form: any = {
    username: null,
    password: null
  };
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];

  constructor(
    private authService: AuthService, 
    private storageService: StorageService,  
    private router: Router
  ) { }

  ngOnInit(): void {
    if (this.storageService.isLoggedIn()) {
      this.isLoggedIn = true;
      this.roles = this.storageService.getUser().roles;
    }
  }

  onSubmit(): void {
    const { username, password } = this.form;

    // 🔥 STEP 2: Call AuthService.login()
    this.authService.login(username, password).subscribe({
      next: data => {
        // 🔥 STEP 7: Save user data and token
        this.storageService.saveUser(data);
        console.log(data);
        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.roles = this.storageService.getUser().roles;
        this.reloadPage();
      },
      error: err => {
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
      }
    });
  }

  reloadPage(): void {
    window.location.reload();
  }
}
```

---

## 🌐 Step 2: Frontend - AuthService (HTTP Request)

### **auth.service.ts** - Service Layer
```typescript
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private storageService: StorageService) {}

  // 🔥 STEP 3: Make HTTP POST request to backend
  login(username: string, password: string): Observable<any> {
    return this.http.post(
      AUTH_API + 'signin',  // http://13.220.51.254:8083/api/auth/signin
      {
        username,
        password,
      },
      httpOptions  // { headers: { 'Content-Type': 'application/json' } }
    );
  }
}

const AUTH_API = 'http://13.220.51.254:8083/api/auth/';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
```

---

## 🛣️ Step 3: Backend - Route Handler

### **auth.routes.js** - Route Definition
```javascript
const { verifySignUp } = require("../middlewares");
const controller = require("../controllers/auth.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  // 🔥 STEP 4: Route POST /api/auth/signin to AuthController.signin
  app.post("/api/auth/signin", controller.signin);
};
```

---

## 🎯 Step 4: Backend - AuthController (Business Logic)

### **auth.controller.js** - Controller Logic
```javascript
const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

// 🔥 STEP 5: Handle login request
exports.signin = async (req, res) => {
  try {
    // 🔥 STEP 6: Query MongoDB for user
    const user = await User.findOne({
      username: req.body.username,
    }).populate("roles", "-__v").exec();

    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }

    // 🔥 STEP 7: Verify password
    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({ message: "Invalid Password!" });
    }

    // 🔥 STEP 8: Generate JWT token
    var token = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: 86400, // 24 hours
    });

    // 🔥 STEP 9: Build authorities array
    var authorities = [];
    for (let i = 0; i < user.roles.length; i++) {
      authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
    }
    
    req.session.token = token;

    // 🔥 STEP 10: Send response with user data and token
    res.status(200).send({
      id: user._id,
      username: user.username,
      email: user.email,
      roles: authorities,
      token: token
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
```

---

## 🗄️ Step 5: Backend - MongoDB Query

### **user.model.js** - Database Schema
```javascript
const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    email: String,
    password: String,  // Hashed with bcrypt
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }
    ],
    savedModels: {
      type: [String],
      default: [],
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  })
);

module.exports = User;
```

### **MongoDB Query Execution**
```javascript
// This query runs in AuthController.signin()
const user = await User.findOne({
  username: req.body.username,  // Find user by username
}).populate("roles", "-__v").exec();  // Populate roles from Role collection

// Example MongoDB document:
{
  "_id": ObjectId("..."),
  "username": "admin",
  "email": "admin@example.com",
  "password": "$2a$08$...",  // bcrypt hashed password
  "roles": [ObjectId("role_id_1")],
  "savedModels": [],
  "resetPasswordToken": null,
  "resetPasswordExpires": null
}
```

---

## 🔑 Step 6: Backend - JWT Token Generation

### **JWT Token Creation**
```javascript
// In AuthController.signin()
var token = jwt.sign(
  { id: user.id },           // Payload: user ID
  config.secret,             // Secret key from auth.config.js
  { expiresIn: 86400 }        // Expires in 24 hours
);

// Generated JWT Token Example:
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ZjEyMzQ1Njc4OWFiY2RlZiIsImlhdCI6MTY5NzI4NDAwMCwiZXhwIjoxNjk3MzcwNDAwfQ.signature
```

---

## 💾 Step 7: Frontend - StorageService (Token Storage)

### **storage.service.ts** - Token Management
```typescript
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  const USER_KEY = 'auth-user';

  // 🔥 STEP 8: Save user data and token to sessionStorage
  public saveUser(user: any): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
   
    if (user.token) {
      window.sessionStorage.setItem('auth-token', user.token);
      console.log('Token saved:', user.token);
    } else {
      console.log('Token not found in user object');
    }
  }

  public getToken(): string | null {
    return window.sessionStorage.getItem('auth-token');
  }

  public getUser(): any {
    const user = window.sessionStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : {};
  }

  public isLoggedIn(): boolean {
    return this.getToken() !== null;
  }
}
```

### **SessionStorage Data Structure**
```javascript
// After successful login, sessionStorage contains:
sessionStorage.setItem('auth-user', JSON.stringify({
  id: "64f123456789abcdef",
  username: "admin",
  email: "admin@example.com",
  roles: ["ROLE_ADMIN"],
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}));

sessionStorage.setItem('auth-token', "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");
```

---

## 🎨 Step 8: Frontend - UI Update

### **LoginComponent Response Handling**
```typescript
// In login.component.ts onSubmit()
this.authService.login(username, password).subscribe({
  next: data => {
    // 🔥 STEP 9: Process successful login response
    this.storageService.saveUser(data);  // Save to sessionStorage
    console.log(data);                   // Log response data
    this.isLoginFailed = false;          // Clear error state
    this.isLoggedIn = true;             // Set logged in state
    this.roles = this.storageService.getUser().roles;  // Get user roles
    this.reloadPage();                   // Refresh page to update UI
  },
  error: err => {
    // Handle login errors
    this.errorMessage = err.error.message;
    this.isLoginFailed = true;
  }
});
```

### **UI State Changes**
```html
<!-- Before Login -->
<form *ngIf="!isLoggedIn" (ngSubmit)="onSubmit()">
  <!-- Login form fields -->
</form>

<!-- After Successful Login -->
<div class="alert alert-success" *ngIf="isLoggedIn">
  Logged in as {{ roles }}.  <!-- Shows: "Logged in as ROLE_ADMIN" -->
</div>
```

---

## 🔄 Complete Data Flow Summary

```
1. User fills form → LoginComponent.form = {username: "admin", password: "123456"}

2. User clicks Login → onSubmit() called

3. AuthService.login() → HTTP POST to http://13.220.51.254:8083/api/auth/signin
   Request Body: {username: "admin", password: "123456"}

4. Backend Route → POST /api/auth/signin → AuthController.signin()

5. AuthController.signin() → MongoDB query:
   User.findOne({username: "admin"}).populate("roles")

6. MongoDB returns user document with hashed password

7. bcrypt.compareSync() → Verify password against hash

8. jwt.sign() → Generate JWT token with user ID

9. Response sent to frontend:
   {
     id: "64f123456789abcdef",
     username: "admin", 
     email: "admin@example.com",
     roles: ["ROLE_ADMIN"],
     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }

10. StorageService.saveUser() → Save to sessionStorage

11. UI updates → isLoggedIn = true, roles = ["ROLE_ADMIN"]

12. Page reloads → User sees logged-in state
```

---

## 🔐 Security Features

### **Password Security**
- Passwords hashed with bcrypt (salt rounds: 8)
- Never stored in plain text
- bcrypt.compareSync() for verification

### **JWT Security**
- Token contains user ID only
- 24-hour expiration
- Secret key from environment config
- Stored in sessionStorage (not localStorage)

### **CORS Protection**
- Backend allows specific origins only
- Headers: Origin, Content-Type, Accept
- Credentials: true for cookie support

### **Session Management**
- Token stored in both cookie and sessionStorage
- Automatic cleanup on logout
- Role-based access control

This complete flow shows how a simple login form triggers a secure authentication process involving frontend services, HTTP requests, backend controllers, database queries, JWT generation, and UI updates!




