import type { TripRecommendation } from "@/types/trip";

export function TripRecommendationView({
    recommendation,
}: {
    recommendation: TripRecommendation;
}) {
    return (
        <div className="space-y-6">
            {recommendation.daily_itinerary && (
                <section>
                    <h3 className="mb-2 text-base font-semibold">Daily Itinerary</h3>
                    <div className="space-y-3">
                        {recommendation.daily_itinerary.map((day) => (
                            <div
                                key={day.day}
                                className="rounded-lg border border-black/10 bg-black/[.02] p-3"
                            >
                                <h4 className="mb-1 font-medium">{day.title}</h4>

                                {day.morning && (
                                    <p className="mb-1 text-sm">
                                        <strong>Morning:</strong> {day.morning.description}
                                    </p>
                                )}
                                {day.afternoon && (
                                    <p className="mb-1 text-sm">
                                        <strong>Afternoon:</strong> {day.afternoon.description}
                                    </p>
                                )}
                                {day.evening && (
                                    <p className="mb-1 text-sm">
                                        <strong>Evening:</strong> {day.evening.description}
                                    </p>
                                )}

                                {day.estimated_cost != null && (
                                    <p className="text-right text-xs text-black/60">
                                        Estimated cost: ${day.estimated_cost}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {recommendation.travel_tips && (
                <section>
                    <h3 className="mb-2 text-base font-semibold">Travel Tips</h3>
                    <ul className="list-disc space-y-1 rounded-lg border border-black/10 bg-black/[.02] p-4 pl-8 text-sm">
                        {recommendation.travel_tips.map((tip, index) => (
                            <li key={index}>{tip}</li>
                        ))}
                    </ul>
                </section>
            )}

            {recommendation.local_food_recommendations && (
                <section>
                    <h3 className="mb-2 text-base font-semibold">
                        Local Food Recommendations
                    </h3>
                    <div className="space-y-2">
                        {recommendation.local_food_recommendations.map((food, index) => (
                            <div
                                key={index}
                                className="rounded-lg border border-black/10 bg-black/[.02] p-3 text-sm"
                            >
                                <strong>{food.name}</strong> - ${food.estimated_cost}
                                <p className="mt-1">{food.description}</p>
                                <p className="mt-1 text-xs text-black/60">
                                    Where to try: {food.where_to_try}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {recommendation.budget_breakdown && (
                <section>
                    <h3 className="mb-2 text-base font-semibold">Budget Breakdown</h3>
                    <div className="rounded-lg border border-black/10 bg-black/[.02] p-4">
                        {Object.entries(recommendation.budget_breakdown).map(
                            ([key, value]) => (
                                <div
                                    key={key}
                                    className={`flex justify-between text-sm ${
                                        key === "total"
                                            ? "mt-1 border-t border-black/10 pt-2 font-bold"
                                            : "mb-1"
                                    }`}
                                >
                                    <span>
                                        {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}:
                                    </span>
                                    <span>${String(value)}</span>
                                </div>
                            )
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
