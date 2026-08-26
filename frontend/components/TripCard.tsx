import Link from "next/link";
import type { Trip } from "@/types/trip";

export function TripCard({ trip }: { trip: Trip }) {
    return (
        <Link
            href={`/trips/${trip.id}`}
            className="block rounded-lg border border-black/10 p-4 transition-colors hover:border-black/30 hover:bg-black/[.03]"
        >
            <h3 className="text-lg font-semibold">{trip.destination}</h3>
            <p className="text-sm text-black/60">
                {trip.days} days &middot; ${trip.budget} &middot; {trip.category}
            </p>
        </Link>
    );
}
