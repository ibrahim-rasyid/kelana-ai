import type { Conversation, Message, SendMessageResponse } from "@/types/assistant";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class UnauthorizedError extends Error {
    constructor() {
        super("Unauthorized");
        this.name = "UnauthorizedError";
    }
}

export async function listConversations(token: string): Promise<Conversation[]> {
    const res = await fetch(`${API_URL}/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
        throw new UnauthorizedError();
    }
    if (!res.ok) {
        throw new Error(`Failed to fetch conversations: ${res.status}`);
    }
    return res.json();
}

export async function createConversation(token: string): Promise<Conversation> {
    const res = await fetch(`${API_URL}/conversations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
        throw new UnauthorizedError();
    }
    if (!res.ok) {
        throw new Error(`Failed to create conversation: ${res.status}`);
    }
    return res.json();
}

export async function renameConversation(
    token: string,
    conversationId: number,
    title: string
): Promise<Conversation> {
    const res = await fetch(`${API_URL}/conversations/${conversationId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
    });
    if (res.status === 401) {
        throw new UnauthorizedError();
    }
    if (!res.ok) {
        throw new Error(`Failed to rename conversation: ${res.status}`);
    }
    return res.json();
}

export async function getMessages(token: string, conversationId: number): Promise<Message[]> {
    const res = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
        throw new UnauthorizedError();
    }
    if (!res.ok) {
        throw new Error(`Failed to fetch messages: ${res.status}`);
    }
    return res.json();
}

export async function sendMessage(
    token: string,
    conversationId: number,
    content: string
): Promise<SendMessageResponse> {
    const res = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
    });
    if (res.status === 401) {
        throw new UnauthorizedError();
    }
    if (!res.ok) {
        throw new Error(`Failed to send message: ${res.status}`);
    }
    return res.json();
}
