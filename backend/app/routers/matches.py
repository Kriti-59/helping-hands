from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
import uuid
from datetime import datetime

from ..database import get_db
from ..models import Match, Request, Volunteer, Organization
from ..schemas import MatchResponse

router = APIRouter(prefix="/api/matches", tags=["matches"])


@router.get("/volunteer/{volunteer_id}", response_model=List[MatchResponse])
async def get_volunteer_matches(
    volunteer_id: str,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all matches for a specific volunteer.
    Optionally filter by match status (notified, accepted, declined)
    """
    
    try:
        volunteer_uuid = uuid.UUID(volunteer_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid volunteer ID format")
    
    # Check volunteer exists
    volunteer = db.query(Volunteer).filter(Volunteer.id == volunteer_uuid).first()
    if not volunteer:
        raise HTTPException(status_code=404, detail="Volunteer not found")
    
    # Build query
    query = db.query(Match).filter(
        Match.volunteer_id == volunteer_uuid,
        Match.helper_type == "volunteer"
    )
    
    # Filter by status if provided
    if status:
        if status not in ['notified', 'accepted', 'declined']:
            raise HTTPException(
                status_code=400, 
                detail="Invalid status. Must be: notified, accepted, or declined"
            )
        query = query.filter(Match.status == status)
    
    # Get matches with their requests
    matches = query.order_by(Match.created_at.desc()).all()
    
    # Manually load request relationships
    for match in matches:
        if not match.request:
            request = db.query(Request).filter(Request.id == match.request_id).first()
            match.request = request
    
    return matches


@router.get("/organization/{organization_id}", response_model=List[MatchResponse])
async def get_organization_matches(
    organization_id: str,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all matches for a specific organization.
    Optionally filter by match status (notified, accepted, declined)
    """
    
    try:
        org_uuid = uuid.UUID(organization_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid organization ID format")
    
    # Check organization exists
    org = db.query(Organization).filter(Organization.id == org_uuid).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    # Build query
    query = db.query(Match).filter(
        Match.organization_id == org_uuid,
        Match.helper_type == "organization"
    )
    
    # Filter by status if provided
    if status:
        if status not in ['notified', 'accepted', 'declined']:
            raise HTTPException(
                status_code=400,
                detail="Invalid status. Must be: notified, accepted, or declined"
            )
        query = query.filter(Match.status == status)
    
    # Get matches with their requests
    matches = query.order_by(Match.created_at.desc()).all()
    
    # Manually load request relationships
    for match in matches:
        if not match.request:
            request = db.query(Request).filter(Request.id == match.request_id).first()
            match.request = request
    
    return matches


@router.patch("/{match_id}/accept")
async def accept_match(
    match_id: str,
    db: Session = Depends(get_db)
):
    """
    Accept a match request.
    
    This will:
    1. Update match status to "accepted"
    2. Update request status to "in_progress"
    3. Set accepted_by_volunteer_id or accepted_by_organization_id
    4. Decline all other matches for this request
    """
    
    try:
        match_uuid = uuid.UUID(match_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid match ID format")
    
    # Get the match
    match = db.query(Match).filter(Match.id == match_uuid).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Check if already accepted or declined
    if match.status == "accepted":
        raise HTTPException(status_code=400, detail="Match already accepted")
    if match.status == "declined":
        raise HTTPException(status_code=400, detail="Cannot accept a declined match")
    
    # Get the request
    request = db.query(Request).filter(Request.id == match.request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Check if request is already accepted by someone else
    if request.status == "in_progress":
        raise HTTPException(
            status_code=400, 
            detail="This request has already been accepted by another helper"
        )
    
    # Accept the match
    match.status = "accepted"
    
    # Update request
    request.status = "in_progress"
    if match.helper_type == "volunteer":
        request.accepted_by_volunteer_id = match.volunteer_id
    else:
        request.accepted_by_organization_id = match.organization_id
    
    # Decline all other matches for this request
    other_matches = db.query(Match).filter(
        Match.request_id == match.request_id,
        Match.id != match.id,
        Match.status == "notified"
    ).all()
    
    for other_match in other_matches:
        other_match.status = "declined"
    
    db.commit()
    db.refresh(match)
    
    print(f"\n✓ Match accepted!")
    print(f"  Request: {request.description[:50]}...")
    print(f"  Helper: {match.helper_type}")
    print(f"  Auto-declined {len(other_matches)} other matches\n")
    
    return {
        "message": "Match accepted successfully",
        "match_id": str(match.id),
        "request_id": str(request.id)
    }


@router.patch("/{match_id}/decline")
async def decline_match(
    match_id: str,
    db: Session = Depends(get_db)
):
    """
    Decline a match request.
    
    Updates match status to "declined"
    """
    
    try:
        match_uuid = uuid.UUID(match_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid match ID format")
    
    # Get the match
    match = db.query(Match).filter(Match.id == match_uuid).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Check if already accepted or declined
    if match.status == "accepted":
        raise HTTPException(status_code=400, detail="Cannot decline an accepted match")
    if match.status == "declined":
        raise HTTPException(status_code=400, detail="Match already declined")
    
    # Decline the match
    match.status = "declined"
    
    db.commit()
    
    print(f"\n✗ Match declined")
    print(f"  Match ID: {match.id}\n")
    
    return {
        "message": "Match declined successfully",
        "match_id": str(match.id)
    }


@router.get("/request/{request_id}/accepted")
async def get_accepted_helper_info(
    request_id: str,
    db: Session = Depends(get_db)
):
    """
    Get information about the helper who accepted a request.
    Returns volunteer or organization contact information.
    """
    
    try:
        request_uuid = uuid.UUID(request_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid request ID format")
    
    # Get the request
    request = db.query(Request).filter(Request.id == request_uuid).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Check if request is in progress
    if request.status != "in_progress":
        raise HTTPException(status_code=400, detail="Request has not been accepted yet")
    
    # Get the accepted match
    match = db.query(Match).filter(
        Match.request_id == request_uuid,
        Match.status == "accepted"
    ).first()
    
    if not match:
        raise HTTPException(status_code=404, detail="No accepted match found")
    
    # Get helper information
    if match.helper_type == "volunteer":
        volunteer = db.query(Volunteer).filter(Volunteer.id == match.volunteer_id).first()
        if not volunteer:
            raise HTTPException(status_code=404, detail="Volunteer not found")
        
        return {
            "type": "volunteer",
            "name": volunteer.name,
            "email": volunteer.email,
            "phone": volunteer.phone
        }
    else:
        organization = db.query(Organization).filter(
            Organization.id == match.organization_id
        ).first()
        if not organization:
            raise HTTPException(status_code=404, detail="Organization not found")
        
        return {
            "type": "organization",
            "name": organization.name,
            "email": organization.email,
            "phone": organization.phone,
            "website": organization.website_url,
            "hours": organization.organization_hours
        }