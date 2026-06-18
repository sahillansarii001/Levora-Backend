# LEVORA ACADEMY - Backend API Documentation

A production-ready Express.js REST API for LEVORA ACADEMY, a premium Indian EdTech platform.

---

## 📋 Project Structure

```
Server/
├── src/
│   ├── config/
│   │   ├── database.js        # MongoDB configuration
│   │   ├── cloudinary.js      # Cloudinary setup
│   │   ├── razorpay.js        # Razorpay setup
│   │   └── nodemailer.js      # Email configuration
│   │
│   ├── models/
│   │   ├── index.js           # Model associations
│   │   ├── Student.js
│   │   ├── Parent.js
│   │   ├── Faculty.js
│   │   ├── Course.js
│   │   ├── StudyMaterial.js
│   │   ├── Admission.js
│   │   ├── FeeRecord.js
│   │   ├── Attendance.js
│   │   ├── Test.js
│   │   ├── TestResult.js
│   │   ├── BlogPost.js
│   │   ├── Testimonial.js
│   │   ├── Result.js
│   │   ├── Enquiry.js
│   │   ├── Notice.js
│   │   └── OTPRecord.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── facultyController.js
│   │   ├── admissionController.js
│   │   └── [other controllers...]
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── courses.js
│   │   ├── faculty.js
│   │   ├── materials.js
│   │   ├── admissions.js
│   │   ├── student.js
│   │   ├── parent.js
│   │   ├── attendance.js
│   │   ├── tests.js
│   │   ├── fees.js
│   │   ├── blog.js
│   │   ├── admin.js
│   │   ├── contact.js
│   │   └── notices.js
│   │
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   ├── upload.js          # Multer configuration
│   │   ├── rateLimiter.js     # Rate limiting
│   │   └── errorHandler.js    # Error handling
│   │
│   ├── utils/
│   │   ├── generateStudentId.js
│   │   ├── generateOTP.js
│   │   ├── sendEmail.js
│   │   ├── sendSMS.js
│   │   ├── generateQR.js
│   │   ├── razorpay.js
│   │   └── responseHelper.js
│   │
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── admissionValidator.js
│   │   ├── courseValidator.js
│   │   └── feeValidator.js
│   │
│   └── app.js                 # Express app setup
│
├── server.js                  # Server entry point
├── package.json
├── .env.example
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (v4.4+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd "Levora Academy/Server"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGO_URI=mongodb://localhost:27017/levora_academy
   
   # JWT
   JWT_SECRET=your_jwt_secret_key
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Razorpay
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   
   # Email
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   
   # SMS
   TWILIO_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE=+1234567890
   
   # Frontend
   FRONTEND_URL=http://localhost:3000
   ```

4. **Ensure MongoDB is running**
   ```bash
   # Make sure your MongoDB service is active
   ```

5. **Start the server**
   ```bash
   # Development (with nodemon)
   npm run dev
   
   # Production
   npm start
   ```

   Server will start on `http://localhost:5000`

---

