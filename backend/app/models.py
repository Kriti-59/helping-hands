from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, Numeric, ForeignKey, ARRAY, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from .database import Base
import uuid


class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    requests = relationship("Request", back_populates="user")


class Volunteer(Base):
    __tablename__ = "volunteers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String)
    phone = Column(String, nullable=False)
    bio = Column(Text)
    categories = Column(ARRAY(String))
    skills_experience = Column(Text)
    has_vehicle = Column(Boolean, default=False)
    can_lift_heavy = Column(Boolean, default=False)
    languages = Column(ARRAY(String))
    latitude = Column(Numeric(10, 7))
    longitude = Column(Numeric(10, 7))
    address = Column(String)
    radius_miles = Column(Integer)
    availability_notes = Column(Text)
    is_active = Column(Boolean, default=True)
    bio_embedding = Column(Vector(3072))    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Organization(Base):
    __tablename__ = "organizations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String)
    phone = Column(String)
    bio = Column(Text)
    categories = Column(ARRAY(String))
    latitude = Column(Numeric(10, 7), nullable=True)
    longitude = Column(Numeric(10, 7), nullable=True)
    address = Column(String, nullable=True)
    service_area = Column(String)
    organization_hours = Column(String)
    website_url = Column(String)
    is_active = Column(Boolean, default=True)
    bio_embedding = Column(Vector(3072))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Request(Base):
    __tablename__ = "requests"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    requester_name = Column(String, nullable=False)
    requester_email = Column(String, nullable=False)
    requester_phone = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    latitude = Column(Numeric(10, 7), nullable=False)
    longitude = Column(Numeric(10, 7), nullable=False)
    address = Column(String, nullable=True)
    category = Column(String, nullable=False)
    routing_type = Column(String, nullable=False)
    urgency = Column(String, nullable=False)
    status = Column(String, default="pending")
    accepted_by_volunteer_id = Column(UUID(as_uuid=True), ForeignKey('volunteers.id'), nullable=True)
    accepted_by_organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id'), nullable=True)
    accepted_at = Column(DateTime(timezone=True), nullable=True)
    description_embedding = Column(Vector(3072)) 
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", back_populates="requests")
    matches = relationship("Match", back_populates="request")


class Match(Base):
    __tablename__ = "matches"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_id = Column(UUID(as_uuid=True), ForeignKey('requests.id'), nullable=False)
    helper_type = Column(String, nullable=False)
    volunteer_id = Column(UUID(as_uuid=True), ForeignKey('volunteers.id'), nullable=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id'), nullable=True)
    status = Column(String, default="notified")
    distance_miles = Column(Numeric(10, 2), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    request = relationship("Request", back_populates="matches")