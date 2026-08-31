"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";

export default function Home() {
    const router = useRouter();
    const { token, isInitialized } = useAuth();

    useEffect(() => {
        if (isInitialized && token !== null) {
            router.replace("/trips");
        }
    }, [isInitialized, token, router]);

    if (!isInitialized || token !== null) {
        return null;
    }

    return (
        <div className="mx-auto flex max-w-xl flex-col items-center gap-6 px-6 py-24 text-center">
            <h1 className="text-3xl font-semibold text-[#4a7dbe]">Welcome to KelanaAI</h1>
            <p className="text-black/60">
                Plan personalized, AI-powered trips in minutes. Sign in or create an
                account to get started.
            </p>
            <div className="flex gap-3">
                <Link
                    href="/register"
                    className="rounded-md bg-[#4a7dbe] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3a6ba8]"
                >
                    Register
                </Link>
                <Link
                    href="/login"
                    className="rounded-md border border-[#4a7dbe] px-5 py-2.5 text-sm font-medium text-[#4a7dbe] transition-colors hover:bg-[#4a7dbe]/10"
                >
                    Login
                </Link>
            </div>
        </div>
    );
}
