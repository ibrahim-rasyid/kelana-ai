"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { getMe, UnauthorizedError } from "@/services/authService";
import type { MeResponse } from "@/types/auth";

export default function ProfilePage() {
    const router = useRouter();
    const { token, isInitialized, logout } = useAuth();
    const [profile, setProfile] = useState<MeResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isInitialized) return;

        if (token === null) {
            router.replace("/login");
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const data = await getMe(token);
                if (!cancelled) {
                    setProfile(data);
                    setLoading(false);
                }
            } catch (err) {
                if (cancelled) return;
                if (err instanceof UnauthorizedError) {
                    logout();
                    return;
                }
                setError(err instanceof Error ? err.message : "Failed to load profile");
                setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [isInitialized, token, router, logout]);

    if (!isInitialized || token === null) {
        return null;
    }

    return (
        <div className="mx-auto max-w-md px-6 py-10">
            <h1 className="mb-6 text-2xl font-semibold">Profile</h1>

            {loading ? (
                <p className="text-black/60">Loading profile...</p>
            ) : error ? (
                <div className="rounded-lg border border-black/10 bg-white p-6 text-center text-red-600">
                    {error}
                </div>
            ) : profile ? (
                <div className="rounded-lg border border-black/10 bg-white p-6">
                    <dl className="flex flex-col gap-4">
                        <div>
                            <dt className="text-xs font-semibold uppercase tracking-wide text-[#4a7dbe]">
                                Name
                            </dt>
                            <dd className="mt-1 text-lg">{profile.username}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-semibold uppercase tracking-wide text-[#4a7dbe]">
                                Email
                            </dt>
                            <dd className="mt-1 text-lg">{profile.email}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-semibold uppercase tracking-wide text-[#4a7dbe]">
                                Total Trips Generated
                            </dt>
                            <dd className="mt-1 text-lg">{profile.total_trips}</dd>
                        </div>
                    </dl>
                </div>
            ) : null}
        </div>
    );
}
