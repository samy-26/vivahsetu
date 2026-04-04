# VivahSetu - Setup Guide

## Prerequisites
- Node.js 20+
- MySQL 8.0+
- Redis 7+
- npm or yarn

---

## Quick Start (Local Development)

### 1. Clone & Install Dependencies

```bash
# Install backend dependencies
cd apps/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# Copy env example and fill in your values
cp .env.example apps/backend/.env
```

Edit `apps/backend/.env` with your:
- MySQL connection string
- Redis host/port
- Razorpay keys (get from razorpay.com/dashboard)
- AWS S3 credentials
- SMTP credentials (Gmail App Password)

### 3. Setup Database

```bash
cd apps/backend

# Generate Prisma client
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate dev --name init

# Optional: Open Prisma Studio
npx prisma studio
```

### 4. Create Admin User

After running migrations, insert an admin user directly in MySQL:

```sql
INSERT INTO users (email, phone, password, role, is_verified, is_approved, created_at, updated_at)
VALUES (
  'admin@vivahsetu.com',
  '+919999999999',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGAt.0NU.1aJV.rn9ZQ5ZhHAy.W',  -- password: Admin@123
  'ADMIN',
  1,
  1,
  NOW(),
  NOW()
);
```

### 5. Start Development Servers

```bash
# Terminal 1 - Backend (NestJS on port 3001)
cd apps/backend
npm run start:dev

# Terminal 2 - Frontend (Next.js on port 3000)
cd apps/frontend
npm run dev
```

### 6. Access the App

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001/api/v1 |
| Swagger Docs | http://localhost:3001/api/docs |
| Prisma Studio | http://localhost:5555 |

---

## Docker Setup (Recommended for Production)

```bash
# Start all services
docker-compose up -d

# Run migrations inside container
docker exec vivahsetu-backend npx prisma migrate deploy

# View logs
docker-compose logs -f backend
```

---

## Architecture Overview

```
vivahsetu/
├── apps/
│   ├── backend/              # NestJS API
│   │   ├── src/
│   │   │   ├── modules/      # Feature modules
│   │   │   │   ├── auth/     # JWT + OTP auth
│   │   │   │   ├── profiles/ # Profile CRUD + search
│   │   │   │   ├── matchmaking/ # Recommendations
│   │   │   │   ├── interests/   # Send/accept interests
│   │   │   │   ├── chat/        # Real-time Socket.io
│   │   │   │   ├── subscriptions/ # Plans + expiry cron
│   │   │   │   ├── payments/    # Razorpay integration
│   │   │   │   ├── kundli/      # Birth details + PDF
│   │   │   │   ├── pdf/         # Puppeteer PDF gen
│   │   │   │   ├── notifications/ # Real-time notifs
│   │   │   │   ├── email/       # Bull queue + SMTP
│   │   │   │   ├── admin/       # Admin operations
│   │   │   │   ├── blog/        # SEO blog
│   │   │   │   ├── gallery/     # Image gallery
│   │   │   │   └── storage/     # AWS S3
│   │   │   ├── common/       # Guards, filters, decorators
│   │   │   ├── config/       # App configuration
│   │   │   └── prisma/       # Database service
│   │   └── prisma/
│   │       └── schema.prisma # Database schema (16 tables)
│   │
│   └── frontend/             # Next.js 14 App Router
│       └── src/app/
│           ├── (public)/     # Landing, plans, about
│           ├── auth/         # Login, register
│           ├── dashboard/    # User dashboard
│           │   ├── profiles/ # Browse + search
│           │   ├── interests/ # Send/manage interests
│           │   ├── chat/     # Real-time messaging
│           │   ├── kundli/   # Kundli generation
│           │   ├── subscription/ # Plans + payment
│           │   └── profile/  # Profile creation
│           └── admin/        # Admin panel
├── docker-compose.yml
├── .env.example
└── SETUP.md
```

---

## Key API Endpoints

### Auth
- `POST /api/v1/auth/register` - Register (BRIDE/GROOM)
- `POST /api/v1/auth/login` - Password login
- `POST /api/v1/auth/otp/send` - Send OTP
- `POST /api/v1/auth/otp/verify` - Verify OTP

### Profiles
- `POST /api/v1/profiles` - Create profile
- `GET /api/v1/profiles/search?minAge=22&maxAge=30&city=Mumbai` - Search
- `GET /api/v1/profiles/:id` - View profile (subscription-gated)

### Payments
- `POST /api/v1/payments/create-order` - Create Razorpay order
- `POST /api/v1/payments/verify` - Verify payment signature
- `POST /api/v1/payments/webhook` - Razorpay webhook

### Kundli
- `POST /api/v1/kundli/generate` - Generate Kundli PDF
- `GET /api/v1/kundli/download/:pdfId` - Get signed S3 URL
- `POST /api/v1/kundli/matchmaking/:partnerId` - Matchmaking report

### Subscriptions (Plans)
| Plan | Price | Views | Duration |
|------|-------|-------|----------|
| BASIC | ₹500 | 10 | 1 month |
| STANDARD | ₹1,500 | 50 | 6 months |
| PLATINUM | ₹2,000 | 60 | Lifetime |

### Kundli Pricing
- Download own Kundli: ₹51
- Matchmaking Report: ₹101

---

## Razorpay Integration

1. Create account at [razorpay.com](https://razorpay.com)
2. Get Test API keys from Dashboard → Settings → API Keys
3. Add to `.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxx
   RAZORPAY_KEY_SECRET=your-secret
   RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
   ```
4. Add Razorpay script to `apps/frontend/src/app/layout.tsx`:
   ```html
   <Script src="https://checkout.razorpay.com/v1/checkout.js" />
   ```

---

## AWS S3 Setup

1. Create S3 bucket `vivahsetu-files`
2. Set bucket policy for private access
3. Create IAM user with S3 permissions
4. Add credentials to `.env`

---

## Production Checklist

- [ ] Change all JWT secrets to strong random strings
- [ ] Use production Razorpay keys (not test)
- [ ] Set `NODE_ENV=production`
- [ ] Configure real SMTP or AWS SES
- [ ] Set up SSL/HTTPS (Nginx + Certbot)
- [ ] Configure Redis password
- [ ] Set AADHAAR_ENCRYPTION_KEY to 32-char key
- [ ] Configure AWS S3 CORS policy
- [ ] Set up database backups
- [ ] Configure rate limiting for production
