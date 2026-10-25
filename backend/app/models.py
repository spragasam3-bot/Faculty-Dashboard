from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(150), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(String(100), nullable=False, default="Administrator")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<User {self.email} ({self.role})>"


class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False, index=True)
    designation = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    joining_date = Column(String(20), nullable=False)  # Stored as YYYY-MM-DD
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to activities with cascade delete
    activities = relationship("Activity", back_populates="faculty", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Faculty {self.name} ({self.department})>"


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False, index=True)  # Teaching, Publication, FDP, Consultancy, Patent
    year = Column(Integer, nullable=False, index=True)
    date_or_period = Column(String(100), nullable=True)  # e.g., "Jan 2025", "Semester 1", "2025-04-12"
    status = Column(String(50), nullable=False, default="Completed")  # Completed, Ongoing, Published, Granted, etc.
    description = Column(Text, nullable=True)
    metric_value = Column(Float, default=0.0)  # e.g., hours/week for teaching, funding amount for consultancy
    publisher_or_organization = Column(String(200), nullable=True)  # Journal, Agency, Organizer, Patent Office
    created_at = Column(DateTime, default=datetime.utcnow)

    faculty = relationship("Faculty", back_populates="activities")

    def __repr__(self):
        return f"<Activity {self.category}: {self.title}>"

