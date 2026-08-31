"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { FormCard } from "@/components/FormCard";
import styles from "@/components/FormCard.module.css";
import { login as loginRequest } from "@/services/authService";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = String(formData.get("email"));
        const password = String(formData.get("password"));

        try {
            const { access_token } = await loginRequest(email, password);
            login(access_token);
            router.push("/trips");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Invalid email or password");
            console.error("Error:", err);
            setLoading(false);
        }
    };

    return (
        <FormCard
            title="KelanaAI"
            subtitle="Log in to your account"
            onSubmit={handleSubmit}
            submitLabel={loading ? "Logging in..." : "Login"}
            loadingLabel="Logging in..."
            loading={loading}
            error={error}
        >
            <div className={styles.inputGroup}>
                <label className={styles.label}>EMAIL</label>
                <input
                    name="email"
                    type="email"
                    className={styles.input}
                    placeholder="you@example.com"
                    required
                />
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.label}>PASSWORD</label>
                <input name="password" type="password" className={styles.input} required />
            </div>
        </FormCard>
    );
}
