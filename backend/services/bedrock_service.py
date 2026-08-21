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
    "Travel Style: {travel_style}.\n"
    "Make sure you have these in your response:\n"
    "Daily Itinerary\n"
    "Estimated Daily Budget\n"
    "Local Food Recommendations\n"
    "Transportation Suggestions.\n"
    "Format your response as Markdown with headers (##) and bullet lists (-)"
)

def get_bedrock_client():
    if not AWS_BEARER_TOKEN_BEDROCK:
        raise ValueError(
            "AWS_BEARER_TOKEN is not set"
        )
    client = boto3.client(
        service_name='bedrock-runtime',
        region_name=AWS_REGION
    )
    return client

def get_ai_recommendation(
    destination : str,
    days        : int,
    budget      : float,
    travel_style: str
) -> str:
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

    return "\n".join(text_parts)

if __name__ == "__main__":
    response = get_ai_recommendation("Japan", 5, 1500, "Family")
    print(response)
