"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthContext";

const AUTHENTICATED_LINKS = [
    { href: "/generate", label: "Generate" },
    { href: "/trips", label: "Trips" },
    { href: "/profile", label: "Profile" },
];

const GUEST_LINKS = [
    { href: "/login", label: "Login" },
    { href: "/register", label: "Register" },
];

export function Header() {
    const pathname = usePathname();
    const { isAuthenticated, isInitialized, username, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLinks = isAuthenticated ? AUTHENTICATED_LINKS : GUEST_LINKS;

    const renderLinks = (onLinkClick?: () => void) =>
        navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
                <Link
                    key={href}
                    href={href}
                    onClick={onLinkClick}
                    className={`px-3 py-1.5 text-sm transition-colors ${
                        isActive
                            ? "font-bold text-[#4a7dbe] underline underline-offset-4"
                            : "rounded-md font-medium text-black/70 hover:bg-black/[.05]"
                    }`}
                >
                    {label}
                </Link>
            );
        });

    const renderWelcome = () =>
        isAuthenticated &&
        username && (
            <span className="text-xs leading-tight text-black/60 sm:mr-2 sm:text-right">
                Welcome back
                <br />
                <span className="font-medium text-black">{username}</span>
            </span>
        );

    const renderLogout = (onLinkClick?: () => void) =>
        isAuthenticated && (
            <button
                type="button"
                onClick={() => {
                    onLinkClick?.();
                    logout();
                }}
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
                Logout
            </button>
        );

    return (
        <header className="relative border-b border-black/10 px-6 py-4">
            <div className="flex items-center justify-between">
                <span className="font-semibold text-[#4a7dbe]">KelanaAI</span>

                {isInitialized && (
                    <>
                        <nav className="hidden items-center gap-2 sm:flex">
                            {renderWelcome()}
                            {renderLinks()}
                            {renderLogout()}
                        </nav>

                        <button
                            type="button"
                            onClick={() => setMobileOpen((open) => !open)}
                            aria-label="Toggle navigation menu"
                            aria-expanded={mobileOpen}
                            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-md hover:bg-black/[.05] sm:hidden"
                        >
                            <span className="h-0.5 w-5 bg-black/70" />
                            <span className="h-0.5 w-5 bg-black/70" />
                            <span className="h-0.5 w-5 bg-black/70" />
                        </button>
                    </>
                )}
            </div>

            {isInitialized && mobileOpen && (
                <nav className="mt-4 flex flex-col items-start gap-2 sm:hidden">
                    {renderWelcome()}
                    {renderLinks(() => setMobileOpen(false))}
                    {renderLogout(() => setMobileOpen(false))}
                </nav>
            )}
        </header>
    );
}
