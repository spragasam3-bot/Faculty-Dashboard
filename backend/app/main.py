from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.security import get_current_user
from app.routes import faculty, activities, dashboard, appraisal, auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed sample data on app start
    print("Initializing SQLite database and verifying sample records...")
    init_db()
    print("Database ready.")
    yield


app = FastAPI(
    title="Faculty Performance and Academic Activity Dashboard API",
    description="REST API for tracking faculty workload, research publications, FDPs, consultancy, and performance appraisal.",
    version="1.0.0",
    lifespan=lifespan
)

# Ensure database tables and sample records are initialized immediately
try:
    init_db()
except Exception as e:
    print(f"[DB] Initial db init note: {e}")

# Enable CORS for frontend development server and cloud deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Public authentication endpoints
app.include_router(auth.router, prefix="/api")

# Protected institutional data endpoints (require signed JWT bearer token)
app.include_router(dashboard.router, prefix="/api", dependencies=[Depends(get_current_user)])
app.include_router(faculty.router, prefix="/api", dependencies=[Depends(get_current_user)])
app.include_router(activities.router, prefix="/api", dependencies=[Depends(get_current_user)])
app.include_router(appraisal.router, prefix="/api", dependencies=[Depends(get_current_user)])



@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Faculty Performance and Academic Activity Dashboard API",
        "version": "1.0.0"
    }


@app.get("/")
def root():
    return {
        "message": "Welcome to the Faculty Performance and Academic Activity Dashboard API. Visit /docs for Swagger UI documentation."
    }
