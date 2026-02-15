"use client";

import {
    LayoutDashboard,
    ShoppingBag,
    Settings,
    LogOut,
    Package,
    CreditCard,
    MessageSquare,
    FolderOpen,
    Eye,
    Star,
    Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const menuItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/moughit" },
    { icon: ShoppingBag, label: "Orders", href: "/moughit/orders" },
    { icon: Package, label: "Products", href: "/moughit/products" },
    { icon: CreditCard, label: "Finance", href: "/moughit/finance" },
    { icon: MessageSquare, label: "Support", href: "/moughit/support" },
    { icon: Star, label: "Reviews", href: "/moughit/reviews" },
    { icon: Eye, label: "Visitors", href: "/moughit/visitors" },
    { icon: ImageIcon, label: "Media Library", href: "/moughit/library" },
    { icon: Settings, label: "Settings", href: "/moughit/settings" },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 h-screen bg-[#050505] border-r border-white/5 flex flex-col fixed left-0 top-0 overflow-y-auto z-50">

            {/* Brand */}
            <div className="p-8 pb-12 flex items-center justify-center">
                <h1 className="text-3xl font-black text-white tracking-tighter">
                    PEGASUS <span className="text-red-600">MRX</span>
                </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Main Menu</p>

                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                isActive
                                    ? "bg-red-600/10 text-red-500 shadow-[0_0_20px_rgba(220,38,38,0.1)]"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Icon size={20} className={cn("relative z-10", isActive && "text-red-500")} />
                            <span className="text-sm font-bold relative z-10">{item.label}</span>

                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent border-l-2 border-red-600" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User / Logout */}
            <div className="p-4 mt-auto border-t border-white/5">
                <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-600/10 transition-all group">
                    <LogOut size={20} />
                    <span className="text-sm font-bold">Logout</span>
                </button>
            </div>
        </div>
    );
}
