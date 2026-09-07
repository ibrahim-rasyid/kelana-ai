import type { AskResponse } from "@/types/assistant";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function askQuestion(query: string): Promise<AskResponse> {
    const res = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
    });
    if (!res.ok) {
        throw new Error(`Failed to get an answer: ${res.status}`);
    }
    return res.json();
}
