# Faculty Performance and Academic Activity Dashboard (FacultyHub)

A modern, simple, and secure institutional web application to record, track, and review faculty performance and academic activities in higher education institutions.

---

## 📌 Project Overview

FacultyHub helps academic institutions and department heads manage, evaluate, and track:
- **Institutional Access & Security:** Secure JWT-based authentication with bcrypt-hashed passwords and protected institutional APIs.
- **Teaching Workload:** Courses, laboratories, weekly contact hours, and semester scheduling.
- **Research Publications:** Journals, conference proceedings, and citations.
- **Faculty Development Programs (FDPs):** Workshops, industrial trainings, and pedagogical seminars.
- **Consultancy Projects:** Industry collaborations and sanctioned grant values.
- **Patents & IP:** Filed, published, and granted intellectual property.
- **Performance Appraisal:** Transparent mathematical scoring formula with automatic grade ratings (Grade A+ to C).

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 19 (Vite) | Responsive component architecture, Lucide icons, Vanilla CSS design tokens |
| **Backend** | Python (FastAPI) | Modular REST API, Pydantic schemas, JWT signed tokens, bcrypt hashing |
| **Database** | SQLite + SQLAlchemy | Auto-initialized relational tables (`faculty`, `activities`, `users`) with automatic sample data |
| **Security** | PyJWT + Bcrypt | Salted password hashing (rounds=12), HS256-signed access tokens with expiration, Bearer auth headers |

---

## 📁 Project Structure

```text
Fsd final/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── database.py       # SQLite connection, SessionLocal & automatic seeder
│   │   ├── models.py         # SQLAlchemy models for User, Faculty, and Activity
│   │   ├── schemas.py        # Pydantic schemas for request validation & auth responses
│   │   ├── security.py       # Password hashing, JWT creation/verification, get_current_user dependency
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py       # Public /login and protected /me authentication endpoints
│   │   │   ├── faculty.py    # Protected CRUD endpoints for faculty members & search
│   │   │   ├── activities.py # Protected CRUD endpoints for academic activities & filters
│   │   │   ├── dashboard.py  # Protected aggregated metrics, category counts, year trends
│   │   │   └── appraisal.py  # Protected appraisal score calculation & portfolio breakdown
│   │   └── main.py           # FastAPI entrypoint, CORS configuration, and route protection
│   ├── create_admin.py       # Documented CLI seed script for creating administrator accounts
│   ├── requirements.txt      # Python dependencies (FastAPI, PyJWT, Bcrypt, Dotenv, etc.)
│   ├── run.py                # Convenient Python runner script
│   ├── .env.example          # Template environment file with placeholder values
│   ├── .env                  # Local environment file (ignored by version control)
│   └── faculty_dashboard.db  # SQLite database (auto-generated)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx   # Main navigation sidebar with active user badge & sign out
│   │   │   ├── Header.jsx    # Top app header with context titles and sign out button
│   │   │   ├── SummaryCard.jsx # Reusable KPI summary cards
│   │   │   ├── ActivityChart.jsx # Interactive pure CSS/SVG breakdown charts
│   │   │   ├── Modal.jsx     # Accessible dialogs with keyboard support
│   │   │   └── Toast.jsx     # Floating notification alerts
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx # Responsive institutional sign-in page with validation
│   │   │   ├── DashboardPage.jsx  # Overview metrics, charts & recent records
│   │   │   ├── FacultyPage.jsx    # Faculty directory, search, Add/Edit/Delete
│   │   │   ├── ActivitiesPage.jsx # Activities table, category filters, Add/Edit/Delete
│   │   │   └── AppraisalPage.jsx  # Transparent appraisal calculator & portfolio
│   │   ├── services/
│   │   │   └── api.js        # Centralized REST API client with JWT injection & 401 interceptor
│   │   ├── App.jsx           # Auth session coordinator, tab routing, and modal alerts
│   │   ├── App.css           # Component styles, login cards, responsive layout
│   │   ├── index.css         # Design tokens & color system
│   │   └── main.jsx          # React DOM entry point
│   ├── index.html            # HTML shell with proper meta & title
│   ├── package.json          # Node dependencies and scripts
│   └── vite.config.js        # Vite config with backend proxy
├── .gitignore                # Protects .env secrets, *.db, and build caches
└── README.md                 # Complete documentation and run instructions
```

---

## 🔐 Authentication & Security Architecture

### Key Security Features
1. **No Plain-Text Passwords:** All passwords are salted and hashed using `bcrypt` (12 rounds) before storage. Plain-text passwords are never logged or stored.
2. **Signed Access Tokens:** Authenticated users receive an HMAC-SHA256 (`HS256`) signed JSON Web Token (JWT) with an expiration timestamp (`exp`).
3. **Environment-Driven Secrets:** The token signing key (`JWT_SECRET`) is loaded via `python-dotenv` from the `.env` file and is never hardcoded in source control.
4. **Protected API Routes:** All sensitive institutional endpoints (`/api/dashboard/*`, `/api/faculty/*`, `/api/activities/*`, `/api/appraisal/*`, `/api/auth/me`) require a valid `Bearer <token>` authorization header. Unauthenticated or expired requests are rejected with `401 Unauthorized`.
5. **No Public Self-Registration:** Because this is an institution-managed platform, public registration endpoints are intentionally disabled. Administrator accounts are provisioned via the secure CLI seed script or environment configuration.
6. **Graceful Session Expiration:** If a JWT token expires while browsing, the frontend interceptor clears stored credentials and redirects the user to the login page with a clear notification.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+** (Tested on Python 3.14)
- **Node.js 18+** & **npm**

