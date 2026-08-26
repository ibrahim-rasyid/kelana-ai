import { notFound } from "next/navigation";
import Link from "next/link";
import { TripResult } from "@/components/TripResult";
import { getTripById } from "@/services/tripService";
import type { TripRecommendation } from "@/types/trip";

export default async function TripDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const trip = await getTripById(Number(id));

    if (!trip) {
        notFound();
    }

    let recommendation: TripRecommendation | null = null;
    if (trip.ai_recommendation) {
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

            <TripResult trip={trip} recommendation={recommendation} />
        </div>
    );
}