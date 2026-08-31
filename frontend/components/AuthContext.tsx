"use client";

import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/services/authService";

const TOKEN_STORAGE_KEY = "kelanaai_token";

const tokenListeners = new Set<() => void>();

function subscribeToken(callback: () => void) {
    tokenListeners.add(callback);
    return () => tokenListeners.delete(callback);
}

function getTokenSnapshot() {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

function getTokenServerSnapshot() {
    return null;
}

function notifyTokenListeners() {
    tokenListeners.forEach((listener) => listener());
}

function subscribeNoop() {
    return () => {};
}

interface AuthContextValue {
    token: string | null;
    username: string | null;
    isAuthenticated: boolean;
    isInitialized: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const token = useSyncExternalStore(subscribeToken, getTokenSnapshot, getTokenServerSnapshot);
    // True only once we're past hydration (client render), so consumers can
    // avoid treating "haven't checked localStorage yet" the same as "no token".
    const isInitialized = useSyncExternalStore(subscribeNoop, () => true, () => false);
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        if (token === null) return;

        let cancelled = false;

        (async () => {
            try {
                const me = await getMe(token);
                if (!cancelled) setUsername(me.username);
            } catch {
                // pages that hit protected endpoints already handle an
                // invalid/expired token via their own logout() call
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [token]);

    const login = useCallback((newToken: string) => {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
        notifyTokenListeners();
    }, []);

    const logout = useCallback(() => {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        notifyTokenListeners();
        setUsername(null);
        router.push("/login");
    }, [router]);

    return (
        <AuthContext.Provider
            value={{ token, username, isAuthenticated: token !== null, isInitialized, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (ctx === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
}
