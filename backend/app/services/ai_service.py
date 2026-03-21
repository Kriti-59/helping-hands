import json
from groq import Groq
from ..config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

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
    last_error = None

    prompt = f"""Classify this community help request. Return ONLY valid JSON, nothing else.

REQUEST: "{description}"

LOCAL categories (nearby volunteers): groceries, dog_walking, transportation, yard_work, moving_help, childcare, tutoring, elderly_care, home_repairs, meal_preparation, cleaning, technology_help, errands, language_practice, companionship

BROAD categories (organizations): legal_immigration, legal_housing, medical_advice, mental_health, job_placement

URGENCY: high = today/urgent/ASAP, medium = this week, low = flexible

Return this exact JSON structure:
{{
    "category": "one of the exact category names above",
    "routing_type": "local or broad",
    "urgency": "low, medium, or high",
    "reasoning": "brief explanation"
}}"""

    for attempt in range(retries):
        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0.1
            )

            result = json.loads(response.choices[0].message.content)

            # Validate category
            if result.get("category") not in ALL_CATEGORIES:
                raise ValueError(f"Invalid category: {result.get('category')}")

            # Ensure routing_type is consistent with category
            result["routing_type"] = "broad" if result["category"] in CATEGORIES["broad"] else "local"

            # Validate urgency
            if result.get("urgency") not in ["low", "medium", "high"]:
                result["urgency"] = "medium"

            print(f"✓ Groq AI (attempt {attempt + 1}): {result}")
            return result

        except Exception as e:
            last_error = e
            print(f"❌ Classification attempt {attempt + 1} failed: {e}")

    raise Exception("We couldn't find helpers for your request right now. Please try again in a moment.")