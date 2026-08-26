"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
    { href: "/", label: "Generate" },
    { href: "/trips", label: "Trips" },
];

export function Header() {
    const pathname = usePathname();

    return (
        <header className="flex items-center justify-between border-b border-black/10 px-6 py-4">
            <span className="font-semibold text-[#4a7dbe]">KelanaAI</span>
            <nav className="flex gap-2">
                {NAV_LINKS.map(({ href, label }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                isActive
                                    ? "bg-[#4a7dbe] text-white"
                                    : "text-black/70 hover:bg-black/[.05]"
                            }`}
                        >
                            {label}
                        </Link>
                    );
                })}
            </nav>
        </header>
    );
}