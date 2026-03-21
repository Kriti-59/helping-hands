"""
Semantic matching service using vector similarity search.
Finds the best helpers based on meaning similarity, not just categories.
"""

from sqlalchemy.orm import Session
from sqlalchemy import text
from ..models import Volunteer, Organization, Request, Match
from decimal import Decimal
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def calculate_distance(lat1: Decimal, lon1: Decimal, lat2: Decimal, lon2: Decimal) -> float:
    from math import radians, sin, cos, sqrt, atan2
    
    R = 3959
    lat1, lon1, lat2, lon2 = map(float, [lat1, lon1, lat2, lon2])
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    
    return R * c


def find_matches_semantic(request: Request, db: Session) -> list[Match]:
    matches = []
    
    if request.description_embedding is None:
        logger.error(f"Request {request.id} has no embedding! Cannot perform semantic matching.")
        return matches
    
    logger.info(f"\n{'='*60}")
    logger.info(f"SEMANTIC MATCHING for request: {request.description[:50]}...")
    logger.info(f"Category: {request.category}")
    logger.info(f"Routing: {request.routing_type}")
    logger.info(f"{'='*60}\n")
    
    embedding_str = '[' + ','.join(map(str, request.description_embedding)) + ']'

   
    if request.routing_type == "local":
        logger.info("🔍 Searching for LOCAL volunteers using semantic matching...")
        
        query = text(f"""
            SELECT 
                id,
                name,
                email,
                phone,
                bio,
                latitude,
                longitude,
                address,
                radius_miles,
                1 - (bio_embedding <=> '{embedding_str}'::vector) as similarity
            FROM volunteers
            WHERE 
                is_active = true
                AND bio_embedding IS NOT NULL
                AND :category = ANY(categories)
            ORDER BY bio_embedding <=> '{embedding_str}'::vector
            LIMIT 20
        """)
        
        result = db.execute(query, {"category": request.category})
        volunteers = result.fetchall()
        
        logger.info(f"Found {len(volunteers)} volunteers in category (checking distance...)\n")
        
        for vol in volunteers:
            vol_id, name, email, phone, bio, lat, lon, address, radius_miles, similarity = vol
            
            if request.latitude and request.longitude and lat and lon:
                distance = calculate_distance(
                    request.latitude, request.longitude,
                    lat, lon
                )
            else:
                distance = None
            
            radius = radius_miles if radius_miles else 10
            
            if distance and distance <= radius:
                similarity_percent = round(similarity * 100, 1)
                logger.info(f"✓ MATCH: {name}")
                logger.info(f"  Similarity: {similarity_percent}%")
                logger.info(f"  Distance: {distance:.1f} miles (within {radius} mile radius)")
                logger.info(f"  Bio: {bio[:100] if bio else 'No bio'}...\n")
                
                match = Match(
                    request_id=request.id,
                    helper_type="volunteer",
                    volunteer_id=vol_id,
                    status="notified",
                    distance_miles=Decimal(str(round(distance, 2)))
                )
                matches.append(match)
            else:
                if distance:
                    logger.info(f"✗ Skip: {name} - {distance:.1f} miles (outside {radius} mile radius)")
                else:
                    logger.info(f"✗ Skip: {name} - no location data")

    else:
        logger.info("🔍 Searching for ORGANIZATIONS using semantic matching...")
        
        query = text(f"""
            SELECT 
                id,
                name,
                email,
                phone,
                bio,
                service_area,
                1 - (bio_embedding <=> '{embedding_str}'::vector) as similarity
            FROM organizations
            WHERE 
                is_active = true
                AND bio_embedding IS NOT NULL
                AND :category = ANY(categories)
            ORDER BY bio_embedding <=> '{embedding_str}'::vector
            LIMIT 10
        """)
        
        result = db.execute(query, {"category": request.category})
        organizations = result.fetchall()
        
        logger.info(f"Found {len(organizations)} organizations in category\n")
        
        for org in organizations:
            org_id, name, email, phone, bio, service_area, similarity = org
            
            similarity_percent = round(similarity * 100, 1)
            logger.info(f"✓ MATCH: {name}")
            logger.info(f"  Similarity: {similarity_percent}%")
            logger.info(f"  Service Area: {service_area or 'National'}")
            logger.info(f"  Bio: {bio[:100] if bio else 'No bio'}...\n")
            logger.info(f"  Raw similarity: {similarity}")
            logger.info(f"Embedding type: {type(request.description_embedding)}")
            logger.info(f"Embedding sample: {str(request.description_embedding)[:100]}")
            
            match = Match(
                request_id=request.id,
                helper_type="organization",
                organization_id=org_id,
                status="notified",
                distance_miles=None
            )
            matches.append(match)
    
    logger.info(f"{'='*60}")
    logger.info(f"✓ Created {len(matches)} matches using SEMANTIC SIMILARITY")
    logger.info(f"{'='*60}\n")
    
    return matches