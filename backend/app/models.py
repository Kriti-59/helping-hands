from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, DECIMAL, CheckConstraint, Index, ARRAY, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from passlib.context import CryptContext

import uuid

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))
    
    # Relationships
    requests = relationship("Request", back_populates="user")

    def __repr__(self):
        return f"<User(name={self.name}, email={self.email})>"
    
# ============================================
# VOLUNTEERS Model
# ============================================
class Volunteer(Base):
    __tablename__ = "volunteers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(50))
    bio = Column(Text)
    categories = Column(ARRAY(Text), nullable=False)
    
    # Location
    latitude = Column(DECIMAL(10, 8), nullable=False)
    longitude = Column(DECIMAL(11, 8), nullable=False)
    address = Column(Text)
    
    # Volunteer-specific
    radius_miles = Column(Integer, nullable=False)
    availability_notes = Column(Text)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    matches = relationship("Match", back_populates="volunteer", foreign_keys="Match.volunteer_id")
    accepted_requests = relationship("Request", back_populates="accepted_volunteer", foreign_keys="Request.accepted_by_volunteer_id")

    def __repr__(self):
        return f"<Volunteer(name={self.name}, email={self.email})>"


# ============================================
# ORGANIZATIONS Model
# ============================================

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(50))
    bio = Column(Text)
    categories = Column(ARRAY(Text), nullable=False)
    
    # Location (optional for organizations)
    latitude = Column(DECIMAL(10, 8))
    longitude = Column(DECIMAL(11, 8))
    address = Column(Text)
    
    # Organization-specific
    service_area = Column(String(255))
    organization_hours = Column(Text)
    website_url = Column(String(500))
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    matches = relationship("Match", back_populates="organization", foreign_keys="Match.organization_id")
    accepted_requests = relationship("Request", back_populates="accepted_organization", foreign_keys="Request.accepted_by_organization_id")

    def __repr__(self):
        return f"<Organization(name={self.name}, email={self.email})>"


# ============================================
# REQUESTS Model
# ============================================

class Request(Base):
    __tablename__ = "requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)

    # Requester info
    requester_name = Column(String(255), nullable=False)
    requester_email = Column(String(255), nullable=False)
    requester_phone = Column(String(50))
    
    # Request details
    description = Column(Text, nullable=False)
    latitude = Column(DECIMAL(10, 8), nullable=False)
    longitude = Column(DECIMAL(11, 8), nullable=False)
    address = Column(Text)
    
    # AI-determined classification
    category = Column(String(50), nullable=False)
    routing_type = Column(String(20), nullable=False)
    urgency = Column(String(20), nullable=False)
    
    # Status
    status = Column(String(50), default='pending')
    
    # Acceptance tracking
    accepted_by_volunteer_id = Column(UUID(as_uuid=True), ForeignKey('volunteers.id', ondelete='SET NULL'))
    accepted_by_organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id', ondelete='SET NULL'))
    accepted_at = Column(DateTime(timezone=True))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    matches = relationship("Match", back_populates="request", cascade="all, delete-orphan")
    accepted_volunteer = relationship("Volunteer", back_populates="accepted_requests", foreign_keys=[accepted_by_volunteer_id])
    accepted_organization = relationship("Organization", back_populates="accepted_requests", foreign_keys=[accepted_by_organization_id])
    user = relationship("User", back_populates="requests")
    
    # Constraints
    __table_args__ = (
        CheckConstraint(
            "routing_type IN ('local', 'broad')",
            name='check_routing_type'
        ),
        CheckConstraint(
            "urgency IN ('low', 'medium', 'high')",
            name='check_urgency'
        ),
        CheckConstraint(
            "status IN ('pending', 'matched', 'in_progress', 'completed', 'cancelled', 'no_matches')",
            name='check_status'
        ),
        Index('idx_requests_status', 'status'),
        Index('idx_requests_category', 'category'),
        Index('idx_requests_created_at', 'created_at'),
    )

    def __repr__(self):
        return f"<Request(requester={self.requester_name}, category={self.category}, status={self.status})>"


# ============================================
# MATCHES Model
# ============================================

class Match(Base):
    __tablename__ = "matches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_id = Column(UUID(as_uuid=True), ForeignKey('requests.id', ondelete='CASCADE'), nullable=False)
    
    # Helper type and references
    helper_type = Column(String(20), nullable=False)
    volunteer_id = Column(UUID(as_uuid=True), ForeignKey('volunteers.id', ondelete='CASCADE'))
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id', ondelete='CASCADE'))
    
    # Match status
    status = Column(String(50), default='notified')
    
    # Distance (for local requests)
    distance_miles = Column(DECIMAL(10, 2))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    request = relationship("Request", back_populates="matches")
    volunteer = relationship("Volunteer", back_populates="matches", foreign_keys=[volunteer_id])
    organization = relationship("Organization", back_populates="matches", foreign_keys=[organization_id])
    
    # Constraints
    __table_args__ = (
        CheckConstraint(
            "helper_type IN ('volunteer', 'organization')",
            name='check_helper_type'
        ),
        CheckConstraint(
            "status IN ('notified', 'viewed', 'accepted', 'declined')",
            name='check_match_status'
        ),
        CheckConstraint(
            "(helper_type = 'volunteer' AND volunteer_id IS NOT NULL AND organization_id IS NULL) OR "
            "(helper_type = 'organization' AND organization_id IS NOT NULL AND volunteer_id IS NULL)",
            name='check_helper_integrity'
        ),
        Index('idx_matches_request', 'request_id'),
        Index('idx_matches_volunteer', 'volunteer_id'),
        Index('idx_matches_organization', 'organization_id'),
        Index('idx_matches_status', 'status'),
    )

    def __repr__(self):
        helper = f"volunteer_id={self.volunteer_id}" if self.helper_type == 'volunteer' else f"organization_id={self.organization_id}"
        return f"<Match(request_id={self.request_id}, {helper}, status={self.status})>"