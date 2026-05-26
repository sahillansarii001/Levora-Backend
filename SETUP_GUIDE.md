# LEVORA ACADEMY Backend - Setup Guide

Complete step-by-step guide to set up and run the LEVORA ACADEMY backend API.

---

## ✅ Prerequisites

Before starting, ensure you have installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** (optional) - [Download](https://git-scm.com/)
- **Postman** (for API testing) - [Download](https://www.postman.com/)

### Verify Installation
```bash
node --version      # Should show v14.0.0 or higher
npm --version       # Should show npm version
psql --version      # Should show PostgreSQL version
```

---

## 🔧 Step 1: Initial Setup

### 1.1 Navigate to Server Directory
```bash
cd "Levora Academy"
cd Server
```

### 1.2 Install Dependencies
```bash
npm install
```

This will install all required packages from `package.json`:
- Express.js
- Sequelize ORM
- JWT authentication
- Cloudinary
- Razorpay
- Nodemailer
- Twilio
- And more...

**Expected Output:**
```
npm WARN optional SKIPPING OPTIONAL DEPENDENCY: fsevents@...
added 250+ packages in 45s
```

---

## 🗄️ Step 2: Database Setup

### 2.1 Create PostgreSQL Database

#### On Windows (Using pgAdmin)
1. Open **pgAdmin 4**
2. Right-click on **Databases** → Create → Database
3. Enter name: `levora_academy`
4. Click **Save**

#### On macOS/Linux (Using Terminal)
```bash
psql -U postgres
CREATE DATABASE levora_academy;
\q
```

### 2.2 Verify Database Creation
```bash
psql -U postgres -l | grep levora_academy
```

---

## 📋 Step 3: Environment Configuration

### 3.1 Copy Environment Template
```bash
cp .env.example .env
```

### 3.2 Edit `.env` File

Open `.env` in your text editor and fill in the values:

```env
# ===== SERVER CONFIGURATION =====
PORT=5000
NODE_ENV=development

# ===== DATABASE CONFIGURATION =====
DATABASE_URL=postgresql://postgres:password@localhost:5432/levora_academy
DB_HOST=localhost
DB_PORT=5432
DB_NAME=levora_academy
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# ===== JWT CONFIGURATION =====
JWT_SECRET=your_super_secret_jwt_key_change_in_production_12345
JWT_REFRESH_SECRET=your_refresh_secret_key_change_in_production_67890
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# ===== ADMIN CREDENTIALS =====
ADMIN_EMAIL=admin@levoraacademy.com
ADMIN_PASSWORD=AdminPassword123

# ===== CLOUDINARY (Image Hosting) =====
# Sign up at https://cloudinary.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ===== RAZORPAY (Payment Gateway) =====
# Sign up at https://razorpay.com
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# ===== EMAIL CONFIGURATION =====
# Using Gmail App Password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SENDER_EMAIL=noreply@levoraacademy.com
SENDER_NAME=LEVORA ACADEMY

# ===== SMS CONFIGURATION =====
# Sign up at https://www.twilio.com
TWILIO_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE=+1234567890

# ===== FRONTEND CONFIGURATION =====
FRONTEND_URL=http://localhost:3000

# ===== LOGGING =====
LOG_LEVEL=debug

# ===== OTP CONFIGURATION =====
OTP_EXPIRY=600
MAX_OTP_ATTEMPTS=3
```

### 3.3 Important Configuration Details

#### Database Password
- Replace `your_postgres_password` with your PostgreSQL password
- Default password during installation is often `postgres` or `password`

#### JWT Secrets
- Generate secure strings (at least 32 characters)
- Keep these values secret!
- Different secrets for access and refresh tokens

#### Gmail Setup (for Email)
1. Enable 2-factor authentication on your Google account
2. Create an [App Password](https://myaccount.google.com/apppasswords)
3. Use the generated password in `SMTP_PASS`

#### External Services (Development)
These are optional for testing:
- **Cloudinary** - [Sign up free](https://cloudinary.com/users/register/free)
- **Razorpay** - [Get sandbox keys](https://dashboard.razorpay.com/app/keys)
- **Twilio** - [Free trial](https://www.twilio.com/try-twilio)

---

## 🚀 Step 4: Start the Server

### 4.1 Run in Development Mode (with auto-reload)
```bash
npm run dev
```

**Expected Output:**
```
✓ Database synced successfully
✓ Server running on port 5000
✓ Environment: development
✓ API Health Check: http://localhost:5000/health
```

### 4.2 Run in Production Mode
```bash
npm start
```

### 4.3 Verify Server is Running

Open your browser and visit:
```
http://localhost:5000/health
```

You should see:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-05-26T10:30:00.000Z"
}
```

---

## 🧪 Step 5: Test the API

### 5.1 Using Postman

1. **Open Postman**
2. **Create a New Request**
3. **Test Health Endpoint**
   - Method: `GET`
   - URL: `http://localhost:5000/health`
   - Click **Send**

### 5.2 Test Student Registration

```
POST http://localhost:5000/api/auth/student/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "Password123",
  "dob": "2008-01-15",
  "schoolName": "ABC School",
  "className": "10th"
}
```

### 5.3 Test Course Listing

```
GET http://localhost:5000/api/courses
```

---

## 📊 Step 6: Verify Database

### 6.1 Connect to PostgreSQL
```bash
psql -U postgres -d levora_academy
```

### 6.2 View Created Tables
```sql
\dt              -- List all tables
SELECT * FROM students;
SELECT * FROM courses;
```

### 6.3 Exit PostgreSQL
```sql
\q
```

---

## 🔐 Step 7: Testing Authentication

### 7.1 Admin Login
```bash
POST http://localhost:5000/api/auth/admin/login
{
  "email": "admin@levoraacademy.com",
  "password": "AdminPassword123"
}
```

### 7.2 Store Token
- Copy the `accessToken` from response
- Use in Authorization header for protected routes:
```
Authorization: Bearer <your_access_token>
```

---

## 📂 Project Structure Overview

```
Server/
├── src/
│   ├── config/          # Database, Cloudinary, Razorpay configs
│   ├── models/          # Sequelize database models
│   ├── controllers/     # Business logic for routes
│   ├── routes/          # API endpoint definitions
│   ├── middleware/      # Auth, upload, rate limiting
│   ├── utils/           # Helper functions (OTP, email, etc)
│   ├── validators/      # Input validation rules
│   └── app.js          # Express app configuration
├── server.js            # Server entry point
├── package.json         # Dependencies
├── .env                 # Environment variables
├── .env.example         # Template for .env
├── .gitignore          # Git ignore rules
└── README.md           # API documentation
```

---

## 🎯 Next Steps

### Create Your First Course (Admin)
```bash
POST http://localhost:5000/api/courses
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Class 10 CBSE Mathematics",
  "slug": "class-10-cbse-math",
  "description": "Complete mathematics course for Class 10 CBSE board",
  "category": "school",
  "duration": "12 months",
  "fees": 4999.00,
  "eligibility": "Class 10 students",
  "thumbnailUrl": "https://example.com/image.jpg"
}
```

### Register as Student
```bash
POST http://localhost:5000/api/auth/student/register

{
  "name": "Rahul Kumar",
  "email": "rahul@example.com",
  "phone": "9876543210",
  "password": "StudentPass123",
  "dob": "2008-05-15",
  "schoolName": "St. Xavier's School",
  "className": "10th"
}
```

---

## 🐛 Troubleshooting

### Issue: "Error: connect ECONNREFUSED 127.0.0.1:5432"
**Solution:** PostgreSQL is not running
- Start PostgreSQL service
- On Windows: Open Services, find PostgreSQL, and start it
- On macOS: `brew services start postgresql`
- On Linux: `sudo service postgresql start`

### Issue: "Error: database "levora_academy" does not exist"
**Solution:** Create the database first
```bash
psql -U postgres
CREATE DATABASE levora_academy;
\q
```

### Issue: "Port 5000 is already in use"
**Solution:** Change PORT in .env or kill the process using the port
```bash
# On macOS/Linux
lsof -i :5000
kill -9 <PID>

# On Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Issue: "Invalid JWT Secret"
**Solution:** Ensure JWT_SECRET is set and long enough (32+ characters)

### Issue: "Cannot find module 'X'"
**Solution:** Reinstall dependencies
```bash
rm -rf node_modules
npm install
```

---

## 🚀 Production Deployment

### Before Deploying:
1. Update `.env` with production values
2. Set `NODE_ENV=production`
3. Generate strong JWT secrets
4. Setup production database
5. Configure CORS for production domain
6. Setup HTTPS/SSL certificates

### Deploy to Heroku
```bash
heroku login
heroku create levora-academy-api
git push heroku main
```

### Deploy to AWS/DigitalOcean
1. Create a droplet/instance
2. Install Node.js and PostgreSQL
3. Clone repository
4. Setup environment variables
5. Install PM2: `npm install -g pm2`
6. Start with PM2: `pm2 start server.js`

---

## 📚 Additional Resources

- [Express.js Docs](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [JWT Explained](https://jwt.io/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Postman Learning Center](https://learning.postman.com/)

---

## ✅ Checklist

- [ ] Node.js installed
- [ ] PostgreSQL installed and running
- [ ] Database created
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured
- [ ] Server started (`npm run dev`)
- [ ] Health check working
- [ ] Database tables created
- [ ] Test API endpoints in Postman
- [ ] External services configured (optional)

---

## 🆘 Need Help?

1. Check logs in terminal for error messages
2. Verify all `.env` values are correct
3. Ensure PostgreSQL is running
4. Check that ports are not blocked by firewall
5. Review API documentation in `README.md`

---

**Status:** ✅ Setup Complete  
**Last Updated:** 2026-05-26
