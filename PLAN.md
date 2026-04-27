# TaskHive - Technical Planning Document

## Backend Choice: Express.js

**Justification:** Express.js is lightweight, has excellent middleware ecosystem (helmet, rate-limit, cors, express-validator), perfect for JWT authentication with HTTP-only cookies, easy MongoDB integration via Mongoose ODM, and ideal for serverless deployment on Vercel. Compared to NestJS (overkill for this scope) and Next.js API routes (limited flexibility), Express provides the right balance of control and simplicity.

---

## Architecture Overview

- **Frontend**: Next.js 14 (App Router) - Server-side rendering, built-in routing, optimal for Vercel deployment
- **Backend**: Express.js + MongoDB (Mongoose ODM) - RESTful API following MVC pattern
- **Authentication**: JWT with refresh token rotation (access: 15min, refresh: 7d)
- **Security**: HTTP-only cookies (prevents XSS), SameSite=Strict (CSRF protection)
- **Deployment**: Vercel (frontend + backend as serverless functions)

### Folder Structure

TaskHive/
├── backend/
│ ├── api/
│ │ └── index.ts # Vercel serverless entry point
│ ├── src/
│ │ ├── controllers/
│ │ │ ├── authController.ts
│ │ │ └── taskController.ts
│ │ ├── middleware/
│ │ │ ├── auth.ts
│ │ │ ├── errorHandler.ts
│ │ │ └── validation.ts
│ │ ├── models/
│ │ │ ├── Task.ts
│ │ │ └── User.ts
│ │ ├── routes/
│ │ │ ├── authRoutes.ts
│ │ │ └── taskRoutes.ts
│ │ └── server.ts # Local development server
│ ├── .env.example
│ ├── package.json
│ ├── tsconfig.json
│ └── vercel.json
├── frontend/
├── app/
│ ├── page.tsx  
│ ├── dashboard/
│ │ └── page.tsx  
│ ├── login/
│ │ ├── LoginForm.tsx  
│ │ └── page.tsx  
│ ├── register/
│ │ └── page.tsx  
│ ├── favicon.ico  
│ ├── globals.css  
│ └── layout.tsx
│ ├── page.tsx
├── components/
│ ├── ConfirmModal.tsx  
│ ├── StatsCards.tsx  
│ ├── TaskCard.tsx  
│ └── TaskModal.tsx  
├── lib/
│ └── api.ts  
├── public/
│ ├── logo_TaskHive.jpg  
│ ├── next.svg  
│ ├── vercel.svg  
│ ├── file.svg  
│ ├── globe.svg  
│ └── window.svg  
├── .env.local.example  
├── .gitignore  
├── eslint.config.mjs  
├── next-env.d.ts  
├── next.config.ts  
├── package.json  
├── postcss.config.mjs  
├── tailwind.config.ts  
├── tsconfig.json  
└── README.md

---

## Security Considerations

### Client-Side Security

- **XSS (Cross-Site Scripting)**: React auto-escapes content with CSP headers via Helmet.js
- **CSRF (Cross-Site Request Forgery)**: HTTP-only cookies with SameSite=Strict attribute
- **Token Theft**: No localStorage usage - tokens stored only in HTTP-only cookies
- **Secure Transport**: HTTPS enforcement automatically provided by Vercel

### Server-Side Security

- **Password Exposure**: bcrypt hashing with salt rounds = 12
- **Brute Force Attacks**: Rate limiting implemented on auth routes
- **NoSQL Injection**: Schema validation with Mongoose + input sanitization with express-validator
- **Stack Trace Leaks**: Conditional error handling hides details in production (NODE_ENV=production)
- **JWT Tampering**: Strong secrets with 32+ characters for JWT_SECRET and REFRESH_SECRET
- **Session Fixation**: Refresh token rotation - old token invalidated on each refresh

### Security Headers (via Helmet.js)

- Content Security Policy (CSP) configured to restrict sources
- XSS protection enabled
- No sniffing prevention for MIME types
- Frame options set to DENY

### Rate Limiting Configuration

- **`/api/auth/login`** → 5 requests per 15 minutes
- **`/api/auth/register`** → 5 requests per 15 minutes
- **`/api/*` (all other routes)** → 100 requests per 15 minutes

---

## Better Tech Choices (If Applicable)

- **NestJS**: Use for large teams and enterprise apps - Overkill for this scope, adds unnecessary complexity
- **Redis**: Use for token blacklisting at scale (>10,000 users) - Not needed for assessment project
- **PostgreSQL**: Use for complex relational data - Task management is document-oriented
- **Docker + Kubernetes**: Use for microservices architecture - Single service, Vercel serverless is sufficient
- **GraphQL**: Use for complex data fetching - REST is simpler for CRUD operations
- **tRPC**: Use for type-safe full-stack apps - Adds complexity, not necessary for this scope

### If Scaling to Production (>10,000 users):

- Implement Redis for token blacklisting and session caching
- Add rate limiting at CDN level (Cloudflare)
- Configure read replicas for MongoDB Atlas
- Migrate to dedicated backend hosting (AWS/GCP) instead of serverless
- Set up CI/CD pipeline with automated testing

---

## Novelty Feature (Beyond CRUD)

### Overdue Task Tracking System

- Automatic detection of tasks with due dates before current date
- Visual highlighting with red "Overdue" badge in the task list
- Statistics card showing count of overdue tasks on dashboard
- Prevents incorrectly marking overdue tasks as "Due Today"

**Implementation in `taskController.ts`:**

overdue: tasks.filter(t => {
if (!t.dueDate) return false;
const dueDate = new Date(t.dueDate);
const today = new Date();
today.setHours(0, 0, 0, 0);
dueDate.setHours(0, 0, 0, 0);
return dueDate < today && !t.completed;
}).length

## Deployment Architecture

### Vercel Serverless Deployment Flow

User Request → Vercel Edge → Backend Function → MongoDB Atlas
↓
Frontend Static Files

### Environment Variables

**Backend (Vercel Environment Variables)**

MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/TaskHive
JWT_SECRET=your_jwt_secret_min_32_characters_long
REFRESH_SECRET=your_refresh_secret_min_32_characters_long
NODE_ENV=production
CLIENT_URL=https://frontend.vercel.app

**Frontend (Vercel Environment Variables)**

NEXT_PUBLIC_API_URL=https://backend.vercel.app

# Database Connection Strategy for Serverless

// Connection caching for serverless functions
let cachedConnection: typeof mongoose | null = null;

async function connectDB() {
if (cachedConnection) return cachedConnection;

cachedConnection = await mongoose.connect(MONGODB_URI, {
serverSelectionTimeoutMS: 5000,
socketTimeoutMS: 10000,
});

return cachedConnection;
}
