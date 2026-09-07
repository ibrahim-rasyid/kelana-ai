from dotenv import load_dotenv
import boto3
import os

from services.bedrock_service import get_bedrock_client, MODEL_ID

load_dotenv()

KNOWLEDGE_BASE_ID = os.getenv("KNOWLEDGE_BASE_ID")
AWS_REGION = os.getenv("AWS_REGION")

kb_client = boto3.client("bedrock-agent-runtime", region_name=AWS_REGION)

ASSISTANT_PROMPT = (
    "You are a helpful travel assistant. Answer the traveler's question using ONLY "
    "the context below. If the context doesn't contain the answer, say you don't know.\n\n"
    "Context:\n{context}\n\n"
    "Question: {query}\n\n"
    "Answer concisely."
)

def ask_knowledge_base(query: str) -> dict:
    retrieval = kb_client.retrieve(
        knowledgeBaseId=KNOWLEDGE_BASE_ID,
        retrievalQuery={"text": query},
        retrievalConfiguration={"managedSearchConfiguration": {"numberOfResults": 3}},
    )
    results = retrieval.get("retrievalResults") or []

    if not results:
        return {
            "answer": "I couldn't find anything about that in the travel documents.",
            "source": None,
        }

    context = "\n\n".join(
        r["content"]["text"] for r in results if r.get("content", {}).get("text")
    )

    source = results[0].get("documentId")
    if source and source.startswith("s3://"):
        source = source.split("/", 3)[-1]

    prompt = ASSISTANT_PROMPT.format(context=context, query=query)

    llm_client = get_bedrock_client()
    response = llm_client.converse(
        modelId=MODEL_ID,
        messages=[{"role": "user", "content": [{"text": prompt}]}],
    )
    output_message = response["output"]["message"]
    answer = "\n".join(
        block["text"] for block in output_message["content"] if "text" in block
    )

    return {"answer": answer, "source": source}
