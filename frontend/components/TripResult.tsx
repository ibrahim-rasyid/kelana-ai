import { getHeroImage } from "@/app/destinationImages";
import { TripInfo } from "@/components/TripInfo";
import { TripRecommendationView } from "@/components/TripRecommendationView";
import type { Trip, TripRecommendation } from "@/types/trip";

export function TripResult({
    trip,
    recommendation,
}: {
    trip: Trip;
    recommendation: TripRecommendation | null;
}) {
    return (
        <div>
            <header
                className="mb-6 flex h-48 flex-col items-center justify-center rounded-lg bg-cover bg-center px-6 text-center sm:h-56"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url('${getHeroImage(trip.destination)}')`,
                }}
            >
                <h1 className="mb-1 text-2xl font-bold text-white sm:text-3xl">
                    {trip.destination}
                </h1>
                <p className="max-w-md text-sm text-white/90">
                    Your AI-powered trip plan
                </p>
            </header>

            <div className="mb-8 rounded-lg border border-black/10 bg-white p-4">
                <TripInfo trip={trip} />
            </div>

            {recommendation ? (
                <TripRecommendationView recommendation={recommendation} />
            ) : (
                <p className="text-black/60">No AI recommendation generated yet.</p>
            )}
        </div>
    );
}