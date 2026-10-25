from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models import Faculty, Activity
from app.schemas import ActivityCreate, ActivityUpdate, ActivityResponse

router = APIRouter(prefix="/activities", tags=["Activities"])

VALID_CATEGORIES = ["Teaching", "Publication", "FDP", "Consultancy", "Patent"]


@router.get("/meta/categories")
def get_categories():
    """Return available activity categories with helpful descriptors."""
    return [
        {
            "id": "Teaching",
            "name": "Teaching Workload",
            "description": "Courses, laboratory sessions, credits, and weekly contact hours",
            "metric_label": "Hours/Week"
        },
        {
            "id": "Publication",
            "name": "Publications",
            "description": "Journal papers, conference proceedings, book chapters, and articles",
            "metric_label": "Paper Count"
        },
        {
            "id": "FDP",
            "name": "Faculty Development Programs",
            "description": "Workshops, training programs, certifications, and pedagogy seminars",
            "metric_label": "Training Hours"
        },
        {
            "id": "Consultancy",
            "name": "Consultancy Projects",
            "description": "Industry collaborations, corporate training, sponsored R&D grants",
            "metric_label": "Grant Value (₹)"
        },
        {
            "id": "Patent",
            "name": "Patents & IP",
            "description": "Filed, published, and granted intellectual property and patents",
            "metric_label": "Patent Count"
        }
    ]


@router.get("", response_model=List[ActivityResponse])
def get_all_activities(
    faculty_id: Optional[int] = Query(None, description="Filter by faculty ID"),
    category: Optional[str] = Query(None, description="Filter by category"),
    year: Optional[int] = Query(None, description="Filter by academic year"),
    status: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search in title or organization"),
    db: Session = Depends(get_db)
):
    """Retrieve activities with rich filtering options."""
    query = db.query(Activity, Faculty.name.label("f_name"), Faculty.department.label("f_dept"))\
              .join(Faculty, Activity.faculty_id == Faculty.id)

    if faculty_id:
        query = query.filter(Activity.faculty_id == faculty_id)

    if category and category.strip() != "":
        query = query.filter(Activity.category.ilike(category.strip()))

    if year:
        query = query.filter(Activity.year == year)

    if status and status.strip() != "":
        query = query.filter(Activity.status.ilike(status.strip()))

    if search and search.strip() != "":
        pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Activity.title.ilike(pattern),
                Activity.description.ilike(pattern),
                Activity.publisher_or_organization.ilike(pattern),
                Faculty.name.ilike(pattern)
            )
        )

    results = query.order_by(Activity.year.desc(), Activity.created_at.desc()).all()

    activity_list = []
    for act, f_name, f_dept in results:
        activity_list.append(
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

    return activity_list


@router.get("/{activity_id}", response_model=ActivityResponse)
def get_activity_by_id(activity_id: int, db: Session = Depends(get_db)):
    """Retrieve details of a single activity."""
    result = db.query(Activity, Faculty.name.label("f_name"), Faculty.department.label("f_dept"))\
               .join(Faculty, Activity.faculty_id == Faculty.id)\
               .filter(Activity.id == activity_id).first()

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Activity with ID {activity_id} not found."
        )

    act, f_name, f_dept = result
    return ActivityResponse(
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


@router.post("", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
def create_activity(payload: ActivityCreate, db: Session = Depends(get_db)):
    """Add a new academic activity record."""
    # Check if faculty exists
    faculty_obj = db.query(Faculty).filter(Faculty.id == payload.faculty_id).first()
    if not faculty_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Faculty with ID {payload.faculty_id} does not exist."
        )

    # Normalize category capitalization
    normalized_category = payload.category.strip()
    match = next((c for c in VALID_CATEGORIES if c.lower() == normalized_category.lower()), None)
    if not match:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category '{payload.category}'. Valid categories are: {', '.join(VALID_CATEGORIES)}"
        )

    new_act = Activity(
        faculty_id=payload.faculty_id,
        title=payload.title.strip(),
        category=match,
        year=payload.year,
        date_or_period=payload.date_or_period.strip() if payload.date_or_period else None,
        status=payload.status.strip(),
        description=payload.description.strip() if payload.description else None,
        metric_value=payload.metric_value or 0.0,
        publisher_or_organization=payload.publisher_or_organization.strip() if payload.publisher_or_organization else None
    )

    db.add(new_act)
    db.commit()
    db.refresh(new_act)

    return ActivityResponse(
        id=new_act.id,
        faculty_id=new_act.faculty_id,
        title=new_act.title,
        category=new_act.category,
        year=new_act.year,
        date_or_period=new_act.date_or_period,
        status=new_act.status,
        description=new_act.description,
        metric_value=new_act.metric_value,
        publisher_or_organization=new_act.publisher_or_organization,
        created_at=new_act.created_at,
        faculty_name=faculty_obj.name,
        faculty_department=faculty_obj.department
    )


@router.put("/{activity_id}", response_model=ActivityResponse)
def update_activity(activity_id: int, payload: ActivityUpdate, db: Session = Depends(get_db)):
    """Update an existing activity record."""
    act = db.query(Activity).filter(Activity.id == activity_id).first()
    if not act:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Activity with ID {activity_id} not found."
        )

    if payload.faculty_id is not None:
        faculty_obj = db.query(Faculty).filter(Faculty.id == payload.faculty_id).first()
        if not faculty_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Faculty with ID {payload.faculty_id} does not exist."
            )
        act.faculty_id = payload.faculty_id

    if payload.category is not None:
        match = next((c for c in VALID_CATEGORIES if c.lower() == payload.category.strip().lower()), None)
        if not match:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid category '{payload.category}'. Valid categories are: {', '.join(VALID_CATEGORIES)}"
            )
        act.category = match

    if payload.title is not None:
        act.title = payload.title.strip()
    if payload.year is not None:
        act.year = payload.year
    if payload.date_or_period is not None:
        act.date_or_period = payload.date_or_period.strip()
    if payload.status is not None:
        act.status = payload.status.strip()
    if payload.description is not None:
        act.description = payload.description.strip()
    if payload.metric_value is not None:
        act.metric_value = payload.metric_value
    if payload.publisher_or_organization is not None:
        act.publisher_or_organization = payload.publisher_or_organization.strip()

    db.commit()
    db.refresh(act)

    faculty_obj = db.query(Faculty).filter(Faculty.id == act.faculty_id).first()

    return ActivityResponse(
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
        faculty_name=faculty_obj.name if faculty_obj else None,
        faculty_department=faculty_obj.department if faculty_obj else None
    )


@router.delete("/{activity_id}", status_code=status.HTTP_200_OK)
def delete_activity(activity_id: int, db: Session = Depends(get_db)):
    """Delete an activity record."""
    act = db.query(Activity).filter(Activity.id == activity_id).first()
    if not act:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Activity with ID {activity_id} not found."
        )

    title = act.title
    db.delete(act)
    db.commit()

    return {"message": f"Activity '{title}' has been deleted successfully."}
