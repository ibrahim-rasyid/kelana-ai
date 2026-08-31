"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { TripListing } from "@/components/TripListing";
import { getTrips, UnauthorizedError } from "@/services/tripService";
import type { Trip } from "@/types/trip";

export default function TripsPage() {
    const router = useRouter();
    const { token, isInitialized, logout } = useAuth();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isInitialized) return;

        if (token === null) {
            router.replace("/login");
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const data = await getTrips(token);
                if (!cancelled) {
                    setTrips(data);
                    setLoading(false);
                }
            } catch (err) {
                if (cancelled) return;
                if (err instanceof UnauthorizedError) {
                    logout();
                    return;
                }
                setError(err instanceof Error ? err.message : "Failed to load trips");
                setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [isInitialized, token, router, logout]);

    if (!isInitialized || token === null) {
        return null;
    }

    return (
        <div className="mx-auto max-w-3xl px-6 py-10">
            <h1 className="mb-6 text-2xl font-semibold">Trips</h1>

            {loading ? (
                <p className="text-black/60">Loading trips...</p>
            ) : error ? (
                <div className="rounded-lg border border-black/10 bg-white p-6 text-center text-red-600">
                    {error}
                </div>
            ) : trips.length === 0 ? (
                <div className="flex flex-col items-center gap-4 rounded-lg border border-black/10 bg-white p-10 text-center">
                    <p className="text-black/60">
                        You haven&apos;t generated any trips yet.
                    </p>
                    <Link
                        href="/generate"
                        className="rounded-md bg-[#4a7dbe] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3a6ba8]"
                    >
                        Generate a Trip
                    </Link>
                </div>
            ) : (
                <TripListing trips={trips} />
            )}
        </div>
    );
}
