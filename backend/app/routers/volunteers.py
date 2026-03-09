from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from ..database import get_db
from ..models import Volunteer
from ..schemas import VolunteerResponse

router = APIRouter(prefix="/api/volunteers", tags=["volunteers"])

@router.get("/", response_model=List[VolunteerResponse])
async def get_volunteers(
    category: str = None,
    is_active: bool = True,
    db: Session = Depends(get_db)
):
    """Get all volunteers, optionally filtered by category"""
    query = db.query(Volunteer).filter(Volunteer.is_active == is_active)
    
    if category:
        # Filter by category in array
        query = query.filter(Volunteer.categories.contains([category]))
    
    volunteers = query.all()
    return volunteers

@router.get("/{volunteer_id}", response_model=VolunteerResponse)
async def get_volunteer(volunteer_id: uuid.UUID, db: Session = Depends(get_db)):
    """Get a single volunteer by ID"""
    volunteer = db.query(Volunteer).filter(Volunteer.id == volunteer_id).first()
    
    if not volunteer:
        raise HTTPException(status_code=404, detail="Volunteer not found")
    
    return volunteer