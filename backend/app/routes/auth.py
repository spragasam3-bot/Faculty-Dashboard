from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, LoginResponse, UserProfile
from app.security import verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate institutional credentials and issue signed JWT access token."""
    email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact the administrator."
        )

    # Issue signed access token with sub, id, and user metadata
    token = create_access_token(data={
        "sub": user.email,
        "id": user.id,
        "name": user.name,
        "role": user.role
    })

    return LoginResponse(
        success=True,
        message=f"Welcome back, {user.name}!",
        token=token,
        token_type="bearer",
        user=UserProfile.model_validate(user)
    )


@router.get("/me", response_model=UserProfile)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Retrieve profile and institutional role of the currently authenticated user."""
    return UserProfile.model_validate(current_user)
