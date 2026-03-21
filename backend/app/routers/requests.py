from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from ..database import get_db
from ..models import Request, User
from ..schemas import RequestCreate, RequestResponse, RequestPublicResponse, RequestPrivateResponse
from ..services.ai_service import classify_request
from ..services.embedding_service import generate_request_embedding
from ..services.matching_service import find_matches_semantic


router = APIRouter(prefix="/api/requests", tags=["requests"])

@router.post("/", response_model=RequestResponse)
async def create_request(
    request_data: RequestCreate,
    user_id: str,
    db: Session = Depends(get_db)
):
    """Create a new help request"""
    
    # Validate user_id
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    # Get user data to populate requester fields
    user = db.query(User).filter(User.id == user_uuid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # AI Classification
    try:
        classification = classify_request(request_data.description)
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))
    
    # Generate embedding for semantic matching
    try:
        request_embedding = generate_request_embedding(
            request_data.description,
            classification["category"]
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail="We couldn't process your request right now. Please try again in a moment.")
    
    # Create request with embedding
    new_request = Request(
        user_id=user_uuid,
        requester_name=user.name,
        requester_email=user.email,
        requester_phone=None,
        description=request_data.description,
        latitude=request_data.latitude,
        longitude=request_data.longitude,
        address=request_data.address,
        category=classification["category"],
        routing_type=classification["routing_type"],
        urgency=classification["urgency"],
        status="pending",
        description_embedding=request_embedding
    )
    
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    
    # Find matches using SEMANTIC SIMILARITY
    matches = find_matches_semantic(new_request, db)
    
    # Save matches
    for match in matches:
        db.add(match)
    
    # Update request status
    if matches:
        new_request.status = "matched"
    else:
        new_request.status = "no_matches"
    
    db.commit()
    db.refresh(new_request)
    
    return new_request

@router.get("/", response_model=List[RequestResponse])
async def get_all_requests(
    status_filter: str = None,
    category: str = None,
    db: Session = Depends(get_db)
):
    """Get all requests"""
    query = db.query(Request)
    
    if status_filter:
        query = query.filter(Request.status == status_filter)
    if category:
        query = query.filter(Request.category == category)
    
    return query.order_by(Request.created_at.desc()).all()

@router.get("/{request_id}")
async def get_request(
    request_id: uuid.UUID,
    helper_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get request details with privacy rules applied"""
    request = db.query(Request).filter(Request.id == request_id).first()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Check if this helper accepted the request
    has_accepted = False
    if helper_id:
        try:
            helper_uuid = uuid.UUID(helper_id)
            has_accepted = (
                request.accepted_by_volunteer_id == helper_uuid or
                request.accepted_by_organization_id == helper_uuid
            )
        except ValueError:
            pass
    
    if has_accepted:
        return RequestPrivateResponse.from_orm(request)
    else:
        return RequestPublicResponse.from_orm(request)

@router.patch("/{request_id}/status")
async def update_request_status(
    request_id: uuid.UUID,
    new_status: str,
    db: Session = Depends(get_db)
):
    """Update request status"""
    valid_statuses = ['pending', 'matched', 'in_progress', 'completed', 'cancelled', 'no_matches']
    
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {valid_statuses}"
        )
    
    request = db.query(Request).filter(Request.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    request.status = new_status
    db.commit()
    db.refresh(request)
    
    return {"message": "Status updated", "request": request}