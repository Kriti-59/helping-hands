from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from ..database import get_db
from ..models import Request, User, Match
from ..schemas import RequestCreate, RequestResponse, RequestPublicResponse, RequestPrivateResponse, StatusUpdate
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

@router.patch("/{request_id}/status", response_model=RequestResponse)
async def update_request_status(
    request_id: str,
    status_update: StatusUpdate,
    db: Session = Depends(get_db)
):
    """Update request status (complete/cancel)."""
    try:
        request_uuid = uuid.UUID(request_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid request ID")
    
    request = db.query(Request).filter(Request.id == request_uuid).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if status_update.status not in ["completed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    # Validate allowed transitions
    cancellable = ["pending", "matched", "no_matches", "in_progress"]
    completable = ["in_progress"]
    
    if status_update.status == "cancelled" and request.status not in cancellable:
        raise HTTPException(status_code=400, detail=f"Cannot cancel a request with status '{request.status}'")
    
    if status_update.status == "completed" and request.status not in completable:
        raise HTTPException(status_code=400, detail="Can only complete a request that is in progress")
    
    request.status = status_update.status
    db.commit()
    db.refresh(request)
    
    return RequestResponse.from_orm(request)

@router.put("/{request_id}", response_model=RequestResponse)
async def update_request(
    request_id: str,
    request_data: RequestCreate,
    user_id: str,
    db: Session = Depends(get_db)
):
    """Update an existing request and re-run matching."""
    try:
        request_uuid = uuid.UUID(request_id)
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid request ID or user ID format")
    
    request = db.query(Request).filter(Request.id == request_uuid).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Validate user ownership
    if request.user_id != user_uuid:
        raise HTTPException(status_code=403, detail="You do not have permission to edit this request")
    
    # Validate request status allows editing
    editable_statuses = ["pending", "matched", "no_matches"]
    if request.status not in editable_statuses:
        raise HTTPException(status_code=400, detail=f"Cannot edit a request with status '{request.status}'. Requests can only be edited before a helper accepts.")
    
    classification = classify_request(request_data.description)
    request_embedding = generate_request_embedding(
        request_data.description,
        classification["category"]
    )
    
    request.description = request_data.description
    request.address = request_data.address
    request.category = classification["category"]
    request.routing_type = classification["routing_type"]
    request.urgency = classification["urgency"]
    request.description_embedding = request_embedding
    
    db.commit()
    
    db.query(Match).filter(Match.request_id == request_uuid).delete()
    
    matches = find_matches_semantic(request, db)
    for match in matches:
        db.add(match)
    
    request.status = "matched" if matches else "no_matches"
    
    db.commit()
    db.refresh(request)
    
    return RequestResponse.from_orm(request)