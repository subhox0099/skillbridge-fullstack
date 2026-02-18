# SkillBridge Lucknow Backend (Node.js + Express)

Node.js + Express backend for **SkillBridge Lucknow**, using **MySQL** and **Sequelize ORM**, with JWT authentication, role-based access control, and a basic matching engine.

## Tech Stack

- Node.js
- Express.js
- MySQL
- Sequelize ORM
- JWT Authentication
- bcrypt Password Hashing

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

