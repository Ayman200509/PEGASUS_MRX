"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function PageViewTracker() {
    const pathname = usePathname();

    useEffect(() => {
        if (!pathname) return;

        // Debounce or just fire? Fire is fine for now, maybe avoid duplicates in strict mode
        // In local dev, strict mode fires effects twice, so we might see double counts.
        // For production, this is fine.

        const trackVisit = async () => {
            try {
                // Don't track admin pages to avoid inflating stats
                if (pathname.startsWith('/admin')) return;

                await fetch('/api/analytics/visit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: pathname })
                });
            } catch (err) {
                console.error("Tracking failed", err);
            }
        };

        trackVisit();
    }, [pathname]);

    return null;
}
