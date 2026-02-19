# SkillBridge Lucknow Backend (Node.js + Express)

Node.js + Express backend for **SkillBridge Lucknow**, using **MySQL** and **Sequelize ORM**, with JWT authentication, role-based access control, and a basic matching engine.

This backend powers a platform that connects **students** with **local businesses/projects**.  
Students create profiles and apply to projects; businesses post projects, review applications, and manage project status.  
The backend exposes REST APIs that the React frontend (`skillbridge-frontend`) consumes.

## High-Level Overview

- **API server**: `Express` app in `src/app.js` mounts all routes under `/api/*` and exposes a `/health` endpoint.
- **Database layer**: `Sequelize` models in `src/models` map to MySQL tables and define relationships (users, roles, skills, projects, applications, reviews, payments, notifications, etc.).
- **Business logic**: Service layer in `src/services` (e.g. matching, applications, email, notifications, resume parsing).
- **Authentication**: JWT-based auth with role-based access control (`Student`, `Business`, `Admin`).
- **Matching engine**: Uses skills, ratings, and geo-location to recommend candidates for a project.

## Tech Stack

- Node.js
- Express.js
- MySQL
- Sequelize ORM
- JWT Authentication
- bcrypt Password Hashing

## Architecture & Request Flow (Documentary Style)

### Server startup

1. `npm run dev` runs `src/server.js`.
2. `server.js`:
   - Loads `.env` configuration.
   - Connects to MySQL via Sequelize and runs `sequelize.sync()` to ensure tables exist.
   - Ensures geo-location columns and seeds default roles (`Student`, `Business`, `Admin`).
   - Starts the Express app on `PORT` (default `4000`).

### Express app (`src/app.js`)

- Applies `CORS` and `express.json()` middleware.
- Exposes a simple health check: `GET /health`.
- Mounts feature routes:
  - `/api/auth` – registration & login
  - `/api/projects` – project CRUD + stats
  - `/api/applications` – students applying and businesses updating application status
  - `/api/match` – candidate recommendations for a given project
  - `/api/resume` – resume upload & parsing (PDF)
  - `/api/reviews` – feedback between users
  - `/api/profile` – profile management
  - `/api/notifications` – in-app notifications
- Uses a centralized `errorHandler` middleware to format all errors.

### Data model (Sequelize)

Key entities (see `src/models/index.js` and individual model files):

- **User** – basic account record; linked to exactly one **Role**.
- **Role** – `Student`, `Business`, `Admin` and any future roles.
- **College** – optional link for student users.
- **BusinessDetail** – business-specific fields linked to a `User`.
- **Skill** and **UserSkill** – many-to-many association of users and their skills.
- **Project** – a project posted by a business user, optionally geocoded with latitude/longitude.
- **ProjectSkill** – required/desired skills for a given project.
- **Application** – a student’s application to a project, with a `status` lifecycle.
- **Review** – feedback given between users (e.g. after project completion).
- **Payment** – project-related payments.
- **Notification** – in-app notifications for events (new application, status updates, etc.).

### Roles & access control

- **Auth middleware**:
  - Reads the `Authorization: Bearer <token>` header.
  - Verifies the JWT and attaches the user to `req.user`.
- **Role middleware**:
  - Checks `req.user.role` against allowed roles for each route.
  - Example: only `Business`/`Admin` can create projects or view match results.

Example flows:

- **Student applies to a project**
  1. Student logs in → receives JWT.
  2. Frontend calls `POST /api/applications` with `Authorization` header and `projectId`.
  3. `authMiddleware` validates the token; `roleMiddleware` enforces `Student` role.
  4. `applicationController.apply` delegates to `applicationService.applyToProject`.
  5. Service checks:
     - Project exists.
     - Student has not already applied.
  6. Creates an `Application` record.
  7. Sends confirmation email & notifications to both student and business (non-blocking).

- **Business reviews applications**
  1. Business logs in and calls `GET /api/applications?projectId=<id>`.
  2. Backend filters applications to those belonging to that business’s project.
  3. Business can update status via `PATCH /api/applications/:id/status` (`APPLIED`, `SHORTLISTED`, `SELECTED`, `REJECTED`).
  4. Student receives notification and email about the status change.

## Getting Started

### 1. Install dependencies

```bash
cd skillbridge-backend
npm install
```

### 2. Configure environment

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update database credentials and `JWT_SECRET`.

### 3. Setup MySQL database

Create a MySQL database matching `DB_NAME` from `.env` (default: `skillbridge_db`).

The app will automatically:

- Authenticate to MySQL
- Run `sequelize.sync()` to create tables
- Seed default roles: `Student`, `Business`, `Admin`

### 4. Run the server

```bash
npm run dev
```

### Run the front-end server

```bash
cd skillbridge-frontend
npm run dev
```

Server starts on `http://localhost:4000` by default.

Health check:

```text
GET /health
```

## Core API Endpoints

### Auth

- `POST /api/auth/register` – Register user
- `POST /api/auth/login` – Login user

### Projects

- `GET /api/projects` – Get all projects
- `POST /api/projects` – Create project (Business/Admin, JWT required)

### Applications

- `POST /api/applications` – Apply to project (Student, JWT required)

### Matching

- `GET /api/match/:projectId` – Get recommended candidates (Business/Admin, JWT required)

## Notes

- Matching algorithm implements the architecture document formula using skills, rating, and location.
- This is a starter implementation; extend services, controllers, validation, and error handling as needed for production.

