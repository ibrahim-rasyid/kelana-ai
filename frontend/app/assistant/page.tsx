"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import formStyles from "@/components/FormCard.module.css";
import {
    listConversations,
    createConversation,
    renameConversation,
    getMessages,
    sendMessage,
    UnauthorizedError,
} from "@/services/assistantService";
import type { Conversation, Message } from "@/types/assistant";

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AssistantPage() {
    const router = useRouter();
    const { token, isInitialized, logout } = useAuth();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [draft, setDraft] = useState("");

    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [renamingId, setRenamingId] = useState<number | null>(null);
    const [renameValue, setRenameValue] = useState("");
    const cancelRenameRef = useRef(false);

    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [showScrollButton, setShowScrollButton] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isInitialized) return;

        if (token === null) {
            router.replace("/login");
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const data = await listConversations(token);
                if (cancelled) return;
                setConversations(data);
                setSelectedId(data.length > 0 ? data[0].id : null);
                setLoadingConversations(false);
            } catch (err) {
                if (cancelled) return;
                if (err instanceof UnauthorizedError) {
                    logout();
                    return;
                }
                setError(err instanceof Error ? err.message : "Failed to load conversations");
                setLoadingConversations(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [isInitialized, token, router, logout]);

    useEffect(() => {
        if (selectedId === null || token === null) return;

        let cancelled = false;

        (async () => {
            setLoadingMessages(true);
            try {
                const data = await getMessages(token, selectedId);
                if (cancelled) return;
                setMessages(data);
                setLoadingMessages(false);
                setShowScrollButton(false);
            } catch (err) {
                if (cancelled) return;
                if (err instanceof UnauthorizedError) {
                    logout();
                    return;
                }
                setError(err instanceof Error ? err.message : "Failed to load messages");
                setLoadingMessages(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [selectedId, token, logout]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ block: "end" });
    }, [messages]);

    useEffect(() => {
        if (openMenuId === null) return;
        const closeMenu = () => setOpenMenuId(null);
        document.addEventListener("click", closeMenu);
        return () => document.removeEventListener("click", closeMenu);
    }, [openMenuId]);

    const handleNewConversation = async () => {
        if (token === null) return;
        try {
            const conv = await createConversation(token);
            setConversations((prev) => [conv, ...prev]);
            setSelectedId(conv.id);
        } catch (err) {
            if (err instanceof UnauthorizedError) {
                logout();
                return;
            }
            setError(err instanceof Error ? err.message : "Failed to create conversation");
        }
    };

    const handleRenameSubmit = async (conversationId: number) => {
        setRenamingId(null);
        const title = renameValue.trim();
        if (token === null || !title) return;

        const original = conversations.find((c) => c.id === conversationId);
        if (original && original.title === title) return;

        try {
            const updated = await renameConversation(token, conversationId, title);
            setConversations((prev) =>
                prev.map((c) => (c.id === conversationId ? updated : c))
            );
        } catch (err) {
            if (err instanceof UnauthorizedError) {
                logout();
                return;
            }
            setError(err instanceof Error ? err.message : "Failed to rename conversation");
        }
    };

    const handleMessagesScroll = () => {
        const el = messagesContainerRef.current;
        if (!el) return;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        setShowScrollButton(distanceFromBottom > 100);
    };

    const handleScrollToLatest = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    };

    const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!draft.trim() || selectedId === null || token === null) return;

        const content = draft.trim();
        setDraft("");
        setSending(true);
        setError(null);

        try {
            const data = await sendMessage(token, selectedId, content);
            setMessages((prev) => [...prev, data.user_message, data.assistant_message]);
            setConversations((prev) =>
                prev.map((c) =>
                    c.id === selectedId && c.title === null
                        ? { ...c, title: content.slice(0, 50) }
                        : c
                )
            );
        } catch (err) {
            if (err instanceof UnauthorizedError) {
                logout();
                return;
            }
            setError(err instanceof Error ? err.message : "Failed to send message");
        } finally {
            setSending(false);
        }
    };

    if (!isInitialized || token === null) {
        return null;
    }

    return (
        <div className="mx-auto flex h-[80vh] max-w-5xl overflow-hidden rounded-lg border border-black/10 bg-white">
            <div className="flex w-64 shrink-0 flex-col border-r border-black/10">
                <button
                    type="button"
                    onClick={handleNewConversation}
                    className="m-3 rounded-md bg-[#4a7dbe] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3a6ba8]"
                >
                    + New Conversation
                </button>

                <div className="flex-1 overflow-y-auto">
                    {loadingConversations ? (
                        <div className="flex justify-center py-6">
                            <div className={formStyles.spinner}></div>
                        </div>
                    ) : conversations.length === 0 ? (
                        <p className="px-3 py-4 text-center text-sm text-black/50">
                            No conversations yet.
                        </p>
                    ) : (
                        conversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={`flex items-center transition-colors ${
                                    conv.id === selectedId
                                        ? "bg-[#4a7dbe]/10"
                                        : "hover:bg-black/[.05]"
                                }`}
                            >
                                {renamingId === conv.id ? (
                                    <input
                                        autoFocus
                                        value={renameValue}
                                        onChange={(e) => setRenameValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.currentTarget.blur();
                                            } else if (e.key === "Escape") {
                                                cancelRenameRef.current = true;
                                                e.currentTarget.blur();
                                            }
                                        }}
                                        onBlur={() => {
                                            if (cancelRenameRef.current) {
                                                cancelRenameRef.current = false;
                                                setRenamingId(null);
                                                return;
                                            }
                                            handleRenameSubmit(conv.id);
                                        }}
                                        className="m-1.5 flex-1 rounded border border-[#4a7dbe] bg-white px-2 py-1 text-sm focus:outline-none"
                                    />
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedId(conv.id)}
                                        className={`flex-1 truncate px-3 py-2.5 text-left text-sm ${
                                            conv.id === selectedId
                                                ? "font-semibold text-[#4a7dbe]"
                                                : "text-black/70"
                                        }`}
                                    >
                                        {conv.title ?? "New Conversation"}
                                    </button>
                                )}

                                {renamingId !== conv.id && (
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId((prev) => (prev === conv.id ? null : conv.id));
                                            }}
                                            aria-label="Conversation options"
                                            className="px-2 py-2.5 text-black/40 hover:text-black/70"
                                        >
                                            ⋮
                                        </button>

                                        {openMenuId === conv.id && (
                                            <div
                                                onClick={(e) => e.stopPropagation()}
                                                className="absolute right-0 top-full z-10 w-32 rounded-md border border-black/10 bg-white py-1 shadow-lg"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        setRenamingId(conv.id);
                                                        setRenameValue(conv.title ?? "");
                                                    }}
                                                    className="block w-full px-3 py-1.5 text-left text-sm text-black/70 hover:bg-black/[.05]"
                                                >
                                                    Rename
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="relative flex flex-1 flex-col">
                {selectedId === null ? (
                    <div className="flex flex-1 items-center justify-center px-6 text-center text-black/50">
                        Select or start a new conversation to begin chatting.
                    </div>
                ) : (
                    <>
                        <div
                            ref={messagesContainerRef}
                            onScroll={handleMessagesScroll}
                            className="flex-1 space-y-3 overflow-y-auto p-4"
                        >
                            {loadingMessages ? (
                                <div className="flex justify-center py-6">
                                    <div className={formStyles.spinner}></div>
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                                            message.role === "user"
                                                ? "ml-auto bg-[#4a7dbe] text-white"
                                                : "mr-auto bg-black/[.05] text-black"
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                        {message.source && (
                                            <p className="mt-1 text-xs text-black/50">
                                                📄 {message.source}
                                            </p>
                                        )}
                                        <p
                                            className={`mt-1 text-[11px] ${
                                                message.role === "user"
                                                    ? "text-white/70"
                                                    : "text-black/40"
                                            }`}
                                        >
                                            {formatTime(message.created_at)}
                                        </p>
                                    </div>
                                ))
                            )}

                            {sending && (
                                <p className="mr-auto text-sm italic text-black/50">
                                    Assistant is typing…
                                </p>
                            )}

                            <div ref={bottomRef} />
                        </div>

                        {showScrollButton && (
                            <button
                                type="button"
                                onClick={handleScrollToLatest}
                                aria-label="Scroll to latest message"
                                className="absolute bottom-20 right-6 flex h-9 w-9 items-center justify-center rounded-full bg-[#4a7dbe] text-white shadow-lg transition-colors hover:bg-[#3a6ba8]"
                            >
                                ↓
                            </button>
                        )}

                        {error && (
                            <div className="mx-4 mb-2 rounded-lg border border-red-200 bg-red-50 p-2 text-center text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <form
                            onSubmit={handleSend}
                            className="flex gap-2 border-t border-black/10 p-3"
                        >
                            <input
                                type="text"
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                placeholder="Ask something..."
                                className="flex-1 rounded-lg border border-black/10 bg-black/[.03] px-3 py-2 text-sm focus:border-[#4a7dbe] focus:bg-white focus:outline-none"
                            />
                            <button
                                type="submit"
                                disabled={sending || !draft.trim()}
                                className="rounded-lg bg-[#4a7dbe] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3a6ba8] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Send
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
