from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.database import get_db
from app.models import Faculty, Activity
from app.schemas import FacultyCreate, FacultyUpdate, FacultyResponse

router = APIRouter(prefix="/faculty", tags=["Faculty"])


@router.get("", response_model=List[FacultyResponse])
def get_all_faculty(
    q: Optional[str] = Query(None, description="Search by faculty name or department"),
    department: Optional[str] = Query(None, description="Filter by department"),
    db: Session = Depends(get_db)
):
    """Retrieve all faculty members with optional search by name or department."""
    query = db.query(
        Faculty,
        func.count(Activity.id).label("activity_count")
    ).outerjoin(Activity, Faculty.id == Activity.faculty_id).group_by(Faculty.id)

    if q:
        search_pattern = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Faculty.name.ilike(search_pattern),
                Faculty.department.ilike(search_pattern),
                Faculty.designation.ilike(search_pattern),
                Faculty.email.ilike(search_pattern)
            )
        )

    if department and department.strip() != "":
        query = query.filter(Faculty.department == department.strip())

    results = query.order_by(Faculty.name.asc()).all()

    faculty_list = []
    for faculty_obj, act_count in results:
        data = FacultyResponse(
            id=faculty_obj.id,
            name=faculty_obj.name,
            department=faculty_obj.department,
            designation=faculty_obj.designation,
            email=faculty_obj.email,
            joining_date=faculty_obj.joining_date,
            created_at=faculty_obj.created_at,
            activity_count=act_count
        )
        faculty_list.append(data)

    return faculty_list


@router.get("/{faculty_id}", response_model=FacultyResponse)
def get_faculty_by_id(faculty_id: int, db: Session = Depends(get_db)):
    """Retrieve details of a single faculty member."""
    faculty_obj = db.query(Faculty).filter(Faculty.id == faculty_id).first()
    if not faculty_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Faculty with ID {faculty_id} not found."
        )

    act_count = db.query(func.count(Activity.id)).filter(Activity.faculty_id == faculty_id).scalar() or 0
    return FacultyResponse(
        id=faculty_obj.id,
        name=faculty_obj.name,
        department=faculty_obj.department,
        designation=faculty_obj.designation,
        email=faculty_obj.email,
        joining_date=faculty_obj.joining_date,
        created_at=faculty_obj.created_at,
        activity_count=act_count
    )


@router.post("", response_model=FacultyResponse, status_code=status.HTTP_201_CREATED)
def create_faculty(payload: FacultyCreate, db: Session = Depends(get_db)):
    """Register a new faculty member."""
    # Check if email is already taken
    existing = db.query(Faculty).filter(Faculty.email == payload.email.strip().lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Faculty with email '{payload.email}' already exists."
        )

    new_faculty = Faculty(
        name=payload.name.strip(),
        department=payload.department.strip(),
        designation=payload.designation.strip(),
        email=payload.email.strip().lower(),
        joining_date=payload.joining_date.strip()
    )
    db.add(new_faculty)
    db.commit()
    db.refresh(new_faculty)

    return FacultyResponse(
        id=new_faculty.id,
        name=new_faculty.name,
        department=new_faculty.department,
        designation=new_faculty.designation,
        email=new_faculty.email,
        joining_date=new_faculty.joining_date,
        created_at=new_faculty.created_at,
        activity_count=0
    )


@router.put("/{faculty_id}", response_model=FacultyResponse)
def update_faculty(faculty_id: int, payload: FacultyUpdate, db: Session = Depends(get_db)):
    """Update existing faculty details."""
    faculty_obj = db.query(Faculty).filter(Faculty.id == faculty_id).first()
    if not faculty_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Faculty with ID {faculty_id} not found."
        )

    # Check email uniqueness if email changed
    if payload.email and payload.email.strip().lower() != faculty_obj.email:
        existing = db.query(Faculty).filter(Faculty.email == payload.email.strip().lower()).first()
        if existing and existing.id != faculty_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email '{payload.email}' is already used by another faculty member."
            )
        faculty_obj.email = payload.email.strip().lower()

    if payload.name is not None:
        faculty_obj.name = payload.name.strip()
    if payload.department is not None:
        faculty_obj.department = payload.department.strip()
    if payload.designation is not None:
        faculty_obj.designation = payload.designation.strip()
    if payload.joining_date is not None:
        faculty_obj.joining_date = payload.joining_date.strip()

    db.commit()
    db.refresh(faculty_obj)

    act_count = db.query(func.count(Activity.id)).filter(Activity.faculty_id == faculty_id).scalar() or 0
    return FacultyResponse(
        id=faculty_obj.id,
        name=faculty_obj.name,
        department=faculty_obj.department,
        designation=faculty_obj.designation,
        email=faculty_obj.email,
        joining_date=faculty_obj.joining_date,
        created_at=faculty_obj.created_at,
        activity_count=act_count
    )


@router.delete("/{faculty_id}", status_code=status.HTTP_200_OK)
def delete_faculty(faculty_id: int, db: Session = Depends(get_db)):
    """Delete a faculty member and all related academic activities."""
    faculty_obj = db.query(Faculty).filter(Faculty.id == faculty_id).first()
    if not faculty_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Faculty with ID {faculty_id} not found."
        )

    name = faculty_obj.name
    db.delete(faculty_obj)
    db.commit()

    return {"message": f"Faculty '{name}' and all associated activities have been removed successfully."}
