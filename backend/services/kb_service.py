from dotenv import load_dotenv
import boto3
import os

load_dotenv()

KNOWLEDGE_BASE_ID = os.getenv("KNOWLEDGE_BASE_ID")
AWS_REGION = os.getenv("AWS_REGION")

kb_client = boto3.client("bedrock-agent-runtime", region_name=AWS_REGION)

def retrieve_context(query: str, num_results: int = 3) -> dict:
    retrieval = kb_client.retrieve(
        knowledgeBaseId=KNOWLEDGE_BASE_ID,
        retrievalQuery={"text": query},
        retrievalConfiguration={"managedSearchConfiguration": {"numberOfResults": num_results}},
    )
    results = retrieval.get("retrievalResults") or []

    if not results:
        return {"context": None, "source": None}

    context = "\n\n".join(
        r["content"]["text"] for r in results if r.get("content", {}).get("text")
    )

    source = results[0].get("documentId")
    if source and source.startswith("s3://"):
        source = source.split("/", 3)[-1]

    return {"context": context, "source": source}
