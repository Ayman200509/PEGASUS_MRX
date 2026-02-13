"use client";

import { ProfileHeader } from "@/components/ProfileHeader";
import { ProductSection } from "@/components/ProductSection";
import { ContactModal } from "@/components/ContactModal";
import { Navbar } from "@/components/Navbar";
import { useState } from "react";

export default function Home() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <main className="min-h-screen relative overflow-x-hidden selection:bg-red-500/30 selection:text-white">

      {/* Background Noise Texture */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0 mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}>
      </div>

      {/* Main Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#050505] via-[#08080a] to-[#030303] -z-10" />

      {/* Ambient Lighting */}
      <div className="fixed top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-red-900/5 to-transparent pointer-events-none -z-10" />

      <Navbar onContactClick={() => setIsContactOpen(true)} />

      <div className="relative z-10 w-full pt-12">
        <ProfileHeader />
        <ProductSection />
      </div>

      <footer className="py-12 text-center border-t border-white/5 bg-[#030303]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-1 bg-red-600/20 rounded-full" />
          <p className="text-gray-600 text-xs uppercase tracking-widest font-medium">
            © {new Date().getFullYear()} Pegasus MRX. All rights reserved.
          </p>
        </div>
      </footer>

      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </main>
  );
}
