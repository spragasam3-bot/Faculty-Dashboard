from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Faculty, Activity
from app.schemas import (
    FacultyResponse,
    ActivityResponse,
    CategoryScoreDetail,
    FacultyAppraisalResponse
)

router = APIRouter(prefix="/appraisal", tags=["Appraisal"])

# Transparent appraisal scoring criteria
APPRAISAL_CRITERIA = {
    "Teaching": {
        "unit_points": 10,
        "multiplier_label": "10 points / course load",
        "notes": "Recognizes course preparation, syllabus delivery, and student mentoring."
    },
    "Publication": {
        "unit_points": 15,
        "multiplier_label": "15 points / publication",
        "notes": "Recognizes peer-reviewed research papers in indexed journals and conferences."
    },
    "FDP": {
        "unit_points": 10,
        "multiplier_label": "10 points / program",
        "notes": "Continuous learning, pedagogy improvement, and technological upskilling."
    },
    "Consultancy": {
        "unit_points": 15,
        "multiplier_label": "15 points / consultancy project",
        "notes": "Industry collaboration, technological transfer, and external grant generation."
    },
    "Patent": {
        "unit_points": 25,
        "multiplier_label": "25 points / patent or IP",
        "notes": "High-impact invention, intellectual property creation, and patent filing/grant."
    }
}


def calculate_performance_rating(total_score: float) -> str:
    if total_score >= 80:
        return "Outstanding (Grade A+)"
    elif total_score >= 60:
        return "Excellent (Grade A)"
    elif total_score >= 40:
        return "Very Good (Grade B+)"
    elif total_score >= 20:
        return "Satisfactory (Grade B)"
    else:
        return "Needs Improvement (Grade C)"


@router.get("/{faculty_id}", response_model=FacultyAppraisalResponse)
def get_faculty_appraisal(faculty_id: int, db: Session = Depends(get_db)):
    """Calculate and return transparent performance appraisal metrics for a faculty member."""
    faculty_obj = db.query(Faculty).filter(Faculty.id == faculty_id).first()
    if not faculty_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Faculty with ID {faculty_id} not found."
        )

    # Fetch all activities for this faculty
    activities = db.query(Activity).filter(Activity.faculty_id == faculty_id).order_by(Activity.year.desc()).all()

    # Calculate score breakdown
    breakdown: List[CategoryScoreDetail] = []
    total_score = 0.0

    category_counts = {
        "Teaching": 0,
        "Publication": 0,
        "FDP": 0,
        "Consultancy": 0,
        "Patent": 0
    }

    for act in activities:
        cat = act.category
        if cat in category_counts:
            category_counts[cat] += 1

    for cat_name, criteria in APPRAISAL_CRITERIA.items():
        cnt = category_counts.get(cat_name, 0)
        subtotal = float(cnt * criteria["unit_points"])
        total_score += subtotal

        breakdown.append(
            CategoryScoreDetail(
                category=cat_name,
                count=cnt,
                unit_points=criteria["unit_points"],
                multiplier_label=criteria["multiplier_label"],
                subtotal_score=subtotal,
                notes=criteria["notes"]
            )
        )

    rating = calculate_performance_rating(total_score)

    calc_summary = (
        f"Appraisal score is computed as: "
        f"(Teaching: {category_counts['Teaching']} x 10) + "
        f"(Publications: {category_counts['Publication']} x 15) + "
        f"(FDPs: {category_counts['FDP']} x 10) + "
        f"(Consultancy: {category_counts['Consultancy']} x 15) + "
        f"(Patents: {category_counts['Patent']} x 25) = "
        f"{int(total_score)} Points."
    )

    activity_responses = [
        ActivityResponse(
            id=a.id,
            faculty_id=a.faculty_id,
            title=a.title,
            category=a.category,
            year=a.year,
            date_or_period=a.date_or_period,
            status=a.status,
            description=a.description,
            metric_value=a.metric_value,
            publisher_or_organization=a.publisher_or_organization,
            created_at=a.created_at,
            faculty_name=faculty_obj.name,
            faculty_department=faculty_obj.department
        )
        for a in activities
    ]

    return FacultyAppraisalResponse(
        faculty=FacultyResponse(
            id=faculty_obj.id,
            name=faculty_obj.name,
            department=faculty_obj.department,
            designation=faculty_obj.designation,
            email=faculty_obj.email,
            joining_date=faculty_obj.joining_date,
            created_at=faculty_obj.created_at,
            activity_count=len(activities)
        ),
        total_score=total_score,
        performance_rating=rating,
        score_breakdown=breakdown,
        activities=activity_responses,
        calculation_summary=calc_summary
    )
