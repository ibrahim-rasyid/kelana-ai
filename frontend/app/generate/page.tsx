"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { FormCard } from "@/components/FormCard";
import styles from "@/components/FormCard.module.css";
import type { Trip } from "@/types/trip";

export default function GeneratePage() {
    const router = useRouter();
    const { token, isInitialized, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isInitialized && token === null) {
            router.replace("/login");
        }
    }, [isInitialized, token, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!token) return;
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        try {
            // Step 1: Create trip
            const createResponse = await fetch("http://localhost:8000/api/v1/trips", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    destination: formData.get("destination"),
                    budget: Number(formData.get("budget")),
                    days: Number(formData.get("days")),
                    travel_style: formData.get("travel_style"),
                }),
            });

            if (createResponse.status === 401) {
                logout();
                return;
            }
            if (!createResponse.ok) {
                throw new Error(`Failed to create trip: ${createResponse.status}`);
            }

            const createdTrip: Trip = await createResponse.json();

            // Step 2: Generate AI recommendation using the trip_id
            const generateResponse = await fetch(
                `http://localhost:8000/api/v1/trips/${createdTrip.id}/generate`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (generateResponse.status === 401) {
                logout();
                return;
            }
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

    if (!isInitialized || token === null) {
        return null;
    }

    return (
        <FormCard
            title="KelanaAI"
            subtitle="Plan your next adventure"
            onSubmit={handleSubmit}
            submitLabel={loading ? "Generating..." : "Generate AI Trip"}
            loadingLabel="Generating your personalized trip..."
            loading={loading}
            error={error}
        >
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
        </FormCard>
    );
}
