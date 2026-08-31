"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { FormCard } from "@/components/FormCard";
import styles from "@/components/FormCard.module.css";
import { register as registerRequest, login as loginRequest } from "@/services/authService";

export default function RegisterPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const username = String(formData.get("username"));
        const email = String(formData.get("email"));
        const password = String(formData.get("password"));

        try {
            await registerRequest(username, email, password);
            const { access_token } = await loginRequest(email, password);
            login(access_token);
            router.push("/trips");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to register");
            console.error("Error:", err);
            setLoading(false);
        }
    };

    return (
        <FormCard
            title="KelanaAI"
            subtitle="Create your account"
            onSubmit={handleSubmit}
            submitLabel={loading ? "Creating account..." : "Register"}
            loadingLabel="Creating your account..."
            loading={loading}
            error={error}
        >
            <div className={styles.inputGroup}>
                <label className={styles.label}>USERNAME</label>
                <input name="username" className={styles.input} required />
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.label}>EMAIL</label>
                <input name="email" type="email" className={styles.input} required />
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.label}>PASSWORD</label>
                <input name="password" type="password" className={styles.input} required />
            </div>
        </FormCard>
    );
}
