# SkillBridge Backend Enhancements

This document describes the advanced improvements implemented in the SkillBridge backend.

## 1. Geo-Distance (Haversine) Calculation

**Replaces** exact location string matching with real geographical proximity.

### Implementation
- **`src/utils/geoUtil.js`** – Haversine formula for distance in km between two lat/lng coordinates
- **`src/utils/matchUtil.js`** – Uses geo distance when lat/lng available; falls back to exact string match otherwise
- **Models** – Added optional `latitude` and `longitude` to `User` and `Project`

### Behavior
- If both project and student have `latitude`/`longitude`: proximity score decays linearly with distance (1 at 0 km, 0 beyond `MATCH_MAX_DISTANCE_KM`)
- If coordinates are missing: uses exact string match on `location`

### Configuration
- `MATCH_MAX_DISTANCE_KM` – Max distance (km) for full proximity score (default: 50)

### API Usage
- **Projects**: `POST /api/projects` accepts optional `latitude`, `longitude`
- **Profile**: `PATCH /api/profile` accepts optional `location`, `latitude`, `longitude`

---

## 2. Dynamic Weight Tuning

**Enables** configurable weights for skill match, location proximity, and average rating in the candidate matching algorithm.

### Implementation
- **`src/config/matchingWeights.js`** – Reads weights from env; normalizes so they sum to 1.0

### Configuration (Environment Variables)
- `MATCH_WEIGHT_SKILL` – Weight for skill match (default: 0.5)
- `MATCH_WEIGHT_RATING` – Weight for average rating (default: 0.3)
- `MATCH_WEIGHT_LOCATION` – Weight for location proximity (default: 0.2)

### Example
```bash
MATCH_WEIGHT_SKILL=0.6 MATCH_WEIGHT_RATING=0.25 MATCH_WEIGHT_LOCATION=0.15 node src/server.js
```

---

## 3. Resume Parsing with NLP

**Extracts** skills, education, experience, and keywords from uploaded PDF resumes and updates the user’s skill profile.

### Implementation
- **`src/services/resumeService.js`** – PDF text extraction (`pdf-parse`), stemming and tokenization (`natural`), regex-based education/experience extraction, skill matching against DB
- **`src/controllers/resumeController.js`** – Upload and parsed-resume endpoints
- **`src/routes/resumeRoutes.js`** – Routes for resume upload and retrieval
- **`src/middleware/uploadMiddleware.js`** – Multer for PDF uploads (max 5MB)

### Flow
1. Student uploads PDF via `POST /api/resume` (form-data, field `resume`)
2. Text is extracted, parsed for skills/education/experience/keywords
3. Matched skills (against `Skill` table) are added to `UserSkill` (proficiency: intermediate)
4. `resume_path` and `parsed_resume_data` are stored on `User`

### API
- `POST /api/resume` – Upload resume (multipart/form-data, field: `resume`)
- `GET /api/resume/parsed` – Get current user’s parsed resume data

### Security
- Only authenticated Students can upload
- File type and size validation
- Stored files under `uploads/resumes/` (excluded from version control)

---

## 4. Rating and Feedback System

**Enables** businesses to rate students after project completion; ratings update `User.average_rating` and feed into match scores.

### Implementation
- **`src/services/reviewService.js`** – Create review, validate eligibility, recompute `User.average_rating` from `Review`
- **`src/controllers/reviewController.js`** – Create and list reviews
- **`src/routes/reviewRoutes.js`** – Review routes

### Rules
- Only project owner (business) can submit a review
- Project must be in `COMPLETED` status
- Reviewee must have been `SELECTED` for the project
- One review per (project, reviewer, reviewee)

### API
- `POST /api/reviews` – Create review (body: `{ projectId, revieweeId, rating (1–5), comment? }`)
- `GET /api/reviews/user/:userId` – List reviews for a user (as reviewee)
- `GET /api/reviews/project/:projectId` – List reviews for a project

### Match Score
- `User.average_rating` is recomputed when reviews are created
- Match score uses this value in the rating component (see Dynamic Weight Tuning)

---

## Architecture Notes

- **Modularity** – Geo, weights, resume, and review logic are in separate services/utils
- **Scalability** – Resume parsing and DB operations are async; file storage is local (can be moved to S3)
- **Security** – Auth and role middleware on all new routes; input validation via express-validator
