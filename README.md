# NIRVAAH - Civic Issue Reporting System

NIRVAAH is a full-stack civic issue reporting platform where citizens can report local problems (potholes, garbage, water leakage, streetlights, etc.), track status updates, and view issues on a live map. It also includes an admin workflow for moderation, analytics, prioritization, and transparent resolution evidence.

## Features

### Citizen Features

- Register/login with JWT authentication
- Optional OTP login flow via email
- Create complaints with up to 5 image uploads
- Auto-suggested category from complaint text/image filename (rule-based AI mock)
- Duplicate complaint detection in nearby radius
- Track own complaints and status history
- Upvote other complaints
- View map-based complaints
- Submit post-resolution feedback (rating/comment/satisfaction)
- Receive notifications (status changes, upvotes)
- Leaderboard and public profile views

### Admin Features

- Admin registration/login (protected by admin secret)
- Complaint moderation and status updates
- Analytics dashboard (status, category, trend, top users, upvotes, average resolution time)
- Priority dashboard with filters and countdown metadata
- Priority workflow transitions (`pending -> approved -> in_progress -> resolved`)
- Auto-escalation and near-deadline alert jobs
- Transparent Resolution System (TRS):
  - Mobile-only resolution evidence submission
  - GPS validation + suspicious flagging
  - Supervisor review for suspicious submissions
  - Public evidence endpoint with privacy-safe response

### Platform Features

- Socket.IO real-time notification emission
- Cloudinary-based image storage and optimization
- i18n language switching with cookie persistence
- EJS-rendered UI pages for citizen/admin panels
- Centralized error handling middleware
- PWA service worker with offline fallback and background sync hook

## User Roles

### Citizen

- Report complaints
- Vote on others' complaints
- View map/issues/leaderboard
- Submit feedback for resolved issues
- Manage profile and notifications

### Admin

- Access admin dashboards
- Manage complaint lifecycle
- Use priority workflow tools
- Submit and review TRS resolution evidence

## Tech Stack

- Backend: Node.js, Express.js
- View engine: EJS
- Database: MongoDB (Mongoose)
- Authentication: JWT + Passport JWT
- Password hashing: bcryptjs
- Uploads: Multer + Cloudinary + multer-storage-cloudinary
- Validation: express-validator
- Realtime: Socket.IO
- Notifications/Mail: Nodemailer
- Internationalization: i18n
- Security and ops: Helmet, CORS, Compression, Morgan, Cookie Parser, Dotenv

## System Architecture

High-level flow:

1. Client (EJS pages + static JS) calls REST APIs.
2. Express routes delegate to controllers.
3. Controllers handle validation and business logic.
4. Mongoose models persist data in MongoDB.
5. Notifications are stored and optionally emitted via Socket.IO.
6. Files are uploaded to Cloudinary via Multer storage adapters.
7. Background scheduler runs escalation and deadline alert jobs.

## Project Structure

```text
.
|-- config/                 # DB, cloudinary, passport, mailer, seed
|-- controllers/            # Business logic handlers
|-- middleware/             # Auth/admin guards, upload, error handling
|-- models/                 # Mongoose data models
|-- routes/                 # API + EJS page routing
|-- services/               # Priority module services and scheduler
|-- public/                 # CSS, JS, PWA assets, service worker, offline page
|-- views/                  # EJS templates (citizen/admin/partials)
|-- locales/                # Translation dictionaries (en, hi)
|-- server.js               # Application entry point
|-- package.json
|-- chatbotData.json
`-- add_translations.js
```

## Environment Variables

Create a `.env` file in project root.

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

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMTP / OTP mail (authController uses Gmail service with USER/PASS)
SMTP_USER=you@example.com
SMTP_PASS=your_app_password

# Optional (used by config/mailer.js)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false

# TRS validation tuning (optional)
TRS_DISTANCE_THRESHOLD_M=100
TRS_GPS_ACCURACY_MAX_M=100

# Optional front-end client URL (legacy)
CLIENT_URL=http://localhost:3000
```



## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB instance
- Cloudinary account
- SMTP credentials (optional for demo, required for real OTP emails)

### Installation

```bash
git clone <your-repository-url>
cd NIRVAAH-Civic-issue-reporting-system
npm install
```

### Run in Development

```bash
npm run dev
```

### Run in Production Mode

```bash
npm start
```

### Optional: Seed Database

```bash
npm run seed
```

### Verify Service

- App: `http://localhost:5000`
- Health check: `GET /api/health`

## API Reference

Base paths:

- `/api/auth`
- `/api/complaints`
- `/api/admin`
- `/api/admin-priority`
- `/api/notifications`
- `/api/users`
- `/api/chatbot`

### Auth Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`
- `POST /api/auth/resend-otp`
- `GET /api/auth/me` (protected)
- `POST /api/auth/logout` (protected)
- `PUT /api/auth/profile` (protected)

