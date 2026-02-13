"use client";

import { useState } from "react";
import { ContactModal } from "./ContactModal";
import { Navbar } from "./Navbar";
import { ReactNode } from "react";

export function ProductClientWrapper({ children }: { children: ReactNode }) {
    const [isContactOpen, setIsContactOpen] = useState(false);

    // Filter out the Navbar from children so we can re-render it with the prop
    // Actually simpler: just wrap everything and provide Navbar inside or as children
    return (
        <>
            <Navbar onContactClick={() => setIsContactOpen(true)} />
            {children}
            <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
        </>
    );
}
