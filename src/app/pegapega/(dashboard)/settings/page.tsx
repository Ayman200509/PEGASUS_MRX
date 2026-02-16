"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Send, Trash2, AlertTriangle } from "lucide-react";
import { Profile } from "@/lib/db";
import { MediaPicker } from "@/components/admin/MediaPicker";

export default function SettingsPage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetch('/api/profile')
            .then(res => res.json())
            .then(data => setProfile(data));
    }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 1. File Size Check (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("File is too large. Please upload an image smaller than 5MB.");
            return;
        }

        setUploading(true);

        // 2. Instant Preview (Optimistic Update)
        const objectUrl = URL.createObjectURL(file);
        setProfile((prev) => prev ? { ...prev, avatar: objectUrl } : null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                // 3. Update with Real Server URL
                setProfile((prev) => prev ? { ...prev, avatar: data.url } : null);
            } else {
                alert("Upload failed. Server rejected the file.");
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Upload error");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        setSaving(true);

        await fetch('/api/profile', {
            method: 'PUT',
            body: JSON.stringify(profile),
            headers: { 'Content-Type': 'application/json' }
        });

        setSaving(false);
        alert("Profile updated successfully!");
    };

    const handleReset = async () => {
        if (!confirm("⚠️ ARE YOU SURE? ⚠️\n\nThis will DELETE ALL orders, visits, and support tickets.\nIt will reset the database to the default clean state.\n\nType 'RESET' to confirm.")) return;

        const userInput = prompt("Type 'RESET' to confirm deletion:");
        if (userInput !== 'RESET') return;

        setSaving(true);
        try {
            const res = await fetch('/api/admin/reset', { method: 'POST' });
            if (res.ok) {
                alert("Data has been reset to defaults.");
                window.location.reload();
            } else {
                alert("Failed to reset data.");
            }
        } catch (error) {
            console.error(error);
            alert("Error resetting data.");
        } finally {
            setSaving(false);
        }
    };

    if (!profile) return <div className="p-12 text-center text-gray-500">Loading Settings...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="glass-panel p-8 rounded-3xl">
                <h1 className="text-2xl font-black text-white tracking-tighter mb-2">Profile Settings</h1>
                <p className="text-gray-400 text-sm mb-8">Update your public profile information.</p>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Profile Picture */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-2 block">Profile Picture</label>
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-[#0a0a0c] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                {profile.avatar ? (
                                    <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-black text-gray-700">{profile.name.charAt(0)}</span>
                                )}
                            </div>
                            <div className="flex-1">

                                // ... (rest of imports)

                                // ... (inside component)
                                <div className="mb-3">
                                    <MediaPicker
                                        type="image"
                                        onSelect={(url) => setProfile(prev => prev ? { ...prev, avatar: url } : null)}
                                        trigger={
                                            <div className="w-full bg-[#0a0a0c] border border-white/10 border-dashed hover:border-red-500/50 rounded-xl py-3 px-4 text-center transition-colors group cursor-pointer">
                                                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                                                    Click to Select / Upload Image
                                                </span>
                                            </div>
                                        }
                                    />
                                </div>

                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-600 text-xs font-bold">OR</span>
                                    <input
                                        placeholder="Paste Image URL..."
                                        value={profile.avatar || ""}
                                        onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
                                        className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-red-500/50 transition-all placeholder-gray-700"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-1 block">Display Name</label>
                            <input
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-1 block">Handle</label>
                            <input
                                value={profile.handle}
                                onChange={(e) => setProfile({ ...profile, handle: e.target.value })}
                                className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-1 block">Profile Tagline</label>
                        <input
                            value={profile.tagline || ""}
                            onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                            className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700"
                        />
                    </div>

                    {/* Social Links */}
                    <div className="pt-6 border-t border-white/5">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            Social Links
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {['telegram', 'twitter', 'instagram', 'discord', 'youtube', 'website'].map((social) => (
                                <div key={social}>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-1 block capitalize">{social}</label>
                                    <input
                                        placeholder={`@${social === 'website' ? 'example.com' : 'username'}`}
                                        value={profile.socials?.[social as keyof typeof profile.socials] || ""}
                                        onChange={(e) => setProfile({
                                            ...profile,
                                            socials: { ...profile.socials, [social]: e.target.value }
                                        })}
                                        className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payout Settings */}
                    <div className="pt-6 border-t border-white/5">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            Payout Settings
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-1 block">Network</label>
                                <input
                                    value={profile.payout?.network || ""}
                                    onChange={(e) => setProfile({
                                        ...profile,
                                        payout: { ...profile.payout, network: e.target.value }
                                    })}
                                    className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700"
                                    placeholder="e.g. USDT (TRC-20)"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-1 block">Wallet Address</label>
                                <input
                                    value={profile.payout?.address || ""}
                                    onChange={(e) => setProfile({
                                        ...profile,
                                        payout: { ...profile.payout, address: e.target.value }
                                    })}
                                    className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700 font-mono text-sm"
                                    placeholder="Enter your wallet address"
                                />
                                <p className="text-[10px] text-amber-500 mt-2 flex items-center gap-1">
                                    Double-check your address. Funds sent to the wrong address cannot be recovered.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Telegram Widget Settings */}
                    <div className="pt-6 border-t border-white/5">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Send size={18} className="text-sky-500" />
                            Telegram Support Widget
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <input
                                    type="checkbox"
                                    id="widgetEnabled"
                                    checked={profile.telegramWidget?.enabled || false}
                                    onChange={(e) => setProfile({
                                        ...profile,
                                        telegramWidget: {
                                            ...(profile.telegramWidget || { username: "" }),
                                            enabled: e.target.checked
                                        }
                                    })}
                                    className="w-5 h-5 rounded border-white/10 bg-[#0a0a0c] text-red-600 focus:ring-red-500 focus:ring-offset-0 transition-all cursor-pointer"
                                />
                                <label htmlFor="widgetEnabled" className="text-sm font-bold text-gray-300 cursor-pointer select-none">
                                    Show floating Telegram widget on frontend
                                </label>
                            </div>

                            {profile.telegramWidget?.enabled && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-1 block">Telegram Username</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-600 font-mono">@</div>
                                            <input
                                                value={profile.telegramWidget?.username || ""}
                                                onChange={(e) => setProfile({
                                                    ...profile,
                                                    telegramWidget: {
                                                        ...(profile.telegramWidget || { enabled: true }),
                                                        username: e.target.value.replace('@', '')
                                                    }
                                                })}
                                                className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700"
                                                placeholder="username"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-1 block">Widget Text (Optional)</label>
                                        <input
                                            value={profile.telegramWidget?.text || ""}
                                            onChange={(e) => setProfile({
                                                ...profile,
                                                telegramWidget: {
                                                    ...(profile.telegramWidget || { enabled: true, username: "" }),
                                                    text: e.target.value
                                                }
                                            })}
                                            className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700"
                                            placeholder="e.g. Chat with us on Telegram"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="pt-6 border-t border-white/5">
                        <h3 className="text-red-500 font-bold mb-4 flex items-center gap-2">
                            <AlertTriangle size={18} />
                            Danger Zone
                        </h3>
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                            <h4 className="text-white font-bold mb-2">Reset Database</h4>
                            <p className="text-gray-400 text-sm mb-4">
                                This will wipe all **Orders, Visits, Support Tickets, and Reviews**.
                                It will restore the database to the default configuration (Products and Settings will be kept as per the default file).
                                <br />
                                <strong>This action cannot be undone.</strong>
                            </p>
                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={saving}
                                className="bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/50 font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2 text-sm"
                            >
                                <Trash2 size={16} />
                                Reset Data to Defaults
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <button
                            disabled={saving || uploading}
                            className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