---

### Step 1: Configure Environment Variables

Navigate to the `backend/` directory:

```bash
cd backend
```

Copy the example environment file to create your local `.env`:

```bash
# On Windows PowerShell:
Copy-Item .env.example .env

# On Linux / macOS:
cp .env.example .env
```

Open `.env` and verify the settings:
```env
# Cryptographic secret for signing JWT access tokens (use a random string in production)
JWT_SECRET=super_secret_faculty_hub_dev_key_8f93a201c742918e77d94

# Token expiration time in minutes (480 minutes = 8 hours)
ACCESS_TOKEN_EXPIRE_MINUTES=480

# Default initial administrator account created on first startup
ADMIN_NAME=Institutional Administrator
ADMIN_EMAIL=admin@university.edu
ADMIN_PASSWORD=Admin@123
```

---

### Step 2: Install Backend Dependencies & Create Administrator

Install the required Python packages:

```bash
python -m pip install -r requirements.txt
```

#### Provisioning Administrator Accounts

You can create or update an administrator account using the seed script `create_admin.py`:

**Option A: Non-interactive command with arguments:**
```bash
python create_admin.py --email admin@university.edu --password Admin@123 --name "Institutional Administrator"
```

**Option B: Interactive prompt with secure password masking:**
```bash
python create_admin.py
```
*(The script prompts for email, full name, masked password, and password confirmation without echoing credentials.)*

---

### Step 3: Start the Backend Server

From the `backend/` directory:

```bash
python run.py
```

*Alternatively, with uvicorn directly:*
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- **Backend API URL:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Health Check:** [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

### Step 4: Start the Frontend Application

Open a second terminal window and navigate to `frontend/`:

```bash
cd frontend
npm install
npm run dev
```

- **Frontend Application URL:** [http://localhost:5173](http://localhost:5173)

---

## 🖥️ Using the Application

### 1. Signing In
1. Navigate to [http://localhost:5173](http://localhost:5173).
2. The **Institutional Sign In** page will appear.
3. Enter your administrator email (e.g., `admin@university.edu`) and password (`Admin@123`), or click the **Auto-fill** shortcut on the demo helper card.
4. Click **Sign In to Dashboard**.
5. Client-side validation ensures fields are filled and formatted properly. If invalid credentials are provided, a clear error banner explains the issue.
6. The password field includes an interactive eye toggle to preview or hide the password safely.

### 2. Navigating the Dashboard
Once signed in, access all institutional management tabs:
- **Dashboard:** View high-level metrics across teaching workloads, publications, FDPs, consultancies, and patents.
- **Faculty Members:** Browse the faculty directory, search by name/department, and add or edit faculty records.
- **Academic Activities:** Record and filter activities across categories with custom metric fields.
- **Faculty Appraisal:** Calculate merit scores, view grade ratings (Outstanding, Excellent, etc.), and inspect itemized contributions.

### 3. Signing Out
- Click the **Sign Out** button in the top navigation header or at the bottom of the sidebar.
- Your session token is cleared from browser storage, returning you to the login screen.

---

## 📡 REST API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | **Public** | Authenticate email and password; returns JWT token & user profile |
| `GET` | `/api/auth/me` | **Protected** (Bearer) | Get current authenticated user profile |
| `GET` | `/api/health` | **Public** | Service health status |
| `GET` | `/api/dashboard/stats` | **Protected** (Bearer) | Aggregated dashboard summary statistics & charts |
| `GET` | `/api/faculty` | **Protected** (Bearer) | List faculty members (optional search `q` & `department`) |
| `POST` | `/api/faculty` | **Protected** (Bearer) | Add a new faculty member |
| `GET` | `/api/faculty/{id}` | **Protected** (Bearer) | Get a single faculty member's details |
| `PUT` | `/api/faculty/{id}` | **Protected** (Bearer) | Update faculty member details |
| `DELETE` | `/api/faculty/{id}` | **Protected** (Bearer) | Delete a faculty member (cascades activities) |
| `GET` | `/api/activities` | **Protected** (Bearer) | List activities (filters: `faculty_id`, `category`, `year`, `search`) |
| `POST` | `/api/activities` | **Protected** (Bearer) | Create a new academic activity record |
| `GET` | `/api/activities/{id}` | **Protected** (Bearer) | Get single activity details |
| `PUT` | `/api/activities/{id}` | **Protected** (Bearer) | Update an activity record |
| `DELETE` | `/api/activities/{id}` | **Protected** (Bearer) | Delete an activity record |
| `GET` | `/api/activities/meta/categories` | **Protected** (Bearer) | Category metadata and metric units |
| `GET` | `/api/appraisal/{faculty_id}` | **Protected** (Bearer) | Calculate appraisal scores and itemized breakdown |

---

## 🧪 Verification & Testing

To run automated backend authentication and API verification tests:

```bash
cd backend
python -c "
from fastapi.testclient import TestClient
from app.main import app
client = TestClient(app)
res_unauth = client.get('/api/dashboard/stats')
assert res_unauth.status_code == 401
res_login = client.post('/api/auth/login', json={'email': 'admin@university.edu', 'password': 'Admin@123'})
assert res_login.status_code == 200
token = res_login.json()['token']
res_auth = client.get('/api/dashboard/stats', headers={'Authorization': f'Bearer {token}'})
assert res_auth.status_code == 200
print('Verification successful: All routes properly protected!')
"
```
