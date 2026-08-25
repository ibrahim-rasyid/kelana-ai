from dotenv import load_dotenv
import boto3
import os

load_dotenv()

AWS_BEARER_TOKEN_BEDROCK = os.getenv("AWS_BEARER_TOKEN_BEDROCK")
AWS_REGION = os.getenv("AWS_REGION")
MODEL_ID = os.getenv("MODEL_ID")

TRAVEL_PLANNER_PROMPT = (
    "You are an experienced travel planner.\n"
    "Plan a {days}-day itinerary for {destination} with details below:\n"
    "Budget: USD {budget}\n"
    "Travel Style: {travel_style}.\n\n"
    "IMPORTANT: Return ONLY a valid JSON object with the following structure:\n\n"
    "{{\n"
    '  "destination": "{destination}",\n'
    '  "total_days": {days},\n'
    '  "total_budget": {budget},\n'
    '  "travel_style": "{travel_style}",\n'
    '  "daily_itinerary": [\n'
    "    {{\n"
    '      "day": 1,\n'
    '      "title": "Day 1: Arrival and Exploration",\n'
    '      "morning": {{\n'
    '        "activities": ["Activity 1", "Activity 2", "Activity 3"],\n'
    '        "description": "Brief description of morning activities"\n'
    "      }},\n"
    '      "afternoon": {{\n'
    '        "activities": ["Cultural site 1", "Experience 1"],\n'
    '        "description": "Focus on cultural sites and unique experiences"\n'
    "      }},\n"
    '      "evening": {{\n'
    '        "activities": ["Dinner spot", "Nightlife activity"],\n'
    '        "description": "Relaxing evening activities"\n'
    "      }},\n"
    '      "estimated_cost": 150\n'
    "    }}\n"
    "  ],\n"
    '  "travel_tips": [\n'
    '    "Tip 1: Important safety or cultural tip",\n'
    '    "Tip 2: Best time to visit attractions",\n'
    '    "Tip 3: Local customs to be aware of",\n'
    '    "Tip 4: Money-saving advice"\n'
    "  ],\n"
    '  "local_food_recommendations": [\n'
    "    {{\n"
    '      "name": "Dish name",\n'
    '      "description": "Brief description of the dish",\n'
    '      "where_to_try": "Restaurant or area recommendation",\n'
    '      "estimated_cost": 15\n'
    "    }}\n"
    "  ],\n"
    '  "budget_breakdown": {{\n'
    '    "accommodation": 500,\n'
    '    "food": 300,\n'
    '    "transportation": 200,\n'
    '    "activities": 400,\n'
    '    "shopping": 100,\n'
    '    "miscellaneous": 100,\n'
    '    "total": 1600\n'
    "  }}\n"
    "}}\n\n"
    "Guidelines:\n"
    "- Create exactly {days} days in the daily_itinerary array\n"
    "- Each day should have 2-3 morning activities, 2 afternoon activities focusing on culture, and 2 evening activities\n"
    "- Provide at least 4 travel tips\n"
    "- Recommend at least 5 local food dishes\n"
    "- Ensure budget_breakdown adds up to approximately the total budget of {budget}\n"
    "- Return ONLY the JSON object, no additional text or markdown formatting"
)

# Reuse the same client across requests
_bedrock_client = None

def get_bedrock_client():
    global _bedrock_client
    if _bedrock_client is None:
        if not AWS_BEARER_TOKEN_BEDROCK:
            raise ValueError(
                "AWS_BEARER_TOKEN is not set"
            )
        _bedrock_client = boto3.client(
            service_name='bedrock-runtime',
            region_name=AWS_REGION
        )
    return _bedrock_client

def get_ai_recommendation(
    destination : str,
    days        : int,
    budget      : float,
    travel_style: str
) -> dict:
    prompt = TRAVEL_PLANNER_PROMPT.format(
        days=days,
        destination=destination,
        budget=budget,
        travel_style=travel_style
    )

    client = get_bedrock_client()

    response = client.converse(
        modelId=MODEL_ID,
        messages=[
            {
                "role": "user",
                "content": [{"text": prompt}]
            }
        ]
    )

    output_message = response["output"]["message"]
    text_parts = [
        block["text"] for block in output_message["content"] if "text" in block
    ]

    response_text = "\n".join(text_parts)
    
    # Parse the JSON response
    import json
    try:
        # Try to extract JSON if there's any extra text
        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}') + 1
        if start_idx != -1 and end_idx > start_idx:
            json_str = response_text[start_idx:end_idx]
            return json.loads(json_str)
        else:
            return json.loads(response_text)
    except json.JSONDecodeError as e:
        # If parsing fails, return the raw text in a structured format
        return {
            "error": "Failed to parse AI response",
            "raw_response": response_text,
            "parse_error": str(e)
        }

if __name__ == "__main__":
    response = get_ai_recommendation("Japan", 5, 1500, "Family")
    print(response)