### Complaint Routes

- `GET /api/complaints`
- `POST /api/complaints` (protected, multipart images)
- `GET /api/complaints/map`
- `GET /api/complaints/my` (protected)
- `GET /api/complaints/:id`
- `POST /api/complaints/:id/vote` (protected)
- `DELETE /api/complaints/:id` (owner/admin)
- `GET /api/complaints/:id/feedback` (protected)
- `POST /api/complaints/:id/feedback` (protected)

TRS routes:

- `GET /api/complaints/:id/resolution/public`
- `POST /api/complaints/:id/resolution` (protected, admin, mobile-only)
- `PATCH /api/complaints/:id/resolution/review` (protected, admin)

### Admin Routes

- `GET /api/admin/complaints`
- `PATCH /api/admin/complaints/:id/status`
- `GET /api/admin/analytics`
- `GET /api/admin/users`

### Admin Priority Module Routes

- `GET /api/admin-priority/dashboard`
- `PATCH /api/admin-priority/:complaintId/status`
- `POST /api/admin-priority/jobs/escalation`
- `POST /api/admin-priority/jobs/deadline-alerts`

### Notification Routes

- `GET /api/notifications`
- `PATCH /api/notifications/read-all`
- `PATCH /api/notifications/:id/read`

### User Routes

- `GET /api/users/leaderboard`
- `GET /api/users/profile/:id`

### Chatbot Routes

- `GET /api/chatbot/data`
- `POST /api/chatbot/message`

## Web Routes (EJS Pages)

Public pages:

- `/`
- `/login`
- `/otp`
- `/register`
- `/map`
- `/leaderboard`
- `/terms`

Citizen pages:

- `/dashboard`
- `/report`
- `/my-complaints`
- `/complaint`
- `/notifications`
- `/profile`
- `/nearby`
- `/issue`

Admin pages:

- `/admin/login`
- `/admin/register`
- `/admin/dashboard`
- `/admin/complaints`
- `/admin/complaint`
- `/admin/analytics`
- `/admin/priority-dashboard`
- `/admin/map`
- `/admin/leaderboard`

## Business Rules and Workflows

### Complaint Lifecycle

- Complaint starts as `pending`
- Admin can move status to `in_progress`
- `resolved` status is controlled by TRS resolution submission workflow

### Priority Workflow

- Priority is derived from vote count (`low`, `medium`, `high`)
- Deadlines are assigned by priority
- Escalation occurs when overdue complaints cross thresholds
- Near-deadline alerts are generated periodically

### Transparent Resolution System (TRS)

- Resolution evidence upload is admin-only and mobile-only
- GPS accuracy and distance from original complaint location are validated
- Suspicious submissions are flagged for supervisor review
- Public endpoint exposes evidence summary while hiding sensitive capture coordinates
- Resolution evidence is enforced as write-once (immutable after first submission)

### Points and Gamification

- Complaint creation gives points
- Upvotes increase complaint owner points
- Resolution completion contributes additional points
- Leaderboard reflects engagement

### Duplicate Detection

- New complaints are checked for nearby active complaints in the same category
- Potential duplicates are linked to existing issues

## Security and Reliability

- JWT auth with Passport strategy
- Role-based access guards (`protect`, `adminOnly`)
- Input validation using `express-validator`
- Upload filtering and size limits in Multer
- Helmet headers and CORS handling
- Centralized error middleware for consistent API responses
- MongoDB reconnect retry logic in database config

## PWA and Offline Behavior

- Service worker caches core app-shell assets
- Offline HTML fallback page for navigation failures
- API calls return offline JSON error when network is unavailable
- Background sync event hook for pending offline complaint sync
- Manifest and install prompt assets present under `public/pwa/`

## Scripts

```bash
npm start      # Start server (node server.js)
npm run dev    # Start server with nodemon
npm run seed   # Seed database
```

## Deployment Notes

- Set all required environment variables in production.
- Use a managed MongoDB cluster for reliability.
- Use secure Cloudinary credentials and restricted API keys.
- Configure SMTP app password/secrets securely.
- Set proper CORS origin restrictions before production rollout.
- Consider process manager (PM2/systemd/container) for uptime.

## Known Limitations

- OTP sessions are currently in-memory; they reset on server restart.
- Chatbot is rule-based (not LLM-powered).
- Some authorization logic is enforced mainly in API/middleware, while EJS pages are rendered directly.
- Scheduler uses in-process intervals; distributed deployments need a coordinated job strategy.

## Future Enhancements

- Redis-backed OTP/session store
- Queue-based background jobs (BullMQ/Agenda)
- AI-based complaint category classification from image/text
- Department-level routing and SLA dashboards
- Push notification subscriptions for production-scale alerting

## License

No license file is currently included. Add a license (for example, MIT) if you plan to distribute this project publicly.
