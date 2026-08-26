import type { Trip } from "@/types/trip";

export function TripInfo({ trip }: { trip: Trip }) {
    const fields: [string, string][] = [
        ["Destination", trip.destination],
        ["Days", String(trip.days)],
        ["Budget", `$${trip.budget}`],
        ["Travel Style", trip.travel_style],
        ["Category", trip.category],
        ["Daily Budget", `$${trip.daily_budget.toFixed(2)}`],
    ];

    return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {fields.map(([label, value]) => (
                <p key={label}>
                    <strong>{label}:</strong> {value}
                </p>
            ))}
        </div>
    );
}
