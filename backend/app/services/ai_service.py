import json
from google import genai
from google.genai import types
from ..config import settings

client = genai.Client(api_key=settings.API_KEY)

CATEGORIES = {
    "local": [
        "groceries", "dog_walking", "transportation", "yard_work", "moving_help",
        "childcare", "tutoring", "elderly_care", "home_repairs", "meal_preparation",
        "cleaning", "technology_help", "errands", "language_practice", "companionship"
    ],
    "broad": [
        "legal_immigration", "legal_housing", "medical_advice", "mental_health", "job_placement"
    ]
}

ALL_CATEGORIES = CATEGORIES["local"] + CATEGORIES["broad"]


def classify_request(description: str, retries: int = 2) -> dict:
    """
    Use Google Gemini AI to classify help requests.
    Retries on failure, raises a clean exception if all attempts fail.
    """
    last_error = None

    for attempt in range(retries):
        try:
            response = client.models.generate_content(
                model='gemini-2.0-flash-lite',
                contents=f"""Classify this community help request.

REQUEST: "{description}"

LOCAL categories (nearby volunteers): groceries, dog_walking, transportation, yard_work, moving_help, childcare, tutoring, elderly_care, home_repairs, meal_preparation, cleaning, technology_help, errands, language_practice, companionship

BROAD categories (organizations): legal_immigration, legal_housing, medical_advice, mental_health, job_placement

URGENCY: high = today/urgent/ASAP, medium = this week, low = flexible""",
                config=types.GenerateContentConfig(
                    response_mime_type='application/json',
                    response_schema={
                        "type": "object",
                        "properties": {
                            "category":     {"type": "string", "enum": ALL_CATEGORIES},
                            "routing_type": {"type": "string", "enum": ["local", "broad"]},
                            "urgency":      {"type": "string", "enum": ["low", "medium", "high"]},
                            "reasoning":    {"type": "string"}
                        },
                        "required": ["category", "routing_type", "urgency", "reasoning"]
                    }
                )
            )

            result = json.loads(response.text)

            # Ensure routing_type is always consistent with the category
            result["routing_type"] = "broad" if result["category"] in CATEGORIES["broad"] else "local"

            print(f"✓ Gemini AI (attempt {attempt + 1}): {result}")
            return result

        except Exception as e:
            last_error = e
            print(f"❌ Classification attempt {attempt + 1} failed: {e}")

    raise Exception(
        f"We couldn't find helpers for your request right now. Please try again in a moment."
    )