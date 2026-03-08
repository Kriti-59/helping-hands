from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from ..database import get_db
from ..models import User, Volunteer, Organization
from ..schemas import UserCreate, UserLogin, UserResponse
from ..utils.auth import hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user account"""
    
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = hash_password(user_data.password)
    
    # Create user
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login")
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Universal login for users, volunteers, and organizations.
    - Users use real passwords
    - Volunteers/orgs use 'demo123'
    """
    
    # Try user login (real password)
    user = db.query(User).filter(
        User.email == credentials.email,
        User.is_active == True
    ).first()
    
    if user:
        # Verify password
        if not verify_password(credentials.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Update last login
        user.last_login = datetime.now()
        db.commit()
        
        token = f"user_{user.id}"
        return {
            "token": token,
            "user_id": str(user.id),
            "user_type": "user",
            "name": user.name,
            "email": user.email
        }
    
    # Try volunteer login (demo password)
    volunteer = db.query(Volunteer).filter(
        Volunteer.email == credentials.email,
        Volunteer.is_active == True
    ).first()
    
    if volunteer:
        if credentials.password != "demo123":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        token = f"volunteer_{volunteer.id}"
        return {
            "token": token,
            "user_id": str(volunteer.id),
            "user_type": "volunteer",
            "name": volunteer.name,
            "email": volunteer.email
        }
    
    # Try organization login (demo password)
    organization = db.query(Organization).filter(
        Organization.email == credentials.email,
        Organization.is_active == True
    ).first()
    
    if organization:
        if credentials.password != "demo123":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        token = f"organization_{organization.id}"
        return {
            "token": token,
            "user_id": str(organization.id),
            "user_type": "organization",
            "name": organization.name,
            "email": organization.email
        }
    
    # Not found
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials"
    )

@router.post("/logout")
async def logout():
    """Logout (frontend just clears token)"""
    return {"message": "Logged out successfully"}