from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database import get_db
from ..models import User, Volunteer, Organization
from ..schemas import UserLogin, VolunteerCreate
from ..utils.auth import verify_password, hash_password
from ..services.embedding_service import generate_volunteer_embedding


router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login")
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    # Universal login for users, volunteers, and organizations.
    """
    
    # Try User login
    user = db.query(User).filter(User.email == credentials.email).first()
    if user and verify_password(credentials.password, user.password_hash):
        return {
            "token": f"user_{user.id}",
            "user_id": str(user.id),
            "user_type": "user",
            "name": user.name,
            "email": user.email
        }
    
    # Try Volunteer login
    volunteer = db.query(Volunteer).filter(Volunteer.email == credentials.email).first()
    if volunteer and volunteer.password_hash and verify_password(credentials.password, volunteer.password_hash):
        if not volunteer.is_active:
            raise HTTPException(
                status_code=403,
                detail="Your volunteer application is pending approval"
            )
        return {
            "token": f"volunteer_{volunteer.id}",
            "user_id": str(volunteer.id),
            "user_type": "volunteer",
            "name": volunteer.name,
            "email": volunteer.email
        }
    
    # Try Organization login
    organization = db.query(Organization).filter(Organization.email == credentials.email).first()
    if organization and organization.password_hash and verify_password(credentials.password, organization.password_hash):
        if not organization.is_active:
            raise HTTPException(
                status_code=403,
                detail="Your organization account is pending approval"
            )
        return {
            "token": f"organization_{organization.id}",
            "user_id": str(organization.id),
            "user_type": "organization",
            "name": organization.name,
            "email": organization.email
        }
    
    # Not Found
    raise HTTPException(
        status_code=401,
        detail="Invalid email or password"
    )


@router.post("/register/volunteer")
async def register_volunteer(data: VolunteerCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(Volunteer).filter(Volunteer.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(Organization).filter(Organization.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    volunteer = Volunteer(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        phone=data.phone,
        bio=data.bio,
        address=data.address,
        latitude=data.latitude,
        longitude=data.longitude,
        radius_miles=data.radius_miles,
        categories=data.categories,
        skills_experience=data.skills_experience,
        has_vehicle=data.has_vehicle,
        can_lift_heavy=data.can_lift_heavy,
        languages=data.languages,
        is_active=True,
    )

    db.add(volunteer)
    db.commit()
    db.refresh(volunteer)

    try:
        embedding = generate_volunteer_embedding(volunteer)
        embedding_str = '[' + ','.join(map(str, embedding)) + ']'
        db.execute(
            text("UPDATE volunteers SET bio_embedding = :embedding WHERE id = :id"),
            {"embedding": embedding_str, "id": volunteer.id}
        )
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"⚠️ Embedding generation failed for {volunteer.email}: {e}")