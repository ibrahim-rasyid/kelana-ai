import Link from "next/link";
import { TripListing } from "@/components/TripListing";
import { getTrips } from "@/services/tripService";

export default async function TripsPage() {
    const trips = await getTrips();

    return (
        <div className="mx-auto max-w-3xl px-6 py-10">
            <h1 className="mb-6 text-2xl font-semibold">Trips</h1>

            {trips.length === 0 ? (
                <div className="flex flex-col items-center gap-4 rounded-lg border border-black/10 bg-white p-10 text-center">
                    <p className="text-black/60">
                        You haven&apos;t generated any trips yet.
                    </p>
                    <Link
                        href="/"
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
