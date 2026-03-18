"""
Embedding service using Google Gemini embedding model.
Generates embeddings for semantic search.
"""

from google import genai
from ..config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize Gemini client
client = genai.Client(api_key=settings.API_KEY)


def generate_embedding(text: str) -> list[float]:
    """
    Generate an embedding vector for the given text.
    
    This converts text into a mathematical representation (vector) that
    captures its semantic meaning.
    
    Args:
        text: Input text to embed
        
    Returns:
        List of floats representing the embedding
        
    Raises:
        Exception: If embedding generation fails
    """
    try:
        result = client.models.embed_content(
            model='models/gemini-embedding-001',
            contents=text
        )
        
        embedding = list(result.embeddings[0].values)       
        logger.info(f"✓ Generated embedding (dim: {len(embedding)}) for: {text[:50]}...")
        return embedding
        
    except Exception as e:
        logger.error(f"✗ Failed to generate embedding: {e}")
        raise


def generate_volunteer_embedding(volunteer) -> list[float]:
    """Generate embedding for a volunteer based on their complete profile."""
    categories_text = ", ".join(volunteer.categories) if volunteer.categories else "General help"
    
    profile_text = f"""
    Volunteer Profile:
    Name: {volunteer.name}
    Skills and Categories: {categories_text}
    Bio: {volunteer.bio or "Ready to help"}
    Availability: {volunteer.availability_notes or "Available to help"}
    Service Area: Within {volunteer.radius_miles} miles of {volunteer.address or "their location"}
    """
    
    return generate_embedding(profile_text.strip())


def generate_organization_embedding(organization) -> list[float]:
    """Generate embedding for an organization based on their profile."""
    categories_text = ", ".join(organization.categories) if organization.categories else "General services"
    
    profile_text = f"""
    Organization Profile:
    Name: {organization.name}
    Services: {categories_text}
    Description: {organization.bio or "Providing community services"}
    Service Area: {organization.service_area or "National"}
    Hours: {organization.organization_hours or "Varies"}
    """
    
    return generate_embedding(profile_text.strip())


def generate_request_embedding(description: str, category: str) -> list[float]:
    """Generate embedding for a help request."""
    request_text = f"""
    Help Request:
    Category: {category}
    Description: {description}
    """
    
    return generate_embedding(request_text.strip())