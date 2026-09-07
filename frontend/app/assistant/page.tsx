"use client";

import { useState } from "react";
import formStyles from "@/components/FormCard.module.css";
import { askQuestion } from "@/services/assistantService";
import type { AskResponse } from "@/types/assistant";

export default function AssistantPage() {
    const [query, setQuery] = useState("");
    const [result, setResult] = useState<AskResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const data = await askQuestion(query.trim());
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to get an answer");
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl px-6 py-10">
            <h1 className="text-2xl font-semibold">Ask KelanaAI</h1>
            <p className="mb-6 text-sm text-[#4a7dbe]">
                Powered by your trusted travel documents
            </p>

            <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Can I bring medication into Japan?"
                    className="flex-1 rounded-lg border border-black/10 bg-black/[.03] px-4 py-3 text-sm italic focus:border-[#4a7dbe] focus:bg-white focus:outline-none"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-1.5 rounded-lg bg-[#4a7dbe] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#3a6ba8] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "Asking..." : "Ask ▶"}
                </button>
            </form>

            {loading && (
                <div className="flex items-center justify-center py-8">
                    <div className={formStyles.spinner}></div>
                </div>
            )}

            {!loading && error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-600">
                    {error}
                </div>
            )}

            {!loading && !error && result && (
                <div className="rounded-lg bg-gradient-to-br from-[#2f8f7a] to-[#1f6b5c] p-6 text-white">
                    <p className="mb-2 text-xs font-semibold tracking-wide text-white/80">
                        AI ANSWER
                    </p>
                    <p className="mb-4 leading-relaxed">{result.answer}</p>

                    {result.source && (
                        <>
                            <div className="mb-3 border-t border-white/20" />
                            <p className="mb-1 text-xs font-semibold tracking-wide text-white/80">
                                SOURCE
                            </p>
                            <p className="flex items-center gap-2 text-sm text-white/90">
                                <span aria-hidden>📄</span>
                                {result.source}
                            </p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
