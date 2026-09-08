"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TripResult } from "@/components/TripResult";
import { getTripById, UnauthorizedError } from "@/services/tripService";
import { useAuth } from "@/components/AuthContext";
import type { Trip, TripRecommendation } from "@/types/trip";

export default function TripDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { token, isInitialized, logout } = useAuth();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [notFound, setNotFound] = useState(false);
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
                const data = await getTripById(Number(id), token);
                if (cancelled) return;
                if (data === null) {
                    setNotFound(true);
                } else {
                    setTrip(data);
                }
                setLoading(false);
            } catch (err) {
                if (cancelled) return;
                if (err instanceof UnauthorizedError) {
                    logout();
                    return;
                }
                setError(err instanceof Error ? err.message : "Failed to load trip");
                setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [isInitialized, token, id, router, logout]);

    if (!isInitialized || token === null) {
        return null;
    }

    let recommendation: TripRecommendation | null = null;
    if (trip?.ai_recommendation) {
        try {
            recommendation = JSON.parse(trip.ai_recommendation);
        } catch {
            recommendation = null;
        }
    }

    return (
        <div className="mx-auto max-w-3xl px-6 py-10">
            <Link href="/trips" className="mb-6 inline-block text-sm text-black/60 hover:text-black">
                &larr; Back to trips
            </Link>

            {loading ? (
                <p className="text-black/60">Loading trip...</p>
            ) : error ? (
                <div className="rounded-lg border border-black/10 bg-white p-6 text-center text-red-600">
                    {error}
                </div>
            ) : notFound || !trip ? (
                <div className="rounded-lg border border-black/10 bg-white p-6 text-center text-black/60">
                    Trip not found.
                </div>
            ) : (
                <TripResult trip={trip} recommendation={recommendation} />
            )}
        </div>
    );
}
