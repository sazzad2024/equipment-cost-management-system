# 🔒 Git Security Guide - What NOT to Commit

## ⚠️ CRITICAL - NEVER COMMIT THESE:

### 1. **Environment Variables (.env files)**
```
❌ backend/.env
❌ .env
❌ .env.local
❌ .env.production
```
**Why:** Contains:
- MongoDB connection strings with passwords
- JWT secrets
- Cookie secrets
- API keys
- Database credentials

**Example of what's inside:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
COOKIE_SECRET=a8f5f167f44f4964e6c998dee827110c
```

### 2. **Deployment Scripts with Credentials**
```
❌ deploy.sh
❌ deploy-to-ec2.sh
❌ backend/deploy.sh
```
**Why:** May contain:
- EC2 IP addresses
- SSH keys
- AWS credentials
- Server passwords

### 3. **Compiled/Build Outputs**
```
❌ frontend/dist/
❌ frontend/static/
❌ node_modules/
❌ *.zip files
```
**Why:** 
- Large files
- Can be regenerated
- Waste repository space

### 4. **Sensitive Data Files**
```
❌ Tool without 2026 Aug 9.xlsx (if contains sensitive data)
❌ *.pem files (private keys)
❌ *.key files
❌ *.p12 files (certificates)
```

### 5. **Logs & Temporary Files**
```
❌ *.log
❌ logs/
❌ tmp/
❌ temp/
```

---

## ✅ SAFE TO COMMIT:

### Configuration Files (without secrets)
```
✅ package.json
✅ package-lock.json (optional - some teams exclude)
✅ angular.json
✅ tsconfig.json
✅ app.js (but ensure it uses process.env, not hardcoded secrets)
✅ *.component.ts
✅ *.service.ts
✅ README.md
✅ Documentation files (*.md)
```

### Scripts (that don't contain credentials)
```
✅ fix-with-excel-values.js (uses .env, not hardcoded)
✅ remove-caterpillar-2025.js (uses .env, not hardcoded)
✅ upload-data.js
```

### Source Code
```
✅ All TypeScript/JavaScript source files
✅ HTML templates
✅ SCSS/CSS files
✅ Component files
✅ Service files
```

---

## 🔍 How to Check Before Committing:

### 1. Check for sensitive data in files:
```bash
# Search for MongoDB URIs
grep -r "mongodb+srv://" . --exclude-dir=node_modules

# Search for passwords
grep -r "password" . --exclude-dir=node_modules --exclude-dir=.git

# Search for .env files
find . -name ".env" -o -name ".env.*"
```

### 2. Check what will be committed:
```bash
git status
git diff --cached
```

### 3. Review staged files:
```bash
git ls-files --cached
```

---

## 🛡️ Security Best Practices:

### 1. **Use Environment Variables**
```javascript
// ✅ GOOD - Use environment variables
const mongoUri = process.env.MONGODB_URI;

// ❌ BAD - Never hardcode
const mongoUri = 'mongodb+srv://user:pass@cluster.mongodb.net/db';
```

### 2. **Create .env.example**
Create a template file showing what variables are needed:
```bash
# backend/.env.example
MONGODB_URI=your_mongodb_uri_here
COOKIE_SECRET=your_secret_here
PORT=8083
NODE_ENV=development
```

### 3. **Never Commit Real Credentials**
Even in comments or documentation:
```javascript
// ❌ BAD - Don't do this
// const mongoUri = 'mongodb+srv://user:pass@cluster.net/db';
```

### 4. **Use Git Secrets Scanner**
Consider using tools like:
- `git-secrets` (AWS)
- `truffleHog` (scans for secrets)
- GitHub's built-in secret scanning

---

## 📋 Pre-Commit Checklist:

Before committing, verify:

- [ ] No `.env` files are staged
- [ ] No hardcoded passwords or API keys
- [ ] No MongoDB connection strings with credentials
- [ ] No private keys (`.pem`, `.key` files)
- [ ] No deployment scripts with credentials
- [ ] No large files (images, videos, zip files)
- [ ] No `node_modules/` directory
- [ ] No build outputs (`dist/`, `static/`)
- [ ] No log files
- [ ] No temporary files

---

## 🚨 If You Accidentally Committed Secrets:

### 1. **Remove from Git History:**
```bash
# Remove file from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/secret-file" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (⚠️ WARNING: This rewrites history)
git push origin --force --all
```

### 2. **Rotate All Exposed Secrets:**
- Change MongoDB password
- Generate new JWT secret
- Update all API keys
- Change all passwords

### 3. **Use GitHub Secret Scanning:**
GitHub will alert you if secrets are detected in your repository.

---

## 📝 Example .gitignore Structure:

Your root `.gitignore` should include:
```
# Environment variables
.env
.env.*

# Dependencies
node_modules/

# Build outputs
dist/
static/

# Logs
*.log

# IDE files
.vscode/
.idea/

# OS files
.DS_Store
Thumbs.db

# Deployment files
*.zip
*.pem
```

---

## ✅ Safe Repository Structure:

```
equipment-cost-management-system/
├── .gitignore          ✅ Commit
├── README.md            ✅ Commit
├── backend/
│   ├── .gitignore      ✅ Commit
│   ├── package.json     ✅ Commit
│   ├── app.js           ✅ Commit
│   ├── .env.example     ✅ Commit (template)
│   └── .env             ❌ NEVER COMMIT
├── frontend/
│   ├── .gitignore       ✅ Commit
│   ├── package.json     ✅ Commit
│   ├── src/             ✅ Commit (all source)
│   └── static/          ❌ Don't commit (build output)
└── Documentation files  ✅ Commit
```

---

## 🔐 Recommended Repository Setup:

1. **Create `.env.example` files:**
   ```bash
   # backend/.env.example
   MONGODB_URI=your_mongodb_uri_here
   COOKIE_SECRET=your_secret_here
   PORT=8083
   NODE_ENV=development
   ```

2. **Document required environment variables:**
   Add to README.md:
   ```markdown
   ## Environment Variables
   
   Create a `.env` file in the backend directory with:
   - MONGODB_URI
   - COOKIE_SECRET
   - PORT
   - NODE_ENV
   ```

3. **Use GitHub Secrets for CI/CD:**
   If using GitHub Actions, store secrets in:
   Settings → Secrets and variables → Actions

---

## ⚡ Quick Command to Check:

```bash
# Check what will be committed
git status

# Check for .env files
find . -name ".env" -o -name ".env.*" | grep -v node_modules

# Check file sizes (avoid large files)
find . -type f -size +10M | grep -v node_modules

# Review staged changes
git diff --cached
```

---

**Remember:** Once you commit secrets to Git, they're in the history forever. Always check before committing!

