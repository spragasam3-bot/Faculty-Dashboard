import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.models import Base, Faculty, Activity, User

# Database configuration: support PostgreSQL / external DATABASE_URL if configured, fallback to SQLite
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    # Render and Heroku use postgres:// which SQLAlchemy deprecated in favor of postgresql://
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_DATABASE_URL = DATABASE_URL
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
else:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DB_PATH = os.path.join(BASE_DIR, "faculty_dashboard.db")
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency for obtaining database session per request"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_sample_data(db: Session):
    """Populate realistic sample records on first run"""
    # Check if faculty records already exist
    if db.query(Faculty).first():
        return

    sample_faculty = [
        Faculty(
            name="Dr. Rajesh Sharma",
            department="Computer Science & Engineering",
            designation="Professor",
            email="rajesh.sharma@university.edu",
            joining_date="2018-06-15"
        ),
        Faculty(
            name="Dr. Priya Venkatesh",
            department="Electronics & Communication",
            designation="Associate Professor",
            email="priya.v@university.edu",
            joining_date="2020-08-01"
        ),
        Faculty(
            name="Prof. Amit Kulkarni",
            department="Mechanical Engineering",
            designation="Assistant Professor",
            email="amit.kulkarni@university.edu",
            joining_date="2022-01-10"
        ),
        Faculty(
            name="Dr. Sunita Menon",
            department="Information Technology",
            designation="Professor & HOD",
            email="sunita.menon@university.edu",
            joining_date="2017-04-20"
        ),
        Faculty(
            name="Prof. Vikram Patel",
            department="Computer Science & Engineering",
            designation="Assistant Professor",
            email="vikram.patel@university.edu",
            joining_date="2023-07-01"
        )
    ]

    db.add_all(sample_faculty)
    db.commit()

    # Re-fetch with generated IDs
    f_sharma = db.query(Faculty).filter(Faculty.email == "rajesh.sharma@university.edu").first()
    f_priya = db.query(Faculty).filter(Faculty.email == "priya.v@university.edu").first()
    f_amit = db.query(Faculty).filter(Faculty.email == "amit.kulkarni@university.edu").first()
    f_sunita = db.query(Faculty).filter(Faculty.email == "sunita.menon@university.edu").first()
    f_vikram = db.query(Faculty).filter(Faculty.email == "vikram.patel@university.edu").first()

    sample_activities = [
        # Teaching Workloads
        Activity(
            faculty_id=f_sharma.id,
            title="Advanced Database Management Systems (CS601)",
            category="Teaching",
            year=2025,
            date_or_period="Semester 1 (Aug - Dec 2025)",
            status="Completed",
            description="Core graduate course covering distributed query processing, ACID/BASE guarantees, and NoSQL engines.",
            metric_value=4.0,  # 4 contact hours/week
            publisher_or_organization="Dept. of Computer Science"
        ),
        Activity(
            faculty_id=f_sharma.id,
            title="Design and Analysis of Algorithms (CS302)",
            category="Teaching",
            year=2026,
            date_or_period="Semester 2 (Jan - May 2026)",
            status="Ongoing",
            description="Undergraduate course with 120 enrolled students, dynamic programming and NP-completeness.",
            metric_value=5.0,
            publisher_or_organization="Dept. of Computer Science"
        ),
        Activity(
            faculty_id=f_priya.id,
            title="VLSI Design & Digital Signal Processing (EC502)",
            category="Teaching",
            year=2025,
            date_or_period="Fall 2025",
            status="Completed",
            description="Hands-on cadence tools laboratory and CMOS architecture lectures.",
            metric_value=6.0,
            publisher_or_organization="Dept. of ECE"
        ),
        Activity(
            faculty_id=f_amit.id,
            title="Computational Fluid Dynamics & Thermal Analysis",
            category="Teaching",
            year=2025,
            date_or_period="Spring 2025",
            status="Completed",
            description="Engineering thermodynamics and ANSYS simulation laboratory sessions.",
            metric_value=5.0,
            publisher_or_organization="Dept. of Mechanical Engineering"
        ),
        Activity(
            faculty_id=f_sunita.id,
            title="Cloud Architecture & Enterprise Computing (IT701)",
            category="Teaching",
            year=2026,
            date_or_period="Semester 2 (Jan - May 2026)",
            status="Ongoing",
            description="Microservices, containerization, and AWS/GCP cloud native patterns.",
            metric_value=4.0,
            publisher_or_organization="Dept. of IT"
        ),
        Activity(
            faculty_id=f_vikram.id,
            title="Object-Oriented Programming with Java (CS204)",
            category="Teaching",
            year=2025,
            date_or_period="Fall 2025",
            status="Completed",
            description="Foundations of OOP, inheritance, multi-threading, and unit testing.",
            metric_value=4.0,
            publisher_or_organization="Dept. of Computer Science"
        ),

        # Publications
        Activity(
            faculty_id=f_sharma.id,
            title="Federated Learning for Privacy-Preserving Healthcare Analytics",
            category="Publication",
            year=2025,
            date_or_period="March 2025",
            status="Published",
            description="Peer-reviewed research on differential privacy in distributed electronic health record systems.",
            metric_value=1.0,
            publisher_or_organization="IEEE Transactions on Artificial Intelligence"
        ),
        Activity(
            faculty_id=f_sharma.id,
            title="Optimized Sharding for Distributed Ledger Databases",
            category="Publication",
            year=2024,
            date_or_period="October 2024",
            status="Published",
            description="Analyzes horizontal partitioning and Byzantine fault tolerance in decentralized stores.",
            metric_value=1.0,
            publisher_or_organization="Springer Journal of Supercomputing"
        ),
        Activity(
            faculty_id=f_priya.id,
            title="Low-Power Silicon Photonic Interconnects for Edge Devices",
            category="Publication",
            year=2025,
            date_or_period="January 2025",
            status="Published",
            description="Novel wave-guide modulation reducing energy consumption by 34% in on-chip networks.",
            metric_value=1.0,
            publisher_or_organization="Elsevier Nano Communication Networks"
        ),
        Activity(
            faculty_id=f_amit.id,
            title="AI-Driven Predictive Maintenance for Heavy Industrial Turbines",
            category="Publication",
            year=2025,
            date_or_period="May 2025",
            status="Published",
            description="Vibration analysis using 1D convolutional neural networks on operational telemetry.",
            metric_value=1.0,
            publisher_or_organization="International Journal of Mechanical Sciences"
        ),
        Activity(
            faculty_id=f_sunita.id,
            title="Zero-Trust Access Control Framework for Multi-Cloud Higher Ed Portals",
            category="Publication",
            year=2026,
            date_or_period="February 2026",
            status="Published",
            description="Context-aware identity federation and mutual TLS in federated campus ecosystems.",
            metric_value=1.0,
            publisher_or_organization="ACM Transactions on Cyber-Physical Systems"
        ),

        # Faculty Development Programs (FDPs)
        Activity(
            faculty_id=f_sharma.id,
            title="National FDP on Generative AI and Large Language Models",
            category="FDP",
            year=2025,
            date_or_period="June 10 - June 15, 2025",
            status="Completed",
            description="One-week intensive AICTE ATAL academy sponsored training program on fine-tuning and RAG.",
            metric_value=40.0,  # 40 training hours
            publisher_or_organization="IIT Madras & AICTE ATAL"
        ),
        Activity(
            faculty_id=f_priya.id,
            title="Advanced Semiconductor Fabrication and Packaging Technologies",
            category="FDP",
            year=2024,
            date_or_period="December 2024",
            status="Completed",
            description="Hands-on training on clean room protocols, wafer dicing, and 3D stacking.",
            metric_value=35.0,
            publisher_or_organization="IISc Bangalore"
        ),
        Activity(
            faculty_id=f_amit.id,
            title="Industry 4.0 and Additive Manufacturing Techniques",
            category="FDP",
            year=2025,
            date_or_period="September 2025",
            status="Completed",
            description="Direct Metal Laser Sintering (DMLS) and topological optimization for aerospace alloys.",
            metric_value=30.0,
            publisher_or_organization="Siemens Centre of Excellence"
        ),
        Activity(
            faculty_id=f_sunita.id,
            title="Next-Generation Cybersecurity & Threat Modeling in EdTech",
            category="FDP",
            year=2026,
            date_or_period="January 2026",
            status="Completed",
            description="National capacity development program on MITRE ATT&CK framework and SOC operations.",
            metric_value=40.0,
            publisher_or_organization="CERT-In & NPTEL"
        ),
        Activity(
            faculty_id=f_vikram.id,
            title="Pedagogical Best Practices and Outcome-Based Education (OBE)",
            category="FDP",
            year=2025,
            date_or_period="August 2025",
            status="Completed",
            description="Aligning course outcomes with Bloom's Taxonomy and continuous internal evaluation.",
            metric_value=25.0,
            publisher_or_organization="National Board of Accreditation (NBA)"
        ),

        # Consultancy Projects
        Activity(
            faculty_id=f_sharma.id,
            title="Development of Automated Defect Detection System for Solar Wafers",
            category="Consultancy",
            year=2025,
            date_or_period="Jan - Sep 2025",
            status="Completed",
            description="Computer vision solution deployed on high-speed assembly line for micro-crack detection.",
            metric_value=450000.0,  # ₹ 450,000 grant
            publisher_or_organization="RenewTech Solar Industries"
        ),
        Activity(
            faculty_id=f_priya.id,
            title="Firmware Optimization for Ultra-Low Power Asset Trackers",
            category="Consultancy",
            year=2024,
            date_or_period="Apr - Dec 2024",
            status="Completed",
            description="Custom sleep mode power scheduling for BLE and LoRaWAN industrial tags.",
            metric_value=320000.0,
            publisher_or_organization="Bosch IoT Solutions"
        ),
        Activity(
            faculty_id=f_amit.id,
            title="Acoustic Vibration Dampener Design for Heavy Compressors",
            category="Consultancy",
            year=2025,
            date_or_period="Aug 2025 - Present",
            status="Ongoing",
            description="Finite element modeling to eliminate harmonic resonant frequencies.",
            metric_value=280000.0,
            publisher_or_organization="Kirloskar Pneumatics"
        ),
        Activity(
            faculty_id=f_sunita.id,
            title="Secure Cloud Architecture Review & ISO 27001 Audit Readiness",
            category="Consultancy",
            year=2025,
            date_or_period="Feb - Jul 2025",
            status="Completed",
            description="Third-party architectural security review and compliance roadmap for fintech client.",
            metric_value=550000.0,
            publisher_or_organization="Apex Financial Technologies"
        ),

        # Patents
        Activity(
            faculty_id=f_sharma.id,
            title="Intelligent Multi-Spectral Sensor for Early Agricultural Pest Detection",
            category="Patent",
            year=2024,
            date_or_period="Granted: Nov 2024",
            status="Granted",
            description="IoT field sensor leveraging edge inference and narrowband spectroscopy for crop health monitoring.",
            metric_value=1.0,
            publisher_or_organization="Indian Patent Office (App: 202441019876)"
        ),
        Activity(
            faculty_id=f_priya.id,
            title="Reconfigurable Optical Cross-Connect Switch for High-Density Data Centers",
            category="Patent",
            year=2025,
            date_or_period="Filed: June 2025",
            status="Under Review",
            description="MEMS-actuated photonic switching matrix that reduces transmission attenuation by 40%.",
            metric_value=1.0,
            publisher_or_organization="Indian Patent Office (App: 202541023190)"
        ),
        Activity(
            faculty_id=f_amit.id,
            title="Bio-Composite Material for Thermal and Acoustic Engine Insulation",
            category="Patent",
            year=2025,
            date_or_period="Filed: September 2025",
            status="Filed",
            description="Formulation utilizing agricultural waste fibers with flame-retardant natural resins.",
            metric_value=1.0,
            publisher_or_organization="Indian Patent Office (App: 202541038741)"
        ),
        Activity(
            faculty_id=f_sunita.id,
            title="Dynamic Token-Based Cryptographic Verification for Decentralized Cloud APIs",
            category="Patent",
            year=2026,
            date_or_period="Filed: January 2026",
            status="Filed",
            description="Zero-knowledge proof verification mechanism minimizing round-trip API handshakes.",
            metric_value=1.0,
            publisher_or_organization="Indian Patent Office (App: 202641001289)"
        )
    ]

    db.add_all(sample_activities)
    db.commit()


def seed_initial_admin(db: Session):
    """Seed initial administrator account if no user exists."""
    if db.query(User).first():
        return

    admin_email = os.getenv("ADMIN_EMAIL", "admin@university.edu").strip().lower()
    admin_password = os.getenv("ADMIN_PASSWORD", "Admin@123")
    admin_name = os.getenv("ADMIN_NAME", "Institutional Administrator")

    from app.security import hash_password

    hashed = hash_password(admin_password)
    admin_user = User(
        email=admin_email,
        hashed_password=hashed,
        name=admin_name,
        role="Administrator & Academic Coordinator",
        is_active=True
    )
    db.add(admin_user)
    db.commit()
    print(f"[AUTH] Initial administrator account provisioned: {admin_email}")


def init_db():
    """Create all tables and seed sample records"""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_sample_data(db)
        seed_initial_admin(db)
    finally:
        db.close()

