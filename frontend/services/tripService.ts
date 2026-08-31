import type { Trip } from "@/types/trip";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class UnauthorizedError extends Error {
    constructor() {
        super("Unauthorized");
        this.name = "UnauthorizedError";
    }
}

export async function getTrips(token: string): Promise<Trip[]> {
    const res = await fetch(`${API_URL}/trips`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
        throw new UnauthorizedError();
    }
    if (!res.ok) {
        throw new Error(`Failed to fetch trips: ${res.status}`);
    }
    return res.json();
}

export async function getTripById(tripId: number): Promise<Trip | null> {
    const res = await fetch(`${API_URL}/trips/${tripId}`);
    if (res.status === 404) {
        return null;
    }
    if (!res.ok) {
        throw new Error(`Failed to fetch trip ${tripId}: ${res.status}`);
    }
    return res.json();
}

export async function generateTrip(data: any) {
    const res = await fetch(`${API_URL}/trips/generate`, {
        method: "POST",
        body: JSON.stringify(data)
    })
    return res.json();
}
