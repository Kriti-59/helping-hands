from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from .. import models, schemas
from ..database import SessionLocal

router = APIRouter()

# Dependency for DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -----------------------------
# Create a Request (by Users)
# -----------------------------
@router.post("/requests/", response_model=schemas.RequestResponse)
def create_request(request: schemas.RequestCreate, db: Session = Depends(get_db)):
    # Create user record
    user = models.User(
        name=request.name,
        email=request.email,
        location_lat=request.location_lat,
        location_lng=request.location_lng
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create request
    new_request = models.Request(
        user_id=user.id,
        description=request.description,
        location_lat=request.location_lat,
        location_lng=request.location_lng,
        status="pending"
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return schemas.RequestResponse(
        id=new_request.id,
        description=new_request.description,
        location_lat=new_request.location_lat,
        location_lng=new_request.location_lng,
        status=new_request.status,
        created_at=new_request.created_at,
        user_name=user.name,
        user_email=user.email
    )

# -----------------------------
# Get all pending requests
# -----------------------------
@router.get("/requests/", response_model=list[schemas.RequestResponse])
def get_requests(db: Session = Depends(get_db)):
    requests = db.query(models.Request).filter(models.Request.status=="pending").all()
    response = []
    for req in requests:
        response.append(schemas.RequestResponse(
            id=req.id,
            description=req.description,
            location_lat=req.location_lat,
            location_lng=req.location_lng,
            status=req.status,
            created_at=req.created_at,
            user_name=req.user.name,
            user_email=req.user.email,
            volunteer_id=req.volunteer_id,
            organization_id=req.organization_id
        ))
    return response

# -----------------------------
# Accept a request (by provider)
# -----------------------------
@router.patch("/requests/{request_id}/accept", response_model=schemas.RequestResponse)
def accept_request(request_id: UUID, update: schemas.RequestUpdateStatus, db: Session = Depends(get_db)):
    req = db.query(models.Request).filter(models.Request.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    req.status = update.status
    req.volunteer_id = update.volunteer_id
    req.organization_id = update.organization_id

    db.commit()
    db.refresh(req)

    return schemas.RequestResponse(
        id=req.id,
        description=req.description,
        location_lat=req.location_lat,
        location_lng=req.location_lng,
        status=req.status,
        created_at=req.created_at,
        user_name=req.user.name,
        user_email=req.user.email,
        volunteer_id=req.volunteer_id,
        organization_id=req.organization_id
    )
