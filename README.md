# NIRVAAH – Civic Issue Reporting System

NIRVAAH is a full-stack civic issue reporting platform where citizens can report local problems (potholes, garbage, water leakage, streetlights, etc.), track status updates, and view issues on a live map. It also includes an admin workflow for moderation, analytics, prioritization, and transparent resolution evidence.

## Features

### Citizen-facing
- Register/login with JWT authentication.
- OTP-based verification flow.
- Report complaints with image uploads.
- View and vote on reported issues.
- Track personal complaints and notifications.
- Explore issues on a live map view.
- View public leaderboard and profiles.
- Multi-language support (English/Hindi).

### Admin-facing
- Admin login/registration.
- Manage complaints and update status.
- Analytics dashboard.
- Priority module dashboard.
- Scheduled escalation and deadline-alert jobs.
- Transparent Resolution System (TRS) with resolution evidence upload and supervisor review.

### Platform capabilities
- Real-time events support via Socket.IO.
- PWA assets and service worker support.
- Cloud image storage integration.
- Security middleware and centralized error handling.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Templating/UI:** EJS, static CSS/JS
- **Database:** MongoDB with Mongoose
- **Auth:** Passport JWT, JSON Web Tokens, bcryptjs
- **Uploads:** Multer + Cloudinary
- **Realtime:** Socket.IO
- **Mail/OTP:** Nodemailer (SMTP)
- **i18n:** i18n package (English/Hindi locales)
- **Security/ops:** Helmet, CORS, Morgan, Compression, Dotenv

## Project Structure

```text
.
├── config/                 # DB, auth, cloudinary, mail, seed
├── controllers/            # Route controller logic
├── middleware/             # Auth, admin guards, upload, error handling
├── models/                 # Mongoose schemas
├── public/                 # Static assets, PWA files
├── routes/                 # API + EJS page routes
├── services/               # Priority module services/scheduler
├── views/                  # EJS templates (citizen + admin)
├── locales/                # i18n dictionaries
├── server.js               # App entrypoint
└── package.json
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB instance (local or hosted)
- Cloudinary account
- SMTP credentials for OTP emails

## Environment Variables

Create a `.env` file in the project root.

```env
# App
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://127.0.0.1:27017/nirvaah

# Auth
JWT_SECRET=replace_with_strong_secret
JWT_EXPIRE=7d
ADMIN_SECRET=replace_with_admin_registration_secret

# Mail (OTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=you@example.com
SMTP_PASS=your_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# TRS (optional, defaults exist)
TRS_DISTANCE_THRESHOLD_M=100
TRS_GPS_ACCURACY_MAX_M=100
```

## Installation

```bash
npm install
```

## How to Run the Project (Local Setup)

Follow these steps to run the project locally from scratch:

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd NIRVAAH-Civic-issue-reporting-system
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Create your environment file**
   - Create a `.env` file in the root folder.
   - Copy the variables from the **Environment Variables** section above.
   - Fill in real values for MongoDB, JWT, SMTP, and Cloudinary.
4. **(Optional) Seed starter data**
   ```bash
   npm run seed
   ```
5. **Start the app**
   ```bash
   # development mode (auto-restart)
   npm run dev
   ```
   or
   ```bash
   # normal mode
   npm start
   ```
6. **Open in browser**
   - App: `http://localhost:5000`
   - Health check: `http://localhost:5000/api/health`

## Run Locally

```bash
# Development
npm run dev

# Production-like run
npm start
```

Server starts at:
- `http://localhost:5000` (default)

Health check:
- `GET /api/health`

## Database Seeding

```bash
npm run seed
```

## API Overview

Base API paths:
- `/api/auth`
- `/api/complaints`
- `/api/admin`
- `/api/admin-priority`
- `/api/notifications`
- `/api/users`
- `/api/chatbot`

### Key endpoints (selected)

#### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`
- `GET /api/auth/me` (protected)

#### Complaints
- `GET /api/complaints`
- `POST /api/complaints` (protected, multipart images)
- `GET /api/complaints/map`
- `POST /api/complaints/:id/vote` (protected)
- `POST /api/complaints/:id/resolution` (admin)
- `PATCH /api/complaints/:id/resolution/review` (admin)

#### Admin
- `GET /api/admin/complaints`
- `PATCH /api/admin/complaints/:id/status`
- `GET /api/admin/analytics`
- `GET /api/admin/users`

#### Notifications
- `GET /api/notifications`
- `PATCH /api/notifications/read-all`

#### Chatbot
- `GET /api/chatbot/data`
- `POST /api/chatbot/message`

## Frontend Pages

EJS-rendered routes include:
- `/`, `/login`, `/register`, `/dashboard`, `/report`, `/map`, `/leaderboard`, etc.
- Admin pages under `/admin/*`.

## Notes

- Static assets are served from `public/`.
- Language switching uses cookie + locale dictionaries.
- Priority module scheduler starts with server boot.

## License

No license file is currently included in this repository. Add one if needed for distribution.
