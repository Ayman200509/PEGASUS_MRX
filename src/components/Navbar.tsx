"use client";

import { ShoppingBag, Search } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar({ onContactClick }: { onContactClick?: () => void }) {
    const { items } = useCart();
    const pathname = usePathname();
    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

    const isHome = pathname === "/";

    return (
        <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 transition-all duration-300">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-red-500/10 group-hover:border-red-500/30 transition-all duration-300">
                        <span className="text-xs font-black text-gray-400 group-hover:text-red-500">MRX</span>
                    </div>
                </Link>

                {/* Right Actions */}
                <div className="flex items-center gap-6">
                    {onContactClick && (
                        <button
                            onClick={onContactClick}
                            className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest hidden md:block"
                        >
                            Contact Support
                        </button>
                    )}

                    {/* Cart Icon */}
                    <Link
                        href="/cart"
                        className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300 group"
                    >
                        <ShoppingBag size={20} className="group-hover:scale-110 transition-transform" />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.5)] border-2 border-[#050505] animate-in zoom-in duration-300">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
        </nav>
    );
}
