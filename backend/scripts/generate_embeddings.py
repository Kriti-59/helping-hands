"""
Script to generate embeddings
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import engine
from app.services.embedding_service import generate_volunteer_embedding, generate_organization_embedding
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def generate_volunteer_embeddings():
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT id, name, email, bio, categories, 
                   availability_notes, radius_miles, address,
                   skills_experience, has_vehicle, can_lift_heavy, languages
            FROM volunteers
            WHERE bio_embedding IS NULL
        """))
        
        volunteers = result.fetchall()
        logger.info(f"Found {len(volunteers)} volunteers without embeddings")
        
        for i, vol in enumerate(volunteers, 1):
            try:
                vol_id, name, email, bio, categories, avail_notes, radius, address, \
                skills_experience, has_vehicle, can_lift_heavy, languages = vol
                
                logger.info(f"[{i}/{len(volunteers)}] Processing: {name}")
                
                class VolunteerData:
                    pass
                
                volunteer = VolunteerData()
                volunteer.name = name
                volunteer.bio = bio
                volunteer.categories = categories
                volunteer.availability_notes = avail_notes
                volunteer.radius_miles = radius
                volunteer.address = address
                volunteer.skills_experience = skills_experience
                volunteer.has_vehicle = has_vehicle
                volunteer.can_lift_heavy = can_lift_heavy
                volunteer.languages = languages
                
                embedding = generate_volunteer_embedding(volunteer)
                embedding_str = '[' + ','.join(map(str, embedding)) + ']'
                conn.execute(
                    text("UPDATE volunteers SET bio_embedding = :embedding WHERE id = :id"),
                    {"embedding": embedding_str, "id": vol_id}
                )
              
                conn.commit()
                logger.info(f"  ✓ Saved embedding\n")
                
            except Exception as e:
                conn.rollback()
                logger.error(f"  ✗ Failed for {name}: {e}\n")


def generate_organization_embeddings():
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT id, name, email, bio, categories, 
                   service_area, organization_hours
            FROM organizations
            WHERE bio_embedding IS NULL
        """))
        
        organizations = result.fetchall()
        logger.info(f"Found {len(organizations)} organizations without embeddings")
        
        for i, org in enumerate(organizations, 1):
            try:
                org_id, name, email, bio, categories, service_area, hours = org
                logger.info(f"[{i}/{len(organizations)}] Processing: {name}")
                
                class OrgData:
                    pass
                
                organization = OrgData()
                organization.name = name
                organization.bio = bio
                organization.categories = categories
                organization.service_area = service_area
                organization.organization_hours = hours
                
                embedding = generate_organization_embedding(organization)
                embedding_str = '[' + ','.join(map(str, embedding)) + ']'
                conn.execute(
                    text("UPDATE organizations SET bio_embedding = :embedding WHERE id = :id"),
                    {"embedding": embedding_str, "id": org_id}
                )

                conn.commit()
                logger.info(f"  ✓ Saved embedding\n")
                
            except Exception as e:
                conn.rollback()
                logger.error(f"  ✗ Failed for {organization.name}: {e}\n")


if __name__ == "__main__":
    
    print("Step 1: Generating volunteer embeddings...")
    generate_volunteer_embeddings()
    
    print("\nStep 2: Generating organization embeddings...")
    generate_organization_embeddings()
    
    print("\n✓ ALL EMBEDDINGS GENERATED SUCCESSFULLY!")