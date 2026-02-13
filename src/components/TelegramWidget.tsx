"use client";

import { useEffect, useState } from "react";
import { Send, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Profile } from "@/lib/db";

export function TelegramWidget() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [showLabel, setShowLabel] = useState(false);

    const pathname = usePathname();

    useEffect(() => {
        fetch('/api/profile')
            .then(res => res.json())
            .then(data => {
                setProfile(data);
                if (data.telegramWidget?.enabled) {
                    // Show with a slight delay for better UX
                    setTimeout(() => setIsVisible(true), 1500);
                    // Show label after button appears
                    setTimeout(() => setShowLabel(true), 2500);
                }
            });
    }, []);

    const isAdminPath = pathname?.startsWith('/admin');

    if (!profile?.telegramWidget?.enabled || !isVisible || isAdminPath) return null;

    const username = profile.telegramWidget.username;
    const text = profile.telegramWidget.text || "Contact Support";

    return (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3 group">
            {/* Label */}
            {showLabel && (
                <div className="bg-white/10 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500 relative">
                    <button
                        onClick={() => setShowLabel(false)}
                        className="absolute -top-2 -left-2 w-5 h-5 bg-black/50 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={10} />
                    </button>
                    <p className="text-[11px] font-bold text-white whitespace-nowrap tracking-wide">{text}</p>
                </div>
            )}

            {/* Main Button */}
            <a
                href={`https://t.me/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 bg-sky-500 hover:bg-sky-400 text-white rounded-2xl shadow-[0_0_30px_rgba(14,165,233,0.4)] transition-all duration-300 flex items-center justify-center group hover:scale-110 active:scale-95"
            >
                <div className="relative">
                    <svg
                        viewBox="0 0 24 24"
                        width="28"
                        height="28"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
                    >
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.506 1.201-.814 1.23-.674.062-1.185-.446-1.838-.875-1.022-.672-1.6-.1.1-2.583-1.791.758.188-.184 3.253-3.141 3.312-.244.02-.03-.016-.168-.088-.24-.225-.216-.324-.192-.144.024-2.352 1.501-6.648 4.428-.624.42-1.188.636-1.692.624-.552-.012-1.62-.312-2.412-.576-.972-.324-1.74-.492-1.668-1.068.036-.3.456-.612 1.26-.936 4.944-2.148 8.244-3.564 9.888-4.26 4.704-1.98 5.676-2.316 6.324-2.328.144 0 .456.036.66.204.168.144.216.336.24.516.012.12 0 .264-.024.384z" />
                    </svg>
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-sky-500 rounded-full animate-ping" />
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-sky-500 rounded-full" />
                </div>
            </a>
        </div>
    );
}
