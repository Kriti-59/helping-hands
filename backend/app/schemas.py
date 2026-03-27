from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
import uuid


# User schemas
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserWithRequests(UserResponse):
    requests: List['RequestResponse'] = []

    class Config:
        from_attributes = True


# Update MatchUpdate validator
class MatchUpdate(BaseModel):
    status: str

    @validator('status')
    def validate_status(cls, v):
        if v not in ['notified', 'accepted', 'declined']:
            raise ValueError("status must be 'notified', 'accepted', or 'declined'")
        return v
    
class RequestCreate(BaseModel):
    """Schema for users creating requests"""
    description: str
    address: Optional[str] = None
    requester_phone: str
    latitude: Decimal
    longitude: Decimal
    estimated_duration: Optional[int] = None
    requires_heavy_lifting: bool = False
    accessibility_requirements: Optional[str] = None
    flexibility_level: str = "flexible"

# Add schemas for contact info privacy
class RequestPublicResponse(BaseModel):
    """Request visible BEFORE acceptance (no contact info)"""
    id: uuid.UUID
    requester_name: str
    description: str
    latitude: Decimal
    longitude: Decimal
    address: Optional[str]
    category: str
    routing_type: str
    urgency: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class RequestPrivateResponse(RequestPublicResponse):
    """Request visible AFTER acceptance (with contact info)"""
    requester_email: str
    requester_phone: Optional[str]
    
    class Config:
        from_attributes = True

# VOLUNTEER Schemas

class VolunteerCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str
    bio: Optional[str] = None
    address: Optional[str] = None
    latitude: float = 39.0997
    longitude: float = -94.5786
    radius_miles: int = 10
    categories: List[str] = []
    skills_experience: Optional[str] = None
    has_vehicle: bool = False
    can_lift_heavy: bool = False
    languages: List[str] = []

class VolunteerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    categories: Optional[List[str]] = None
    skills_experience: Optional[str] = None
    has_vehicle: Optional[bool] = None
    can_lift_heavy: Optional[bool] = None
    languages: Optional[List[str]] = None
    is_active: Optional[bool] = None

class VolunteerResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    phone: Optional[str] = None
    bio: Optional[str] = None
    categories: List[str]
    skills_experience: Optional[str] = None
    has_vehicle: bool
    can_lift_heavy: bool
    languages: Optional[List[str]] = None
    latitude: Decimal
    longitude: Decimal
    address: Optional[str] = None
    radius_miles: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ============================================
# ORGANIZATION Schemas
# ============================================

class OrganizationCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    bio: Optional[str] = None
    categories: List[str] = []
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    service_area: Optional[str] = None
    organization_hours: Optional[str] = None
    website_url: Optional[str] = None

class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    categories: Optional[List[str]] = None
    service_area: Optional[str] = None
    organization_hours: Optional[str] = None
    website_url: Optional[str] = None
    is_active: Optional[bool] = None

class OrganizationResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    phone: Optional[str] = None
    bio: Optional[str] = None
    categories: List[str]
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    address: Optional[str] = None
    service_area: Optional[str] = None
    organization_hours: Optional[str] = None
    website_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ============================================
# REQUEST Schemas
# ============================================

class RequestBase(BaseModel):
    requester_name: str
    requester_email: EmailStr
    requester_phone: Optional[str] = None
    description: str
    latitude: Decimal
    longitude: Decimal
    address: Optional[str] = None


class RequestResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    requester_name: str
    requester_email: str
    requester_phone: Optional[str] = None
    description: str
    latitude: Decimal
    longitude: Decimal
    address: Optional[str] = None
    category: str
    routing_type: str
    urgency: str
    status: str
    accepted_by_volunteer_id: Optional[uuid.UUID] = None
    accepted_by_organization_id: Optional[uuid.UUID] = None
    accepted_at: Optional[datetime] = None
    estimated_duration: Optional[int] = None
    requires_heavy_lifting: bool = False
    accessibility_requirements: Optional[str] = None
    flexibility_level: str = "flexible"
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class RequestWithMatches(RequestResponse):
    """Request with associated matches"""
    num_matches: int = 0
    matches: List['MatchResponse'] = []

    class Config:
        from_attributes = True


# ============================================
# MATCH Schemas
# ============================================

class MatchBase(BaseModel):
    request_id: uuid.UUID
    helper_type: str
    volunteer_id: Optional[uuid.UUID] = None
    organization_id: Optional[uuid.UUID] = None
    distance_miles: Optional[Decimal] = None

    @validator('helper_type')
    def validate_helper_type(cls, v):
        if v not in ['volunteer', 'organization']:
            raise ValueError("helper_type must be 'volunteer' or 'organization'")
        return v

class MatchCreate(MatchBase):
    pass

class MatchUpdate(BaseModel):
    status: str

    @validator('status')
    def validate_status(cls, v):
        if v not in ['notified', 'viewed', 'accepted', 'declined']:
            raise ValueError("status must be 'notified', 'viewed', 'accepted', or 'declined'")
        return v

class MatchResponse(MatchBase):
    id: uuid.UUID
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MatchWithDetails(MatchResponse):
    """Match with request and helper details"""
    request: Optional[RequestResponse] = None
    volunteer: Optional[VolunteerResponse] = None
    organization: Optional[OrganizationResponse] = None

    class Config:
        from_attributes = True


# ============================================
# AI Classification Schema
# ============================================

class AIClassification(BaseModel):
    category: str
    routing_type: str
    urgency: str
    reasoning: Optional[str] = None

    @validator('routing_type')
    def validate_routing_type(cls, v):
        if v not in ['local', 'broad']:
            raise ValueError("routing_type must be 'local' or 'broad'")
        return v

    @validator('urgency')
    def validate_urgency(cls, v):
        if v not in ['low', 'medium', 'high']:
            raise ValueError("urgency must be 'low', 'medium', or 'high'")
        return v
    


class RequestInMatch(BaseModel):
    """Request details shown in match"""
    id: uuid.UUID
    description: str
    category: str
    urgency: str
    address: Optional[str]
    latitude: Decimal
    longitude: Decimal
    requester_name: str
    requester_email: str
    requester_phone: Optional[str]
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class MatchResponse(BaseModel):
    """Match with embedded request details"""
    id: uuid.UUID
    request_id: uuid.UUID
    helper_type: str
    volunteer_id: Optional[uuid.UUID]
    organization_id: Optional[uuid.UUID]
    status: str
    distance_miles: Optional[Decimal]
    created_at: datetime
    request: RequestInMatch
    
    class Config:
        from_attributes = True

class StatusUpdate(BaseModel):
    status: str