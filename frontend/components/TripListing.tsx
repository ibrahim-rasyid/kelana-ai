"use client";

import { useMemo, useState } from "react";
import { TripCard } from "@/components/TripCard";
import type { Trip } from "@/types/trip";

type SortOption = "newest" | "latest" | "budget";

const TRIPS_PER_PAGE = 10;

export function TripListing({ trips }: { trips: Trip[] }) {
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortOption>("newest");
    const [page, setPage] = useState(1);

    const sortedTrips = useMemo(() => {
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

    const pageCount = Math.max(1, Math.ceil(sortedTrips.length / TRIPS_PER_PAGE));

    const filterKey = `${search}|${sort}`;
    const [lastFilterKey, setLastFilterKey] = useState(filterKey);
    if (filterKey !== lastFilterKey) {
        setLastFilterKey(filterKey);
        setPage(1);
    }

    const currentPage = Math.min(Math.max(page, 1), pageCount);

    const visibleTrips = sortedTrips.slice(
        (currentPage - 1) * TRIPS_PER_PAGE,
        currentPage * TRIPS_PER_PAGE
    );

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

            {sortedTrips.length === 0 ? (
                <p className="text-black/60">No trips match your search.</p>
            ) : (
                <>
                    <div className="flex flex-col gap-3">
                        {visibleTrips.map((trip) => (
                            <TripCard key={trip.id} trip={trip} />
                        ))}
                    </div>

                    {pageCount > 1 && (
                        <div className="mt-6 flex items-center justify-between text-sm">
                            <button
                                type="button"
                                onClick={() => setPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="rounded-md border border-black/10 px-3 py-1.5 font-medium text-black/70 transition-colors hover:bg-black/[.05] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Previous
                            </button>

                            <span className="text-black/60">
                                Page {currentPage} of {pageCount}
                            </span>

                            <button
                                type="button"
                                onClick={() => setPage(currentPage + 1)}
                                disabled={currentPage === pageCount}
                                className="rounded-md border border-black/10 px-3 py-1.5 font-medium text-black/70 transition-colors hover:bg-black/[.05] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
