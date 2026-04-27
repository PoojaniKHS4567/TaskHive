# TaskHive - Task Management System

A full-stack task management application with JWT authentication, task CRUD operations, priority levels, due date tracking, and overdue detection.

## Live URLs

- **Frontend**: [https://task-hive-fy4e.vercel.app](https://task-hive-fy4e.vercel.app)
- **Backend API**: [https://task-hive-five-pi.vercel.app](https://task-hive-five-pi.vercel.app)
- **Health Check**: [https://task-hive-five-pi.vercel.app/health](https://task-hive-five-pi.vercel.app/health)

---

## Features

### Core Features

- User Registration & Login (JWT with refresh token rotation)
- Task CRUD Operations (Create, Read, Update, Delete)
- Priority System (Low, Medium, High with color-coded badges)
- Due Date Tracking with Overdue Detection
- Dashboard Statistics (Total, Completed, Pending, Overdue)
- Task Filtering (by priority and completion status)

### UI/UX Features

- Responsive design (mobile, tablet, desktop)
- Loading states and error handling
- Form validation with real-time feedback
- Confirmation modals for delete/complete actions
- Smooth animations (Framer Motion)

### Security Features

- Password hashing (bcrypt, salt rounds = 12)
- JWT stored in HTTP-only cookies (prevents XSS)
- CSRF protection (SameSite=Strict cookies)
- Rate limiting (5 attempts per 15 minutes for auth)
- Input validation and sanitization (express-validator)
- Security headers (Helmet.js with CSP)
- No stack trace leaks in production

### Novelty Feature

- **Overdue Task Tracking**: Automatic detection and visual highlighting of tasks past due date, with statistics card showing count of overdue tasks

---

## Tech Stack

| Layer      | Technology               | Version    |
| ---------- | ------------------------ | ---------- |
| Frontend   | Next.js                  | 14.2.4     |
| Styling    | Tailwind CSS             | 4.0        |
| Animations | Framer Motion            | 12.38      |
| Backend    | Express.js               | 5.2.1      |
| Database   | MongoDB Atlas            | 6.0+       |
| ODM        | Mongoose                 | 9.5        |
| Auth       | JSON Web Token           | 9.0.3      |
| Validation | express-validator        | 7.3        |
| Security   | Helmet, CORS, Rate Limit | Latest     |
| Language   | TypeScript               | 5.0+       |
| Deployment | Vercel                   | Serverless |

---

## Local Development Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (free tier) or local MongoDB instance
- Git

### Step 1: Clone Repository

git clone https://github.com/PoojaniKHS4567/TaskHive.git
cd TaskHive

### Step 2: Backend Setup

cd backend
npm install

# Create environment file

cp .env.example .env

# Edit .env with your values

# - Add MongoDB connection string

# - Generate JWT secrets (use long random strings)

**Example .env file:**

NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/TaskHive
JWT_SECRET=your_jwt_secret_min_32_characters_long
REFRESH_SECRET=your_refresh_secret_min_32_characters_long
CLIENT_URL=http://localhost:3000

# Start backend server

npm run dev

# Server running at http://localhost:5000

### Step 3: Frontend Setup

cd frontend
npm install

# Create environment file

cp .env.local.example .env.local

# Edit .env.local with:

# NEXT_PUBLIC_API_URL=http://localhost:5000

# Start frontend development server

npm run dev

# App running at http://localhost:3000

### Step 4: MongoDB Atlas Setup (if using cloud)

1. Create account at MongoDB Atlas
2. Create free cluster (M0 tier)
3. Click Connect → Connect your application
4. Copy connection string: mongodb+srv://username:password@cluster.mongodb.net/TaskHive
5. Network Access → Add IP 0.0.0.0/0 (Allow from anywhere)
6. Database Access → Create user with read/write permissions

## API Documentation

# Authentication Endpoints (Public)

- POST /api/auth/register → Register new user → Body: { email, password, name }
- POST /api/auth/login → Login user → Body: { email, password }
- POST /api/auth/refresh → Refresh access token → Uses cookie
- POST /api/auth/logout → Logout user → Uses cookie

# Task Endpoints (Protected - requires auth cookie)

- GET /api/tasks → Get all user tasks → Query: ?priority=high&status=active
- GET /api/tasks/:id → Get single task
- POST /api/tasks → Create task → Body: { title, description, priority, dueDate }
- PUT /api/tasks/:id → Update task → Body: { title, description, priority, dueDate, completed }
- DELETE /api/tasks/:id → Delete task

## Deployment Guide

# Deploy Backend to Vercel

1. Push code to GitHub
2. Go to vercel.com and sign in with GitHub
3. Click Add New → Project
4. Select TaskHive repository
5. Configure:

- Root Directory: backend
- Framework Preset: Other

6. Add Environment Variables:

- MONGODB_URI = your MongoDB Atlas connection string
- JWT_SECRET = long random string (32+ chars)
- REFRESH_SECRET = long random string (32+ chars)
- NODE_ENV = production
- CLIENT_URL = your frontend URL (add after frontend deploys)

7. Click Deploy

# Deploy Frontend to Vercel

1. Click Add New → Project
2. Select same TaskHive repository
3. Configure:

- Root Directory: frontend
- Framework Preset: Next.js

4. Add Environment Variable:

- NEXT_PUBLIC_API_URL = your backend URL (from previous step)

5. Click Deploy

### Update Backend CLIENT_URL

1. After frontend deploys, copy your frontend URL
2. Go to backend project → Settings → Environment Variables
3. Add CLIENT_URL = your frontend URL
4. Click Save
5. Redeploy backend

## Security Implementation Details

# Password Hashing

// User.ts pre-save middleware
userSchema.pre('save', async function() {
if (!this.isModified('password')) return;
const salt = await bcrypt.genSalt(12);
this.password = await bcrypt.hash(this.password, salt);
});

# JWT Cookie Configuration

res.cookie('accessToken', token, {
httpOnly: true, // Prevents XSS access
secure: isProduction, // HTTPS only in production
sameSite: 'strict', // CSRF protection
maxAge: 15 _ 60 _ 1000 // 15 minutes
});

# Rate Limiting

const authLimiter = rateLimit({
windowMs: 15 _ 60 _ 1000, // 15 minutes
max: 5, // 5 requests
message: { error: 'Too many login attempts' }
});

# Input Validation

body('email')
.trim()
.isEmail()
.normalizeEmail()
.escape()

### Troubleshooting

## Common Issues and Solutions

- MongoDB timeout → IP not whitelisted → Add 0.0.0.0/0 to Atlas Network Access
- CORS error → CLIENT_URL mismatch → Verify frontend URL matches backend's CLIENT_URL
- 401 Unauthorized → Not logged in → Login first to get auth cookie
- 500 Registration fails → MongoDB connection → Check MONGODB_URI in Vercel env
- 404 Route not found → Wrong endpoint → Check API path (must include /api/)
- Login redirect loop → Auth check failing → Clear browser cookies and retry

## Debugging Backend (Vercel)

1. Go to backend project dashboard
2. Click Functions tab
3. Find the failing function (e.g., api/auth/register)
4. View logs for detailed error messages

## Debugging Frontend (Browser)

1. Open Developer Tools (F12)
2. Check Console for JavaScript errors
3. Check Network tab for failed requests
4. Verify cookies are being set (Application → Cookies)

### Testing the Deployed Application

## Manual Test Flow

1. Visit Frontend: https://task-hive-fy4e.vercel.app
2. Register: Click "Start Free" → Fill form → Submit
3. Login: Enter credentials → Click "Sign In"
4. Create Task: Click "Add New Task" → Fill details → Submit
5. Filter Tasks: Use priority and status dropdowns
6. Complete Task: Click checkbox or "Complete" button
7. Edit Task: Click edit icon → Modify → Save
8. Delete Task: Click delete icon → Confirm deletion
9. Test Overdue: Create task with past due date → Should show red "Overdue" badge
10. Logout: Click logout button

### Performance Optimization

## Implemented

- Compression middleware (gzip)
- MongoDB compound indexes
- React component memoization
- Image optimization (Next.js Image component)
- Lazy loading modals

## Future Improvements

- Add pagination for task list
- Implement Redis caching for frequent queries
- Add WebSocket for real-time updates
- Implement service worker for offline support

### Project Structure Explanation

## Backend (MVC Pattern)

- controllers/ → Business logic (register, login, CRUD operations)
- models/ → Database schemas (User, Task)
- routes/ → API endpoint definitions
- middleware/ → Auth, validation, error handling
- api/ → Vercel serverless entry point

## Frontend (Component-Based)

- app/ → Next.js pages (App Router)
- components/ → Reusable React components
- lib/ → Utilities (fetch wrapper, token refresh)
- public/ → Static assets (logo, images)

### Acknowledgments

- Next.js team for excellent React framework
- Express.js community for robust backend tools
- MongoDB Atlas for free database hosting
- Vercel for free deployment platform
