import Image from "next/image";
import Link from "next/link";
import { getHeroImage } from "@/app/destinationImages";
import type { Trip } from "@/types/trip";

const CATEGORY_BADGE_CLASSES: Record<string, string> = {
    Backpacker: "bg-green-100 text-green-800",
    Standard: "bg-blue-100 text-blue-800",
    Luxury: "bg-amber-100 text-amber-800",
};

export function TripCard({ trip }: { trip: Trip }) {
    const categoryClass =
        CATEGORY_BADGE_CLASSES[trip.category] ?? "bg-black/10 text-black/70";

    return (
        <Link
            href={`/trips/${trip.id}`}
            className="flex items-center gap-4 rounded-lg border border-black/10 p-4 transition-colors hover:border-black/30 hover:bg-black/[.03]"
        >
            <Image
                src={getHeroImage(trip.destination)}
                alt={trip.destination}
                width={56}
                height={56}
                className="h-14 w-14 shrink-0 rounded-full object-cover"
            />

            <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-semibold">{trip.destination}</h3>
                <p className="text-sm text-black/60">
                    {trip.days} days &middot; ${trip.budget}
                </p>
            </div>

            <div className="flex shrink-0 flex-wrap justify-end gap-2">
                <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${categoryClass}`}
                >
                    {trip.category}
                </span>
                <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-medium text-black/70">
                    {trip.travel_style}
                </span>
            </div>
        </Link>
    );
}