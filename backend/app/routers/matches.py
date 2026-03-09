from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from ..database import get_db
from ..models import Match, Request
from ..schemas import MatchResponse

router = APIRouter(prefix="/api/matches", tags=["matches"])

@router.post("/{match_id}/accept")
async def accept_match(match_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Accept a match.
    Goes directly from 'notified' to 'accepted'
    """
    match = db.query(Match).filter(Match.id == match_id).first()
    
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Can only accept if status is 'notified'
    if match.status != 'notified':
        raise HTTPException(
            status_code=400,
            detail=f"Cannot accept match with status '{match.status}'"
        )
    
    # Get the request
    request = db.query(Request).filter(Request.id == match.request_id).first()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Check if request already accepted by someone else
    if request.status == 'matched':
        raise HTTPException(
            status_code=400,
            detail="This request has already been accepted by another helper"
        )
    
    # Update match status
    match.status = 'accepted'
    
    # Update request
    request.status = 'matched'
    request.accepted_at = datetime.now()
    
    if match.helper_type == 'volunteer':
        request.accepted_by_volunteer_id = match.volunteer_id
    else:
        request.accepted_by_organization_id = match.organization_id
    
    # Decline all other matches for this request
    other_matches = db.query(Match).filter(
        Match.request_id == match.request_id,
        Match.id != match.id,
        Match.status == 'notified'
    ).all()
    
    for other_match in other_matches:
        other_match.status = 'declined'
    
    db.commit()
    db.refresh(match)
    db.refresh(request)
    
    return {
        "message": "Match accepted successfully",
        "match": match,
        "request": request
    }

@router.post("/{match_id}/decline")
async def decline_match(match_id: uuid.UUID, db: Session = Depends(get_db)):
    """Decline a match"""
    match = db.query(Match).filter(Match.id == match_id).first()
    
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if match.status != 'notified':
        raise HTTPException(
            status_code=400,
            detail=f"Cannot decline match with status '{match.status}'"
        )
    
    match.status = 'declined'
    db.commit()
    db.refresh(match)
    
    return {"message": "Match declined", "match": match}