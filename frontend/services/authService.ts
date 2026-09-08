import type { LoginResponse, RegisterResponse, MeResponse } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class UnauthorizedError extends Error {
    constructor() {
        super("Unauthorized");
        this.name = "UnauthorizedError";
    }
}

export async function login(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
        throw new Error(`Failed to login: ${res.status}`);
    }
    return res.json();
}

export async function register(
    username: string,
    email: string,
    password: string
): Promise<RegisterResponse> {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, email, password }),
    });
    if (!res.ok) {
        throw new Error(`Failed to register: ${res.status}`);
    }
    return res.json();
}

export async function getMe(token: string): Promise<MeResponse> {
    const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
        throw new UnauthorizedError();
    }
    if (!res.ok) {
        throw new Error(`Failed to fetch profile: ${res.status}`);
    }
    return res.json();
}
