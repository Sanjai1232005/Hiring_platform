# SmartRecruit — AI-Powered Automated Recruitment System

> Full-stack hiring platform that automates resume screening, coding assessments, task-based evaluations, proctored testing, and candidate analytics — all in one place.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Models](#database-models)
- [Frontend Pages & Components](#frontend-pages--components)
- [AI & ML Services](#ai--ml-services)
- [Screenshots](#screenshots)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (React)                       │
│          Port 3000 · Tailwind · Framer Motion            │
└────────────────────────┬────────────────────────────────┘
                         │  REST / Axios
┌────────────────────────▼────────────────────────────────┐
│               Backend API (Express.js)                   │
│       Port 5000 · JWT Auth · Role Middleware              │
├──────────┬───────────────┬──────────────────────────────┤
│ MongoDB  │  Judge0 API   │  Nodemailer (Gmail SMTP)      │
│ (Mongoose)│ (Code Exec)  │  Email Invitations             │
└──────────┴───────┬───────┴──────────────────────────────┘
                   │  HTTP
┌──────────────────▼──────────────────────────────────────┐
│          ML Microservice (FastAPI)                        │
│    Port 8000 · Resume Scoring · Explanation Analysis      │
│    Sentence Transformers · scikit-learn · pdfplumber      │
└─────────────────────────────────────────────────────────┘
```

---

## Features

### Student Portal
- **Profile & Resume** — Create profile, upload PDF resume, manage education/experience/skills
- **Job Discovery** — Browse, filter, and apply for jobs with detailed listings
- **AI Resume Screening** — Automatic semantic + keyword scoring against job descriptions
- **Online Coding Tests** — Secure, timed coding assessments with Judge0 execution engine
- **Task Assessments** — Complete real-world tasks with file uploads and GitHub links
- **Proctored Sessions** — Webcam + microphone recording during task assessments
- **Explanation Recording** — Record video explanations of completed work (last 5 minutes)
- **Application Tracking** — Real-time pipeline status (Resume → Test → Task → Interview → Final)

### HR / Recruiter Portal
- **Job Management** — Create, edit, and manage job postings with salary ranges and requirements
- **Stage Pipeline** — Advance candidates through stages: Resume Screening → Coding Test → Task Assessment → Interview → Final
- **AI Resume Scoring** — One-click AI resume analysis with keyword + semantic similarity scores
- **Coding Test Builder** — Create questions with test cases, enable/disable test sections, send email invitations
- **Task Assessment Builder** — Design 1–3 task assignments with descriptions, deliverables, and time limits
- **Candidate Evaluation Dashboard** — View all candidates with:
  - AI-analyzed scores (Communication, Technical Depth, Problem Solving, Confidence, Overall)
  - Proctoring analysis (Attention Score, Face Detection Rate, Tab Switches, Environment Score)
  - Key strengths and areas for improvement
  - Submitted files and GitHub links
- **Bulk Email** — Send test invitations via Gmail SMTP with secure JWT tokens

### Platform-Wide
- **JWT Authentication** — Secure token-based auth with role-based route protection
- **Responsive Design** — Dark theme UI with Tailwind CSS and Framer Motion animations
- **Cheat Detection** — Code similarity analysis using SHA-256 hashing and Jaccard similarity
- **Cloudinary Integration** — Cloud storage for resumes, images, and media files

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, React Router 6 | SPA with nested routing |
| **Styling** | Tailwind CSS 3, Framer Motion | Dark theme, animations |
| **UI Components** | Lucide React, MUI | Icons, Material components |
| **Code Editor** | Monaco Editor | In-browser coding IDE |
| **Backend** | Node.js, Express 5 | REST API server |
| **Database** | MongoDB, Mongoose 8 | Document-based data storage |
| **Authentication** | JWT, bcryptjs | Token auth + password hashing |
| **Validation** | Joi | Request schema validation |
| **Email** | Nodemailer (Gmail SMTP) | Test invitations, notifications |
| **Code Execution** | Judge0 API | Sandboxed code execution |
| **Queue** | Bull (Redis-backed) | Job queue for async tasks |
| **ML Service** | FastAPI, Uvicorn | AI microservice |
| **NLP** | Sentence Transformers (MiniLM) | Semantic similarity scoring |
| **PDF Parsing** | pdfplumber | Resume text extraction |
| **ML** | scikit-learn, NumPy, PyTorch | Score computation |
| **File Storage** | Cloudinary | Cloud image/video/file uploads |
| **Containerization** | Docker, Docker Compose | ML service deployment |

---

## Project Structure

```
Automated-Recruitment-System/
│
├── Backend/                          # Express.js API server
│   ├── package.json
│   └── src/
│       ├── app.js                    # Express app setup, CORS, routes
│       ├── server.js                 # Server entry point (port 5000)
│       ├── config/
│       │   ├── database.config.js    # MongoDB connection
│       │   ├── email.config.js       # Gmail SMTP transporter
│       │   ├── env.config.js         # Environment variable validation
│       │   └── schema.config.js      # Joi validation schemas
│       ├── controllers/
│       │   ├── auth.controller.js    # Signup, login
│       │   ├── email.controller.js   # Email sending
│       │   ├── hr.controller.js      # HR profile & job management
│       │   ├── job.controller.js     # Job CRUD, applications, stages
│       │   ├── question.controller.js# Coding questions
│       │   ├── student.controller.js # Student profile
│       │   ├── task.controller.js    # Task assessments, proctoring, AI analysis
│       │   └── test.controller.js    # Coding test evaluation
│       ├── middlewares/
│       │   ├── auth.middleware.js     # JWT verification
│       │   ├── error.middleware.js    # Global error handler
│       │   └── role.middleware.js     # Role-based access control
│       ├── models/                   # 16 Mongoose models
│       ├── routes/                   # 9 route modules
│       ├── services/
│       │   ├── judge.service.js      # Judge0 code execution + test case runner
│       │   └── cheat-detection.service.js # SHA-256 hashing + Jaccard similarity
│       └── utils/
│           ├── judge0.js             # Judge0 API wrapper (base64 encoding)
│           ├── logger.js             # HTTP request/response logger
│           └── response.util.js      # Response formatting
│
├── frontend/                         # React SPA
│   ├── package.json
│   ├── tailwind.config.js            # Custom dark theme colors
│   ├── postcss.config.js
│   ├── public/
│   └── src/
│       ├── App.js                    # App root with AuthProvider
│       ├── apiConfig.js              # API base URL (http://localhost:5000/api)
│       ├── index.js                  # React entry point
│       ├── context/
│       │   └── AuthContext.jsx        # Auth state (token, role, login/logout)
│       ├── layouts/
│       │   ├── AuthLayout.jsx         # Login/signup layout
│       │   ├── DashboardLayout.jsx    # Sidebar + content layout
│       │   ├── MainLayout.jsx         # Public pages layout
│       │   └── PublicLayout.jsx       # Public layout wrapper
│       ├── routes/
│       │   ├── AppRoutes.jsx          # All route definitions
│       │   └── ProtectedRoutes.jsx    # Auth guard component
│       ├── pages/
│       │   ├── Home.jsx               # Landing page
│       │   ├── NotFoundPage.jsx       # 404 page
│       │   ├── auth/                  # Login, Signup, Role Selection
│       │   ├── Hr/                    # HR dashboard, job creation, task mgmt
│       │   │   ├── Dashboard.jsx
│       │   │   ├── CreateJob.jsx
│       │   │   ├── CreateQuestions.jsx
│       │   │   ├── CreateTaskAssessment.jsx
│       │   │   ├── HRTaskDashboard.jsx
│       │   │   ├── TaskAssessmentPage.jsx
│       │   │   ├── Profile.jsx
│       │   │   └── stages/            # Pipeline stage views
│       │   └── student/               # Student dashboard, tests, tasks
│       │       ├── Dashboard.jsx
│       │       ├── PostJob.jsx        # Browse/filter jobs
│       │       ├── ApplyJob.jsx
│       │       ├── JobDetails.jsx
│       │       ├── CodeEditor.jsx     # Monaco-based coding IDE
│       │       ├── TestGate.jsx       # Secure test token verification
│       │       ├── TaskAssessment.jsx # Proctored task submission
│       │       ├── TaskList.jsx       # Assigned tasks list
│       │       ├── Profile.jsx
│       │       ├── EditProfile.jsx
│       │       └── PublicStudentProfile.jsx
│       ├── components/
│       │   ├── animations/            # Hover effects, page transitions
│       │   ├── common/                # Loader, ProtectedRoutes
│       │   ├── layout/                # Navbars, Footer
│       │   ├── navigation/            # Sidebar (role-aware)
│       │   └── ui/                    # Button, Card, Badge, Modal, Table,
│       │                              # Input, Avatar, EmptyState, Panel,
│       │                              # TaskTimer, TaskSubmissionPanel,
│       │                              # ProctoringCamera, ExplanationRecorder,
│       │                              # ExplanationVideoPlayer,
│       │                              # CandidateEvaluationCard
│       ├── services/
│       │   ├── auth.service.js        # Register, login, profile API calls
│       │   └── cloudinary.service.js  # Upload to Cloudinary (image/video/raw)
│       └── styles/
│           └── tailwind.css           # Custom Tailwind theme variables
│
└── services/                         # Python ML microservice
    ├── docker-compose.yml            # Docker config (port 8000)
    ├── Dockerfile                    # Python 3.11-slim base
    ├── requirements.txt              # FastAPI, transformers, scikit-learn, torch
    └── src/
        ├── main.py                   # FastAPI app entry
        ├── api/
        │   └── routes.py             # /resume/score, /explanation/analyze
        └── controllers/
            ├── resume_controller.py  # PDF parsing + NLP scoring
            └── explanation_controller.py # Explanation video analysis (simulated)
```

---

## Installation & Setup

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **Python** 3.11+
- **Docker** (optional, for ML service)
- **Judge0** API key (from [RapidAPI](https://rapidapi.com/judge0-official/api/judge0-ce))

### 1. Clone the Repository

```bash
git clone https://github.com/gaurav-opensource/Automated-Recruitment-System.git
cd Automated-Recruitment-System
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in `Backend/`:

```env
PORT=5000
NODE_ENV=development
MONGO_URL=mongodb://localhost:27017/recruitment
JWT_SECRET=your_jwt_secret_min_32_chars_long_here
JWT_EXPIRES_IN=7d
TEST_SECRET=your_test_secret_min_32_chars_long
JUDGE0_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_KEY=your_rapidapi_key
JUDGE0_HOST=judge0-ce.p.rapidapi.com
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:3000
APP_BASE_URL=http://localhost:5000
```

Start the backend:

```bash
npm start        # Production
npm run dev      # Development (with nodemon)
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The app opens at `http://localhost:3000`.

### 4. ML Microservice Setup

**Option A: Docker (Recommended)**

```bash
cd services
docker-compose up --build
```

**Option B: Manual**

```bash
cd services
pip install -r requirements.txt
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

The ML service runs at `http://localhost:8000`.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Backend port (default: 5000) |
| `NODE_ENV` | No | `development` / `production` / `test` |
| `MONGO_URL` | **Yes** | MongoDB connection URI |
| `JWT_SECRET` | **Yes** | JWT signing key (min 32 characters) |
| `JWT_EXPIRES_IN` | No | Token expiry (default: `7d`) |
| `TEST_SECRET` | **Yes** | Coding test token signing key (min 32 characters) |
| `JUDGE0_URL` | **Yes** | Judge0 API base URL |
| `JUDGE0_KEY` | **Yes** | Judge0 RapidAPI key |
| `JUDGE0_HOST` | **Yes** | Judge0 API host header |
| `EMAIL_USER` | **Yes** | Gmail address for sending emails |
| `EMAIL_PASS` | **Yes** | Gmail app password |
| `FRONTEND_URL` | **Yes** | Frontend URL for email links |
| `APP_BASE_URL` | **Yes** | Backend base URL |

---

## API Reference

### Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | No | Register new user (student/hr) |
| POST | `/api/auth/login` | No | Login, returns JWT token |

### Students — `/api/students`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/students/getProfile` | JWT | Get logged-in student's profile |
| PUT | `/api/students/updateProfile` | JWT | Update student profile |
| GET | `/api/students/getProfile/:id` | No | Get any student's public profile |

### HR — `/api/hr`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/hr/getProfile` | JWT | Get HR profile |
| PUT | `/api/hr/updateProfile` | JWT | Update HR profile |
| POST | `/api/hr/create` | JWT | Create a new job |
| POST | `/api/hr/getjob` | JWT | Get HR's posted jobs |

### Jobs — `/api/job`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/job/alljob` | No | List all jobs (optional `?days=` filter) |
| GET | `/api/job/:id` | No | Get job details by ID |
| GET | `/api/job/getjobs` | JWT | Get jobs by logged-in HR |
| GET | `/api/job/students/:jobId` | JWT | Get applicants for a job |
| POST | `/api/job/apply/:jobId` | JWT | Apply for a job |
| POST | `/api/job/:jobId/stageChange` | JWT | Change job pipeline stage |
| POST | `/api/job/:jobId/stageChangeInStudent` | JWT | Change stage for a student |
| POST | `/api/job/:jobId/resume-screen` | No | Trigger AI resume score calculation |
| GET | `/api/job/my-applications-stages` | JWT | Get application pipeline status |

### Coding Questions — `/api/questions`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/questions/create` | JWT | Create coding question with test cases |
| GET | `/api/questions/:jobId` | JWT | Get questions for a job |
| POST | `/api/questions/submit` | JWT | Submit answer to a question |

### Coding Tests — `/api/test`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/test/submit` | JWT | Submit test attempt |
| PUT | `/api/test/enable/:jobId` | JWT | Enable test section for a job |
| POST | `/api/test/evaluate/:jobId` | JWT | Evaluate all test submissions |
| POST | `/api/test/email/:jobId` | JWT | Send test invitation emails |

### Task Assessments — `/api/tasks`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/tasks/create` | JWT | HR | Create task assessment (1–3 tasks) |
| GET | `/api/tasks/job/:jobId` | JWT | Any | Get task assessments for a job |
| DELETE | `/api/tasks/:id` | JWT | HR | Delete a task assessment |
| POST | `/api/tasks/submit` | JWT | Student | Submit task with files/GitHub links |
| GET | `/api/tasks/submission/:assessmentId` | JWT | Any | Get own submission |
| GET | `/api/tasks/submissions/job/:jobId` | JWT | HR | Get all submissions for a job |
| POST | `/api/tasks/uploadRecording` | JWT | Student | Submit proctoring session data |
| POST | `/api/tasks/uploadExplanation` | JWT | Student | Submit explanation session data |
| POST | `/api/tasks/analyzeExplanation` | JWT | HR | Trigger AI analysis of explanation |
| GET | `/api/tasks/explanationAnalysis/:candidateId/:jobId` | JWT | HR | Get AI analysis results |
| GET | `/api/tasks/results/:jobId` | JWT | HR | Get full candidate evaluation dashboard |

### Email — `/api/email`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/email/send-test-email/:jobId` | JWT | Send test invitation emails to candidates |

### Progress — `/api/progress`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/progress/verify/:jobId/:studentId/:token` | No | Verify test access token |

### ML Service — `http://localhost:8000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/resume/score` | Score resume PDF against job description |
| POST | `/explanation/analyze` | Analyze candidate explanation video |

---

## Database Models

| Model | Description |
|-------|-------------|
| `User` | Base user model (email, password hash, role: student/hr) |
| `StudentProfile` | Education, experience, skills, certifications, social links |
| `HrProfile` | Company info, HR contact details |
| `Hr` | HR base model |
| `Job` | Title, description, company, salary range, location, type, stages, requirements |
| `ApplicationProgress` | Tracks candidate through pipeline stages per job |
| `Question` | Coding question with title, description, constraints, language |
| `TestCase` | Input/output pairs for coding questions |
| `Submission` | Code submission with language, status, results |
| `TestResult` | Aggregated coding test scores |
| `TaskAssessment` | HR-defined task assignments (1–3 tasks with title, description, deliverables, time limit) |
| `TaskSubmission` | Student task submissions (files, GitHub links) per assessment |
| `ProctoringRecording` | Webcam/mic proctoring session with AI analysis (attention, face detection, tab switches) |
| `ExplanationRecording` | Video explanation session with AI analysis (communication, clarity, technical depth) |
| `ExplanationAnalysis` | ML pipeline results: communication, technical depth, confidence, problem solving scores |
| `EmailLog` | Email sending audit trail |

---

## Frontend Pages & Components

### Pages

| Route | Role | Page | Description |
|-------|------|------|-------------|
| `/` | Public | Home | Landing page with feature sections |
| `/login` | Public | LoginPage | Email/password login |
| `/signup` | Public | RoleSelectionPage | Choose student or HR signup |
| `/student/signup` | Public | StudentSignupPage | Student registration |
| `/hr/signup` | Public | HrSignupPage | HR registration |
| `/student/dashboard` | Student | Dashboard | Application pipeline tracker |
| `/jobs` | Student | PostJob | Browse and filter job listings |
| `/jobs/:id` | Student | JobDetails | Detailed job view |
| `/student/apply/:jobId` | Student | ApplyJob | Job application form |
| `/student/profile` | Student | Profile | View student profile |
| `/student/edit-profile` | Student | EditProfile | Edit profile details |
| `/student/task-assessment` | Student | TaskList | List of assigned tasks |
| `/student/task-assessment/:jobId` | Student | TaskAssessment | Proctored task submission |
| `/test/start/:token` | Student | TestGate | Secure test entry |
| `/students/:jobId/:userId` | Student | CodeEditor | Monaco coding IDE |
| `/hr/dashboard` | HR | Dashboard | Candidate pipeline manager |
| `/hr/jobs` | HR | PostJob | Browse job listings |
| `/hr/jobs/:id` | HR | JobDetails | Job detail view |
| `/hr/create` | HR | CreateJob | Create job posting |
| `/hr/create-question` | HR | CreateQuestions | Build coding questions |
| `/hr/task-assessment` | HR | TaskAssessmentPage | Create/manage task assessments |
| `/hr/task-results` | HR | HRTaskDashboard | Candidate evaluation dashboard |
| `/hr/profile` | HR | Profile | HR profile page |

### Key UI Components

| Component | Description |
|-----------|-------------|
| `Sidebar` | Role-aware collapsible navigation with mobile support |
| `TaskTimer` | Countdown timer with `onTimeUp` and `onLastFiveMinutes` callbacks |
| `TaskSubmissionPanel` | File upload + GitHub link inputs per task |
| `ProctoringCamera` | Webcam + microphone recording using MediaRecorder API |
| `ExplanationRecorder` | Reuses proctoring stream for video explanation recording |
| `CandidateEvaluationCard` | Expandable card with 6 animated score bars, strengths/improvements, proctoring data |
| `ExplanationVideoPlayer` | Collapsible video player with play/close toggle |
| `Button` | Multi-variant button (primary, ghost, outline) |
| `Badge` | Status/category badges (success, warning, etc.) |
| `Card` | Styled container with dark theme |
| `Modal` | Dialog overlay component |
| `Table` | Sortable data table |
| `EmptyState` | Placeholder for empty lists |
| `PageWrapper` / `StaggerList` | Framer Motion page transitions and staggered list animations |

---

## AI & ML Services

### Resume Scoring Pipeline

1. **PDF Upload** → `pdfplumber` extracts text from resume
2. **Text Cleaning** → Remove noise, normalize formatting
3. **Keyword Matching** → Compare resume keywords against job description
4. **Semantic Similarity** → `sentence-transformers/all-MiniLM-L6-v2` computes embedding similarity
5. **Weighted Score** → Combines keyword + semantic scores into final score

**Sample Response:**
```json
{
  "final_score": 87.45,
  "keyword_score": 82.33,
  "semantic_score": 92.57,
  "missing_keywords": ["react", "mongodb"]
}
```

### Explanation Analysis Pipeline

1. **Audio Extraction** → Simulates audio extraction from video
2. **Speech-to-Text** → Simulates transcript generation
3. **NLP Analysis** → Generates communication, technical depth, confidence, and problem-solving scores

**Sample Response:**
```json
{
  "communication_score": 85,
  "technical_depth": 78,
  "confidence_level": 82,
  "problem_solving": 80,
  "overall_score": 81,
  "strengths": ["Clear communication", "Strong technical vocabulary"],
  "areas_for_improvement": ["Could provide more concrete examples"],
  "transcript_stats": { "word_count": 450, "duration_seconds": 180 }
}
```

### Proctoring Analysis

The system captures webcam and microphone data during task assessments and generates:
- **Attention Score** — How focused the candidate appeared
- **Face Detection Rate** — Percentage of time face was visible
- **Tab Switch Count** — Number of times candidate switched tabs
- **Environment Score** — Assessment of testing environment
- **Overall Verdict** — Pass/flag determination

### Cheat Detection

- **SHA-256 Code Hashing** — Fingerprint code submissions for duplication detection
- **Jaccard Similarity** — Token-set comparison between submissions to detect plagiarism

---

## Screenshots

### Student Dashboard
![Student Dashboard](./frontend/src/assets/images/student_dashboard.png)

### HR Dashboard
![HR Dashboard](./frontend/src/assets/images/hr_dashboard.png)

---

## End-to-End Flows

### Student Journey

```
Register → Create Profile → Upload Resume → Browse Jobs → Apply
    → AI Resume Screening → Coding Test (Proctored) → Task Assessment
    → Explanation Recording → Track Status → Final Decision
```

### HR Journey

```
Register → Create Job → Set Requirements → AI Screen Resumes
    → Create Coding Questions → Send Test Invitations → Evaluate Results
    → Create Task Assessments → Review Candidate Dashboards
    → View AI Scores + Proctoring Analysis → Shortlist → Interview
```

---

## Ports Summary

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend API | 5000 | http://localhost:5000 |
| ML Service | 8000 | http://localhost:8000 |

---

## License

This project is for educational and demonstration purposes.

