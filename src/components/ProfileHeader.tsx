"use client";

import { Send } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Profile } from "@/lib/db";

interface ProfileWithStats extends Profile {
    reviewsCount?: number;
}

export function ProfileHeader() {
    const [profile, setProfile] = useState<ProfileWithStats | null>(null);

    useEffect(() => {
        fetch('/api/profile')
            .then(res => {
                if (!res.ok) {
                    console.error("Profile API error:", res.status);
                    return null;
                }
                return res.json();
            })
            .then(data => {
                if (data && !data.error) {
                    setProfile(data);
                }
            })
            .catch(err => console.error(err));
    }, []);

    if (!profile) return <div className="h-96 flex items-center justify-center text-gray-500 animate-pulse">Loading Profile...</div>;

    return (
        <div className="flex flex-col items-center justify-center pt-24 pb-16 relative w-full overflow-hidden">

            {/* Background Glows for Hero Section */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-[800px] pointer-events-none">
                <div className="absolute top-10 left-1/4 w-72 h-72 bg-red-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
                <div className="absolute top-10 right-1/4 w-72 h-72 bg-purple-600/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-2xl px-4">

                {/* Avatar with Animated Ring */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-purple-600 rounded-full opacity-70 group-hover:opacity-100 blur transition duration-500"></div>
                    <div className="relative w-36 h-36 rounded-full border-4 border-[#0a0a0a] bg-[#121215] flex items-center justify-center overflow-hidden shadow-2xl z-10">
                        {profile.avatar ? (
                            <img src={profile.avatar} alt={profile.name || "User"} className="w-full h-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a20] to-[#0a0a0a] flex items-center justify-center">
                                <span className="text-4xl font-black text-gray-500 group-hover:text-gray-300 transition-colors tracking-tighter">
                                    {(profile.name || "A").charAt(0)}
                                </span>
                            </div>
                        )}

                        {/* Crown Icon Overlay */}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-3xl filter drop-shadow-[0_2px_10px_rgba(239,68,68,0.5)] animate-pulse">👑</div>
                    </div>
                </div>

                {/* Name and Handle */}
                <div className="text-center space-y-1 mt-2">
                    <h1 className="text-6xl font-black tracking-tighter text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] uppercase">
                        {profile.name}
                    </h1>
                    <p className="text-red-500 font-bold text-lg tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-400">
                        {profile.handle}
                    </p>
                    <div className="pt-2 flex flex-col items-center gap-4">
                        <span className="inline-block px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase backdrop-blur-sm">
                            {profile.tagline || profile.type}
                        </span>

                        {/* Social Links Removed as per request */}
                    </div>
                </div>

                {/* Stats Box - Creative Glassmorphism */}
                <div className="grid grid-cols-4 items-center glass-panel rounded-2xl p-1 w-full max-w-[550px] h-[90px] mt-8 shadow-2xl relative overflow-hidden group">

                    {/* Products Stat */}
                    <div className="flex flex-col items-center justify-center h-full border-r border-white/5 relative z-10 hover:bg-white/5 transition-colors cursor-default">
                        <span className="text-2xl font-black text-white leading-none group-hover:text-red-500 transition-colors duration-300">
                            {profile.productsCount}
                        </span>
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">PRODUCTS</span>
                    </div>

                    {/* Sales Stat */}
                    <div className="flex flex-col items-center justify-center h-full border-r border-white/5 relative z-10 hover:bg-white/5 transition-colors cursor-default">
                        <span className="text-2xl font-black text-white leading-none">
                            {profile.salesCount}
                        </span>
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">SALES</span>
                    </div>

                    {/* Feedbacks Link */}
                    <Link
                        href="/reviews"
                        className="flex flex-col items-center justify-center h-full relative z-10 hover:bg-white/5 transition-colors cursor-pointer border-r border-white/5 group/feedback"
                    >
                        <div className="flex items-center gap-1.5 mb-1 group-hover/feedback:scale-110 transition-transform">
                            <span className="text-2xl font-black text-white leading-none">
                                {profile.reviewsCount || 0}
                            </span>
                            <Send size={12} className="text-yellow-500 fill-yellow-500 hidden" /> {/* Hidden but kept for layout if needed, using custom star below */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-4 h-4 text-yellow-500 animate-pulse"
                            >
                                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest group-hover/feedback:text-yellow-500 transition-colors">FEEDBACKS</span>
                    </Link>

                    {/* Telegram Contact */}
                    <a
                        href={profile.socials?.telegram ? (profile.socials.telegram.startsWith('http') ? profile.socials.telegram : `https://t.me/${profile.socials.telegram.replace('@', '')}?start=Hello`) : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center h-full relative z-10 hover:bg-blue-500/10 transition-colors cursor-pointer group/telegram"
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg group-hover/telegram:scale-110 transition-transform mb-1">
                            <Send size={16} className="-ml-0.5 mt-0.5" />
                        </div>
                        <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">CONTACT</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
