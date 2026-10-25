from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Faculty, Activity
from app.schemas import (
    DashboardStatsResponse,
    CategoryStat,
    DepartmentStat,
    YearTrendStat,
    ActivityResponse
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Aggregate all statistics and summaries for the main dashboard."""
    total_faculty = db.query(func.count(Faculty.id)).scalar() or 0
    total_activities = db.query(func.count(Activity.id)).scalar() or 0

    # Counts by category
    teaching_count = db.query(func.count(Activity.id)).filter(Activity.category == "Teaching").scalar() or 0
    total_teaching_hours = db.query(func.sum(Activity.metric_value)).filter(Activity.category == "Teaching").scalar() or 0.0

    publications_count = db.query(func.count(Activity.id)).filter(Activity.category == "Publication").scalar() or 0
    fdps_count = db.query(func.count(Activity.id)).filter(Activity.category == "FDP").scalar() or 0

    consultancy_count = db.query(func.count(Activity.id)).filter(Activity.category == "Consultancy").scalar() or 0
    total_consultancy_amount = db.query(func.sum(Activity.metric_value)).filter(Activity.category == "Consultancy").scalar() or 0.0

    patents_count = db.query(func.count(Activity.id)).filter(Activity.category == "Patent").scalar() or 0

    # Category distribution
    categories = ["Teaching", "Publication", "FDP", "Consultancy", "Patent"]
    category_distribution = []
    for cat in categories:
        count = db.query(func.count(Activity.id)).filter(Activity.category == cat).scalar() or 0
        pct = round((count / total_activities * 100), 1) if total_activities > 0 else 0.0
        category_distribution.append(
            CategoryStat(category=cat, count=count, percentage=pct)
        )

    # Department breakdown (faculty count and activity count)
    dept_rows = db.query(Faculty.department, func.count(Faculty.id)).group_by(Faculty.department).all()
    department_stats = []
    for dept_name, f_count in dept_rows:
        act_count = db.query(func.count(Activity.id))\
                      .join(Faculty, Activity.faculty_id == Faculty.id)\
                      .filter(Faculty.department == dept_name).scalar() or 0
        department_stats.append(
            DepartmentStat(department=dept_name, faculty_count=f_count, activity_count=act_count)
        )

    # Sort department stats by activity count desc
    department_stats.sort(key=lambda x: x.activity_count, reverse=True)

    # Year trends
    year_rows = db.query(Activity.year, func.count(Activity.id)).group_by(Activity.year).order_by(Activity.year.asc()).all()
    year_trends = [YearTrendStat(year=yr, count=cnt) for yr, cnt in year_rows]

    # Recent activities (latest 6)
    recent_query = db.query(Activity, Faculty.name.label("f_name"), Faculty.department.label("f_dept"))\
                     .join(Faculty, Activity.faculty_id == Faculty.id)\
                     .order_by(Activity.created_at.desc(), Activity.id.desc()).limit(6).all()

    recent_activities = []
    for act, f_name, f_dept in recent_query:
        recent_activities.append(
            ActivityResponse(
                id=act.id,
                faculty_id=act.faculty_id,
                title=act.title,
                category=act.category,
                year=act.year,
                date_or_period=act.date_or_period,
                status=act.status,
                description=act.description,
                metric_value=act.metric_value,
                publisher_or_organization=act.publisher_or_organization,
                created_at=act.created_at,
                faculty_name=f_name,
                faculty_department=f_dept
            )
        )

    return DashboardStatsResponse(
        total_faculty=total_faculty,
        total_activities=total_activities,
        teaching_count=teaching_count,
        total_teaching_hours=float(total_teaching_hours),
        publications_count=publications_count,
        fdps_count=fdps_count,
        consultancy_count=consultancy_count,
        total_consultancy_amount=float(total_consultancy_amount),
        patents_count=patents_count,
        category_distribution=category_distribution,
        department_stats=department_stats,
        year_trends=year_trends,
        recent_activities=recent_activities
    )
