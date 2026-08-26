"use client";

import { useMemo, useState } from "react";
import { TripCard } from "@/components/TripCard";
import type { Trip } from "@/types/trip";

type SortOption = "newest" | "latest" | "budget";

export function TripListing({ trips }: { trips: Trip[] }) {
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortOption>("newest");

    const visibleTrips = useMemo(() => {
        const query = search.trim().toLowerCase();
        const filtered = query
            ? trips.filter(
                  (trip) =>
                      trip.destination.toLowerCase().includes(query) ||
                      trip.travel_style.toLowerCase().includes(query)
              )
            : trips;

        const sorted = [...filtered];
        if (sort === "budget") {
            sorted.sort((a, b) => b.budget - a.budget);
        } else if (sort === "newest") {
            sorted.sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
        } else {
            sorted.sort(
                (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
        }
        return sorted;
    }, [trips, search, sort]);

    return (
        <div>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <input
                    type="text"
                    placeholder="Search trips..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:border-[#4a7dbe] focus:outline-none sm:max-w-xs"
                />

                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                    className="rounded-md border border-black/10 px-3 py-2 text-sm focus:border-[#4a7dbe] focus:outline-none"
                >
                    <option value="newest">Newest</option>
                    <option value="latest">Latest</option>
                    <option value="budget">Highest Budget</option>
                </select>
            </div>

            {visibleTrips.length === 0 ? (
                <p className="text-black/60">No trips match your search.</p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {visibleTrips.map((trip) => (
                        <TripCard key={trip.id} trip={trip} />
                    ))}
                </div>
            )}
        </div>
    );
}
