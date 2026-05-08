# ✈ Kenya Airways Online Booking System — System Manual

> **Version:** 1.0.0 | **Stack:** Django 6 + React 18 (Vite) | **Database:** PostgreSQL (Neon) / SQLite (dev)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Prerequisites](#4-prerequisites)
5. [Local Development Setup](#5-local-development-setup)
   - 5.1 [Clone the Repository](#51-clone-the-repository)
   - 5.2 [Backend Setup (Django)](#52-backend-setup-django)
   - 5.3 [Frontend Setup (React + Vite)](#53-frontend-setup-react--vite)
6. [Environment Variables Reference](#6-environment-variables-reference)
   - 6.1 [Backend `.env`](#61-backend-env)
   - 6.2 [Frontend `.env`](#62-frontend-env)
7. [Database Configuration](#7-database-configuration)
8. [Running the Application](#8-running-the-application)
9. [API Endpoints Reference](#9-api-endpoints-reference)
10. [User Roles & Permissions](#10-user-roles--permissions)
11. [Production Deployment](#11-production-deployment)
    - 11.1 [Backend on Render](#111-backend-on-render)
    - 11.2 [Frontend on Vercel](#112-frontend-on-vercel)
12. [Email / Password Reset Configuration](#12-email--password-reset-configuration)
13. [Cloudinary Media Configuration](#13-cloudinary-media-configuration)
14. [Admin Panel](#14-admin-panel)
15. [Troubleshooting](#15-troubleshooting)
16. [Maintenance Procedures](#16-maintenance-procedures)

---

## 1. Project Overview

The **Kenya Airways Online Booking System** is a full-stack web application that enables passengers to search and book flights, and allows airline staff and administrators to manage flights, bookings, passengers, employees, and generate operational reports.

### Key Features

| Feature | Description |
|---|---|
| **Flight Search & Booking** | Search available flights by route and date; book seats with automatic capacity management |
| **User Registration & Login** | Instant account creation without email verification; JWT-based authentication |
| **Password Reset** | Secure token-based password reset via email link (1-hour expiry) |
| **Admin Dashboard** | Superuser-only overview of bookings, flights, passengers, and employees |
| **Employee Management** | Assign staff members to flights; role-based access control |
| **Passenger Management** | View, create, and manage passenger records (superuser only) |
| **Reports** | Generate and download operational reports |
| **Newsletter Subscription** | Email subscription for flight deals |
| **PDF Ticket Generation** | Downloadable booking tickets via ReportLab |
| **Cloudinary Media** | Destination images hosted on Cloudinary CDN |
| **Responsive UI** | Mobile-first design with dark/light mode support |

---

## 2. System Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                            │
│              React 18 SPA (Vite) — Vercel                         │
│    Pages: Home, Login, Register, Flights, Bookings, Profile …     │
└────────────────────────────┬──────────────────────────────────────┘
                             │ HTTPS REST (JSON)
                             │ JWT Bearer Token
┌────────────────────────────▼──────────────────────────────────────┐
│                     DJANGO REST API — Render                       │
│  Apps: users · flights · bookings · passengers · employees ·      │
│         reports · helpdesk                                         │
│  Auth:  djangorestframework-simplejwt                              │
│  Email: Brevo API (django-anymail)                                 │
└──────────┬──────────────────────────┬─────────────────────────────┘
           │ ORM (psycopg2)           │ HTTP API
┌──────────▼──────────┐   ┌──────────▼──────────────────┐
│  PostgreSQL (Neon)  │   │  Cloudinary CDN              │
│  Production DB      │   │  Destination images          │
└─────────────────────┘   └─────────────────────────────┘
```

---

## 3. Technology Stack

### Backend
| Package | Version | Purpose |
|---|---|---|
| Django | 6.0.3 | Web framework |
| djangorestframework | 3.17.0 | REST API |
| djangorestframework-simplejwt | 5.5.1 | JWT authentication |
| django-cors-headers | 4.9.0 | Cross-origin requests |
| django-anymail | 15.0 | Brevo email API |
| gunicorn | 25.3.0 | WSGI server (production) |
| whitenoise | 6.12.0 | Static file serving |
| psycopg2-binary | 2.9.11 | PostgreSQL driver |
| dj-database-url | 3.1.2 | Database URL parsing |
| reportlab | 4.4.10 | PDF generation |
| cloudinary | 1.44.1 | Image storage |
| django-unfold | 0.89.0 | Enhanced admin UI |
| python-decouple | 3.8 | Environment variable management |

### Frontend
| Package | Purpose |
|---|---|
| React 18 + Vite | UI framework |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| Framer Motion | Animations |
| React Hot Toast | Notifications |
| React Icons | Icon library |
| Swiper JS | Carousel/slider |
| jwt-decode | JWT token parsing |

---

## 4. Prerequisites

Ensure the following are installed on your system before proceeding:

- **Python** 3.11 or later
- **Node.js** 18 or later + **npm** 9+
- **Git**
- **pip** (Python package manager)
- A **PostgreSQL** database (or use the built-in SQLite for local development)

---

## 5. Local Development Setup

### 5.1 Clone the Repository

```bash
git clone <your-repository-url>
cd "KENYA AIRWAYS"
```

---

### 5.2 Backend Setup (Django)

#### Step 1 — Create and activate a Python virtual environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
```

#### Step 2 — Install Python dependencies

```bash
pip install -r requirements.txt
```

#### Step 3 — Configure environment variables

Create a `.env` file inside the `backend/` directory:

```bash
cp .env.example .env     # if example exists, otherwise create manually
```

Populate the file with the values described in [Section 6.1](#61-backend-env).

#### Step 4 — Apply database migrations

```bash
python manage.py migrate
```

#### Step 5 — Create a superuser (admin account)

```bash
python manage.py createsuperuser
```

Follow the prompts to set an email, username, phone number, and password.

#### Step 6 — Collect static files (optional, for local WhiteNoise testing)

```bash
python manage.py collectstatic --noinput
```

#### Step 7 — Start the development server

```bash
python manage.py runserver
```

The backend API is now available at **http://localhost:8000**.

---

### 5.3 Frontend Setup (React + Vite)

#### Step 1 — Install Node dependencies

```bash
cd frontend
npm install
```

#### Step 2 — Configure environment variables

Create a `.env` file inside the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

#### Step 3 — Start the Vite development server

```bash
npm run dev
```

The frontend is now available at **http://localhost:5173**.

---

## 6. Environment Variables Reference

### 6.1 Backend `.env`

Create this file at `backend/.env`:

```env
# ── Core Django ─────────────────────────────────────────────
SECRET_KEY=your-django-secret-key-here          # 50+ random characters
DEBUG=True                                       # Set to False in production
ALLOWED_HOSTS=localhost,127.0.0.1               # Comma-separated list

# ── Database ─────────────────────────────────────────────────
# Leave blank to use SQLite (local dev only)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# ── Email (Brevo API) ────────────────────────────────────────
# Get from: https://app.brevo.com → SMTP & API → API Keys
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DEFAULT_FROM_EMAIL=Kenya Airways <noreply@yourdomain.com>

# ── Frontend URL (used in password-reset email links) ────────
FRONTEND_URL=http://localhost:5173              # Production: https://your-app.vercel.app
BACKEND_URL=http://localhost:8000               # Production: https://your-api.onrender.com

# ── Cloudinary (destination images) ─────────────────────────
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

> **Important:** Never commit `.env` to version control. It is already in `.gitignore`.

### 6.2 Frontend `.env`

Create this file at `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

In production, set this to your Render backend URL:

```env
VITE_API_BASE_URL=https://your-backend.onrender.com
```

---

## 7. Database Configuration

### Local Development (SQLite — default)

No configuration needed. Django automatically creates `backend/db.sqlite3` when you run migrations if `DATABASE_URL` is not set.

### Production (PostgreSQL via Neon)

1. Create a free PostgreSQL database at [neon.tech](https://neon.tech).
2. Copy the connection string from the Neon dashboard.
3. Set it as `DATABASE_URL` in your environment (see Section 6.1).
4. The application enforces `sslmode=require` for all production connections.

### Running Migrations

```bash
# Apply all pending migrations
python manage.py migrate

# Create new migrations after model changes
python manage.py makemigrations

# Show migration status
python manage.py showmigrations
```

---

## 8. Running the Application

### Development (both servers simultaneously)

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd "KENYA AIRWAYS/backend"
source venv/bin/activate
python manage.py runserver
```

**Terminal 2 — Frontend:**
```bash
cd "KENYA AIRWAYS/frontend"
npm run dev
```

Visit **http://localhost:5173** in your browser.

### Production Build (Frontend)

```bash
cd frontend
npm run build
# Output in frontend/dist/ — deploy to Vercel or any static host
```

---

## 9. API Endpoints Reference

All endpoints are prefixed with `/api/`.

### Authentication (`/api/users/`)

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/users/register/` | No | Create a new user account |
| `POST` | `/api/users/login/` | No | Log in; returns JWT tokens |
| `POST` | `/api/users/logout/` | Yes | Blacklist refresh token |
| `GET` | `/api/users/profile/` | Yes | Get current user profile |
| `POST` | `/api/users/request-password-reset/` | No | Request password reset email |
| `POST` | `/api/users/confirm-password-reset/` | No | Set new password with token |
| `POST` | `/api/users/token/refresh/` | No | Refresh JWT access token |
| `POST` | `/api/users/newsletter/` | No | Subscribe to newsletter |
| `POST` | `/api/users/admin-create/` | Admin | Create a superuser account |

### Flights (`/api/flights/`)

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/flights/` | Yes | List all flights |
| `POST` | `/api/flights/` | Admin | Create a flight |
| `GET` | `/api/flights/{id}/` | Yes | Flight detail |
| `PUT/PATCH` | `/api/flights/{id}/` | Admin | Update flight |
| `DELETE` | `/api/flights/{id}/` | Admin | Delete flight |

### Bookings (`/api/bookings/`)

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/bookings/` | Yes | List bookings |
| `POST` | `/api/bookings/` | Yes | Create a booking |
| `GET` | `/api/bookings/{id}/` | Yes | Booking detail |
| `PUT/PATCH` | `/api/bookings/{id}/` | Yes | Update booking |
| `DELETE` | `/api/bookings/{id}/` | Yes | Cancel booking |

### Passengers, Employees, Reports

Similar CRUD endpoints are available at:
- `/api/passengers/`
- `/api/employees/`
- `/api/reports/`
- `/api/helpdesk/`

---

## 10. User Roles & Permissions

| Role | Registration | Login | View Flights | Book | Admin Dashboard | Manage Employees | Create Passengers |
|---|---|---|---|---|---|---|---|
| **Guest** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Authenticated User** | — | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Staff Member** | — | ✅ | ✅ | ✅ | Limited | ✅ | ❌ |
| **Superuser / Admin** | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Creating an Admin Account

```bash
# Method 1: Django management command (local)
python manage.py createsuperuser

# Method 2: Via API (requires existing admin credentials)
POST /api/users/admin-create/
Body: { "username": "admin", "email": "admin@example.com", "password": "securepassword", "phone_number": "+254700000000" }
```

---

## 11. Production Deployment

### 11.1 Backend on Render

1. **Create a new Web Service** on [render.com](https://render.com).
2. Connect your GitHub repository.
3. Set the following:
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
   - **Start Command:** `gunicorn config.wsgi:application`
4. Add all environment variables from [Section 6.1](#61-backend-env) in the Render dashboard under **Environment**.
5. Set `DEBUG=False` and `ALLOWED_HOSTS` to include your Render domain.

### 11.2 Frontend on Vercel

1. Import the repository on [vercel.com](https://vercel.com).
2. Set the **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Vite`.
4. Add **Environment Variable:**
   ```
   VITE_API_BASE_URL = https://your-backend.onrender.com
   ```
5. Deploy. Vercel handles builds automatically on every `git push`.

### CORS Configuration

After deploying, add your Vercel URL to `CORS_ALLOWED_ORIGINS` in `backend/config/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "https://your-app.vercel.app",
    "http://localhost:5173",
]
```

---

## 12. Email / Password Reset Configuration

The system uses **Brevo** (formerly Sendinblue) to send password reset emails via HTTPS API (bypasses SMTP port restrictions on platforms like Render).

### Setup Steps

1. **Create a free Brevo account** at [brevo.com](https://www.brevo.com).
2. Go to **SMTP & API → API Keys** and generate a key.
3. Add a **verified sender email** under **Senders & IPs**.
4. Set these environment variables:
   ```
   BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   DEFAULT_FROM_EMAIL=Kenya Airways <noreply@yourdomain.com>
   ```

### Password Reset Flow (No Email Verification Required)

1. User visits `/reset-password` and enters their email.
2. Backend sends a one-time token link to the email (valid **1 hour**).
3. User clicks the link → `/reset-password?token=<uuid>`.
4. User enters a new password → backend validates and updates it.
5. User is redirected to `/login`.

> **Note:** Email verification on registration has been **disabled**. Users can register and log in immediately without verifying their email address.

---

## 13. Cloudinary Media Configuration

Destination images are stored on Cloudinary CDN.

### Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. From the dashboard, copy your **Cloud Name**, **API Key**, and **API Secret**.
3. Set the environment variables:
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

Images uploaded via the Django admin are automatically stored on Cloudinary and served via CDN.

---

## 14. Admin Panel

The Django Admin is available at **/admin/** and uses **Unfold** for an enhanced dark-mode interface.

| URL | Description |
|---|---|
| `/admin/` | Django admin login |
| `/admin/users/user/` | Manage users |
| `/admin/flights/flight/` | Manage flights |
| `/admin/bookings/booking/` | Manage bookings |
| `/admin/passengers/passenger/` | Manage passengers |
| `/admin/employees/employee/` | Manage employees |

Log in with the superuser credentials created during setup.

---

## 15. Troubleshooting

### `CORS` errors in the browser

- Ensure your frontend URL is in `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` in `settings.py`.
- Redeploy the backend after updating.

### `500` error on registration

- Check Render logs for Django errors.
- Verify all required environment variables are set.
- Ensure `DATABASE_URL` is correct and the database is accessible.

### Password reset email not received

- Check Brevo API key is valid and sender email is verified.
- Check server logs for `Failed to send password reset email` entries.
- Verify `DEFAULT_FROM_EMAIL` matches a verified sender in Brevo.
- Check spam/junk folder.

### `Relation does not exist` database error

```bash
python manage.py migrate --run-syncdb
```

### Static files not loading in production

```bash
python manage.py collectstatic --noinput
```
Ensure `STATICFILES_STORAGE` and `WhiteNoise` middleware are configured.

### JWT token expired

- Access tokens expire after **60 minutes**.
- Refresh tokens expire after **7 days**.
- The frontend automatically handles token refresh via Axios interceptors.

---

## 16. Maintenance Procedures

### Regular Backups

For production PostgreSQL (Neon), backups are handled automatically. For manual backups:

```bash
# Export data
python manage.py dumpdata --indent 2 > backup.json

# Import data
python manage.py loaddata backup.json
```

### Applying Updates

```bash
# Pull latest code
git pull origin main

# Backend: apply migrations
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

# Frontend: rebuild
cd ../frontend
npm install
npm run build
```

### Clearing the Token Blacklist

Old blacklisted tokens accumulate over time. Clean them periodically:

```bash
python manage.py flushexpiredtokens
```

### Monitoring

- **Render:** View real-time logs in the Render dashboard under your service → **Logs**.
- **Vercel:** View build and function logs in the Vercel dashboard.
- **Django Logging:** Errors are logged via Python's `logging` module; check server output.

---

## Project Structure

```
KENYA AIRWAYS/
├── backend/
│   ├── config/               # Django project settings & URL conf
│   │   ├── settings.py
│   │   └── urls.py
│   ├── users/                # Auth: register, login, password reset
│   ├── flights/              # Flight model & API
│   ├── bookings/             # Booking model & API
│   ├── passengers/           # Passenger model & API
│   ├── employees/            # Employee model & API
│   ├── reports/              # Report generation
│   ├── helpdesk/             # Help/support tickets
│   ├── requirements.txt      # Python dependencies
│   ├── manage.py
│   └── .env                  # ← create this (not in git)
│
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios instance & interceptors
│   │   ├── components/       # Shared UI components (Navbar, BookingForm…)
│   │   ├── context/          # AuthContext (JWT state management)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Route-level page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── Flights.jsx
│   │   │   ├── Booking.jsx
│   │   │   ├── Passenger.jsx
│   │   │   ├── Employees.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Help.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── App.jsx           # Root component with routing
│   │   ├── index.css         # Global design system (CSS variables)
│   │   └── main.jsx
│   ├── package.json
│   └── .env                  # ← create this (not in git)
│
├── render.yaml               # Render deployment configuration
└── README.md                 # This file (System Manual)
```

---

*© 2026 Kenya Airways Online Booking System. All rights reserved.*