## 📚 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /api/auth/student/register` - Student registration
- `POST /api/auth/student/login` - Student login
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/forgot-password` - Request a password reset OTP
- `POST /api/auth/reset-password` - Reset password using OTP

### Course Routes (`/api/courses`)
- `GET /api/courses` - Get all courses (public)
- `GET /api/courses/:slug` - Get course details
- `POST /api/courses` - Create course (admin)
- `PUT /api/courses/:id` - Update course (admin)
- `DELETE /api/courses/:id` - Delete course (admin)

### Faculty Routes (`/api/faculty`)
- `GET /api/faculty` - Get all faculty
- `GET /api/faculty/:id` - Get faculty details
- `POST /api/faculty` - Create faculty (admin)
- `PUT /api/faculty/:id` - Update faculty (admin)
- `DELETE /api/faculty/:id` - Delete faculty (admin)

### Admission Routes (`/api/admissions`)
- `POST /api/admissions` - Submit admission form
- `GET /api/admissions` - Get all admissions (admin)
- `PUT /api/admissions/:id/status` - Update admission status (admin)

### Study Materials (`/api/materials`)
- `GET /api/materials` - Get materials
- `GET /api/materials/:id` - Get material details
- `POST /api/materials` - Upload material (admin/faculty)
- `PUT /api/materials/:id` - Update material
- `DELETE /api/materials/:id` - Delete material
- `GET /api/materials/:id/download` - Download material

### Student Dashboard (`/api/student`)
- `GET /api/student/dashboard` - Dashboard data
- `GET /api/student/attendance` - Attendance records
- `GET /api/student/fees` - Fee information
- `GET /api/student/materials` - Accessible materials
- `GET /api/student/tests` - Available tests
- `GET /api/student/results` - Test results
- `PUT /api/student/profile` - Update profile

### Parent Dashboard (`/api/parent`)
- `GET /api/parent/dashboard` - Dashboard data
- `GET /api/parent/child/attendance` - Child attendance
- `GET /api/parent/child/marks` - Child marks
- `GET /api/parent/child/fees` - Child fees
- `GET /api/parent/notices` - Notices

### Fees (`/api/fees`)
- `GET /api/fees` - Get all fee records (admin)
- `GET /api/fees/student/:studentId` - Student fees
- `POST /api/fees/create` - Create fee record (admin)
- `POST /api/fees/pay` - Initiate payment
- `POST /api/fees/verify` - Verify payment
- `GET /api/fees/:id/receipt` - Generate receipt

### Admin Dashboard (`/api/admin`)
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/analytics/revenue` - Revenue analytics
- `GET /api/admin/analytics/attendance` - Attendance analytics
- `GET /api/admin/analytics/performance` - Performance analytics

---

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Roles
- **admin** - Full system access
- **faculty** - Course & material management
- **student** - Student dashboard access
- **parent** - Parent dashboard access

---

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* data */ }
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Success",
  "data": [ /* items */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ /* error details */ ]
}
```

---

## 🔒 Security Features

- JWT authentication with 15-minute access tokens
- Password hashing with bcryptjs (12 salt rounds)
- Rate limiting (100 req/15min general, 10 req/15min auth)
- CORS protection
- Helmet.js for HTTP headers
- Multer file upload validation
- NoSQL injection prevention via Mongoose ODM
- HTTPS-ready configuration

---

## 🛠️ Development

### Available Scripts
```bash
npm start          # Start production server
npm run dev        # Start with nodemon
npm test           # Run tests
npm run db:migrate # Run migrations
npm run db:seed    # Seed database
```

### Database
Mongoose handles schema creation automatically upon application start.

---

## 📦 Key Dependencies

- **express** - Web framework
- **mongoose** - ODM for MongoDB
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **cloudinary** - Image hosting
- **razorpay** - Payment gateway
- **nodemailer** - Email service
- **twilio** - SMS/OTP service
- **multer** - File uploads
- **helmet** - HTTP headers
- **cors** - CORS middleware
- **morgan** - HTTP logging

---

## 🚢 Deployment

### Environment Setup
```bash
NODE_ENV=production
JWT_SECRET=[generate secure key]
ADMIN_EMAIL=[admin email]
ADMIN_PASSWORD=[admin password]
```

### Database
Update MongoDB connection string for production:
```
MONGO_URI=mongodb://prod-server:27017/levora_academy
```

### Starting Server
```bash
npm start
```

---

## 📞 API Testing

### Using Postman
1. Import API collection from `/postman` (if available)
2. Set environment variables
3. Test endpoints with sample data

### Using cURL
```bash
curl -X POST http://localhost:5000/api/auth/student/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"password123"}'
```

---

## ⚠️ Common Issues

### Database Connection Error
- Verify MongoDB is running
- Check `MONGO_URI` in `.env`
- Ensure database is accessible

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000
# Kill process (on macOS/Linux)
kill -9 <PID>
```

### JWT Token Expired
- Request a new token using the refresh endpoint
- Store tokens securely on client

---

## 📞 Support

For issues or questions:
1. Check error logs in console
2. Verify `.env` configuration
3. Check MongoDB connection
4. Review API documentation

---

## 📄 License

ISC

---

**Version:** 1.0.0  
**Last Updated:** 2026-05-26
"# Levora-Backend" 
