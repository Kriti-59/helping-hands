from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from ..database import get_db
from ..models import Organization
from ..schemas import OrganizationResponse

router = APIRouter(prefix="/api/organizations", tags=["organizations"])

@router.get("/", response_model=List[OrganizationResponse])
async def get_organizations(
    category: str = None,
    is_active: bool = True,
    db: Session = Depends(get_db)
):
    """Get all organizations, optionally filtered by category"""
    query = db.query(Organization).filter(Organization.is_active == is_active)
    
    if category:
        query = query.filter(Organization.categories.contains([category]))
    
    organizations = query.all()
    return organizations

@router.get("/{org_id}", response_model=OrganizationResponse)
async def get_organization(org_id: uuid.UUID, db: Session = Depends(get_db)):
    """Get a single organization by ID"""
    org = db.query(Organization).filter(Organization.id == org_id).first()
    
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    return org