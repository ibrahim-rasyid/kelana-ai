"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import type { Trip } from "@/types/trip";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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

      const createdTrip: Trip = await createResponse.json();

      // Step 2: Generate AI recommendation using the trip_id
      const generateResponse = await fetch(`http://localhost:8000/api/v1/trips/${createdTrip.id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!generateResponse.ok) {
        throw new Error(`Failed to generate recommendation: ${generateResponse.status}`);
      }

      router.push("/trips");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate trip");
      console.error("Error:", err);
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {loading ? (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Generating your personalized trip...</p>
        </div>
      ) : (
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
              <select
                name="travel_style"
                className={styles.input}
                defaultValue="Family"
                required
              >
                <option value="Family">Family</option>
                <option value="Solo">Solo</option>
                <option value="Couple">Couple</option>
                <option value="Group">Group</option>
              </select>
            </div>

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? "Generating..." : "Generate AI Trip"}
            </button>
          </form>

          {error && <div className={styles.error}>Error: {error}</div>}
        </div>
      )}
    </div>
  );
}
