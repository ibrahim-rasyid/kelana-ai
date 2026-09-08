import type { Trip, TripResponse } from "@/types/trip";

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

export async function getTripById(tripId: number, token: string): Promise<Trip | null> {
    const res = await fetch(`${API_URL}/trips/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 404) {
        return null;
    }
    if (res.status === 401) {
        throw new UnauthorizedError();
    }
    if (!res.ok) {
        throw new Error(`Failed to fetch trip ${tripId}: ${res.status}`);
    }
    return res.json();
}

export interface CreateTripData {
    destination: string;
    days: number;
    budget: number;
    travel_style: "Family" | "Solo" | "Couple" | "Group";
}

export async function createTrip(data: CreateTripData, token: string): Promise<Trip> {
    const res = await fetch(`${API_URL}/trips`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (res.status === 401) {
        throw new UnauthorizedError();
    }
    if (!res.ok) {
        throw new Error(`Failed to create trip: ${res.status}`);
    }
    return res.json();
}

export async function generateTripRecommendation(
    tripId: number,
    token: string
): Promise<TripResponse> {
    const res = await fetch(`${API_URL}/trips/${tripId}/generate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
        throw new UnauthorizedError();
    }
    if (!res.ok) {
        throw new Error(`Failed to generate recommendation: ${res.status}`);
    }
    return res.json();
}
