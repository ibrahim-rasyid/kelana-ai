"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { getHeroImage } from "./destinationImages";

export default function Home() {
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTrip(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      // Step 1: Create trip
      const createResponse = await fetch("http://localhost:8000/api/v1/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: formData.get("destination"),
          budget: Number(formData.get("budget")),
          days: Number(formData.get("days")),
          travel_style: formData.get("travel_style"),
        }),
      });

      if (!createResponse.ok) {
        throw new Error(`Failed to create trip: ${createResponse.status}`);
      }

      const createdTrip = await createResponse.json();
      console.log("Trip created:", createdTrip);

      // Step 2: Generate AI recommendation using the trip_id
      const generateResponse = await fetch(`http://localhost:8000/api/v1/trips/${createdTrip.id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!generateResponse.ok) {
        throw new Error(`Failed to generate recommendation: ${generateResponse.status}`);
      }

      const recommendation = await generateResponse.json();
      console.log("Recommendation generated:", recommendation);
      
      // Combine trip data with recommendation
      setTrip({
        ...createdTrip,
        recommendation: recommendation.recommendation
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate trip");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.desktopLayout}>
        <div className={styles.formSection}>
          <div className={styles.formCard}>
            <h1 className={styles.title}>KelanaAI</h1>
            <p className={styles.subtitle}>Plan your next adventure</p>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>DESTINATION</label>
                <input
                  name="destination"
                  className={styles.input}
                  placeholder="Japan"
                  defaultValue="Japan"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>BUDGET (USD)</label>
                <input
                  name="budget"
                  type="number"
                  className={styles.input}
                  placeholder="2000"
                  defaultValue="2000"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>DAYS</label>
                <input
                  name="days"
                  type="number"
                  className={styles.input}
                  placeholder="5"
                  defaultValue="5"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>TRAVEL STYLE</label>
                <input
                  name="travel_style"
                  className={styles.input}
                  placeholder="Family"
                  defaultValue="Family"
                  required
                />
              </div>

              <button type="submit" className={styles.button} disabled={loading}>
                {loading ? "Generating..." : "Generate AI Trip"}
              </button>
            </form>

            {error && <div className={styles.error}>Error: {error}</div>}
          </div>
        </div>

        <div className={styles.resultSection}>
        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Generating your personalized trip...</p>
          </div>
        )}

        {trip && (
          <header
            className={styles.hero}
            style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url('${getHeroImage(trip.destination)}')` }}
          >
            <h1 className={styles.heroTitle}>{trip.destination}</h1>
            <p className={styles.heroSubtitle}>Your AI-powered trip plan is ready</p>
          </header>
        )}

        {trip && (
          <div className={styles.result}>
            <h2>Your Trip Plan</h2>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <h3>Trip Details</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem", fontSize: "0.9rem" }}>
                <p><strong>Destination:</strong> {trip.destination}</p>
                <p><strong>Days:</strong> {trip.days}</p>
                <p><strong>Budget:</strong> ${trip.budget}</p>
                <p><strong>Travel Style:</strong> {trip.travel_style}</p>
                <p><strong>Category:</strong> {trip.category}</p>
                <p><strong>Daily Budget:</strong> ${trip.daily_budget?.toFixed(2)}</p>
              </div>
            </div>

            {trip.recommendation && (
              <div className={styles.aiRecommendation}>
                <h3>AI Recommendation</h3>

                {/* Daily Itinerary */}
                {trip.recommendation.daily_itinerary && (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <h4>Daily Itinerary</h4>
                    {trip.recommendation.daily_itinerary.map((day: any, index: number) => (
                      <div key={index} style={{ 
                        marginBottom: "1rem", 
                        padding: "1rem", 
                        backgroundColor: "#f8f9fa", 
                        borderRadius: "8px",
                        border: "1px solid #e9ecef"
                      }}>
                        <h5 style={{ margin: "0 0 0.5rem 0", color: "#495057" }}>
                          {day.title}
                        </h5>
                        
                        {day.morning && (
                          <div style={{ marginBottom: "0.5rem" }}>
                            <strong>Morning:</strong> {day.morning.description}
                            <ul style={{ margin: "0.25rem 0", paddingLeft: "1.5rem" }}>
                              {day.morning.activities?.map((activity: string, i: number) => (
                                <li key={i}>{activity}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {day.afternoon && (
                          <div style={{ marginBottom: "0.5rem" }}>
                            <strong>Afternoon:</strong> {day.afternoon.description}
                            <ul style={{ margin: "0.25rem 0", paddingLeft: "1.5rem" }}>
                              {day.afternoon.activities?.map((activity: string, i: number) => (
                                <li key={i}>{activity}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {day.evening && (
                          <div style={{ marginBottom: "0.5rem" }}>
                            <strong>Evening:</strong> {day.evening.description}
                            <ul style={{ margin: "0.25rem 0", paddingLeft: "1.5rem" }}>
                              {day.evening.activities?.map((activity: string, i: number) => (
                                <li key={i}>{activity}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {day.estimated_cost && (
                          <div style={{ fontSize: "0.9rem", color: "#6c757d", textAlign: "right" }}>
                            Estimated cost: ${day.estimated_cost}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Travel Tips */}
                {trip.recommendation.travel_tips && (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <h4>Travel Tips</h4>
                    <ul style={{ backgroundColor: "#f8f9fa", padding: "1rem", borderRadius: "8px", border: "1px solid #e9ecef" }}>
                      {trip.recommendation.travel_tips.map((tip: string, index: number) => (
                        <li key={index} style={{ marginBottom: "0.5rem" }}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Food Recommendations */}
                {trip.recommendation.local_food_recommendations && (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <h4>Local Food Recommendations</h4>
                    <div style={{ display: "grid", gap: "0.75rem" }}>
                      {trip.recommendation.local_food_recommendations.map((food: any, index: number) => (
                        <div key={index} style={{ 
                          padding: "0.75rem", 
                          backgroundColor: "#f8f9fa", 
                          borderRadius: "8px",
                          border: "1px solid #e9ecef"
                        }}>
                          <strong>{food.name}</strong> - ${food.estimated_cost}
                          <p style={{ margin: "0.25rem 0", fontSize: "0.9rem" }}>{food.description}</p>
                          <p style={{ margin: 0, fontSize: "0.8rem", color: "#6c757d" }}>
                            Where to try: {food.where_to_try}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Budget Breakdown */}
                {trip.recommendation.budget_breakdown && (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <h4>Budget Breakdown</h4>
                    <div style={{ 
                      backgroundColor: "#f8f9fa", 
                      padding: "1rem", 
                      borderRadius: "8px",
                      border: "1px solid #e9ecef"
                    }}>
                      {Object.entries(trip.recommendation.budget_breakdown).map(([key, value]) => (
                        <div key={key} style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          marginBottom: key === "total" ? "0.5rem" : "0.25rem",
                          fontWeight: key === "total" ? "bold" : "normal",
                          borderTop: key === "total" ? "1px solid #dee2e6" : "none",
                          paddingTop: key === "total" ? "0.5rem" : "0"
                        }}>
                          <span>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>
                          <span>${String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error handling for malformed response */}
                {trip.recommendation.error && (
                  <div style={{ 
                    backgroundColor: "#f8d7da", 
                    color: "#721c24",
                    padding: "1rem", 
                    borderRadius: "8px",
                    border: "1px solid #f5c6cb"
                  }}>
                    <h4>Error parsing AI response</h4>
                    <p>{trip.recommendation.error}</p>
                    <details>
                      <summary>Raw response</summary>
                      <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.8rem" }}>
                        {trip.recommendation.raw_response}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        </div>
      </div>

      <footer className={styles.footer}>© 2026 KelanaAI</footer>
    </div>
  );
}
