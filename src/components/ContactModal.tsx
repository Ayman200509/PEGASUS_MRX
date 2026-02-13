"use client";

import { X, Send, Loader2, Check, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState<string | false>(false); // Changed to allow string for ticket ID

    const [mode, setMode] = useState<"new" | "track">("new");
    const [trackId, setTrackId] = useState("");
    const [trackedTicket, setTrackedTicket] = useState<any>(null);
    const [trackingError, setTrackingError] = useState("");
    const [isTrackLoading, setIsTrackLoading] = useState(false);

    // Poll for updates when tracking a ticket
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (mode === "track" && trackedTicket && isOpen) {
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/support?id=${trackedTicket.id}`);
                    if (res.ok) {
                        const data = await res.json();
                        // Only update if messages length changed to avoid jitter, 
                        // or if status changed. simpler to just set it for now.
                        // Ideally we check for differences, but determining "difference" 
                        // in a simple way:
                        setTrackedTicket((prev: any) => {
                            if (JSON.stringify(prev) !== JSON.stringify(data)) {
                                return data;
                            }
                            return prev;
                        });
                    }
                } catch (error) {
                    console.error("Polling error:", error);
                }
            }, 3000); // Poll every 3 seconds
        }

        return () => clearInterval(interval);
    }, [mode, trackedTicket?.id, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/support", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, subject, message }),
            });

            if (res.ok) {
                const data = await res.json();
                setIsSuccess(data.id); // Set isSuccess to the ticket ID
                // Removed auto-close so user can copy ID
            } else {
                // Handle non-ok responses, e.g., display an error message
                console.error("Failed to submit ticket:", res.statusText);
                // Optionally, set an error state here
            }
        } catch (error) {
            console.error("Error submitting ticket:", error);
            // Optionally, set an error state here
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackId.trim()) return;

        setIsTrackLoading(true);
        setTrackingError("");
        setTrackedTicket(null);

        try {
            const res = await fetch(`/api/support?id=${trackId.trim()}`);
            if (!res.ok) throw new Error("Ticket not found");
            const data = await res.json();
            setTrackedTicket(data);
        } catch (error) {
            setTrackingError("Ticket not found. Please check your ID.");
        } finally {
            setIsTrackLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-[#101015] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                >
                    <X size={16} />
                </button>

                {/* Tabs */}
                <div className="flex p-1 bg-white/5 rounded-xl mb-6">
                    <button
                        onClick={() => { setMode("new"); setTrackedTicket(null); setIsSuccess(false); }}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${mode === "new" ? "bg-red-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                    >
                        New Ticket
                    </button>
                    <button
                        onClick={() => setMode("track")}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${mode === "track" ? "bg-red-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                    >
                        Track Ticket
                    </button>
                </div>

                {mode === "track" ? (
                    <div className="space-y-6">
                        {!trackedTicket ? (
                            <form onSubmit={handleTrack} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Ticket ID</label>
                                    <input
                                        required
                                        value={trackId}
                                        onChange={(e) => setTrackId(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700"
                                        placeholder="TCK-XXXXXXX"
                                    />
                                </div>
                                {trackingError && <p className="text-red-500 text-xs ml-1">{trackingError}</p>}
                                <button
                                    type="submit"
                                    disabled={isTrackLoading}
                                    className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isTrackLoading ? <Loader2 size={18} className="animate-spin" /> : "Track Ticket"}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-between items-start pb-4 border-b border-white/10">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-white max-w-[200px] truncate">{trackedTicket.subject}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${trackedTicket.status === 'open' ? 'text-red-500 border-red-500/30 bg-red-500/10' :
                                                trackedTicket.status === 'pending' ? 'text-amber-500 border-amber-500/30 bg-amber-500/10' :
                                                    'text-emerald-500 border-emerald-500/30 bg-emerald-500/10'
                                                }`}>
                                                {trackedTicket.status}
                                            </span>
                                            <span className="text-[10px] text-gray-500">{trackedTicket.date}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setTrackedTicket(null)}
                                        className="text-xs text-red-500 hover:text-red-400 font-bold"
                                    >
                                        CHECK ANOTHER
                                    </button>
                                </div>

                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-4" ref={el => { if (el) el.scrollTop = el.scrollHeight; }}>
                                    {trackedTicket.messages.map((msg: any, idx: number) => (
                                        <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] rounded-2xl p-3 ${msg.sender === 'user' ? 'bg-white/10 text-gray-200 rounded-tr-none' : 'bg-red-600/10 border border-red-500/20 text-white rounded-tl-none'
                                                }`}>
                                                <p className="text-xs leading-relaxed">{msg.text}</p>
                                                <p className="text-[9px] mt-1.5 opacity-50 text-right">{msg.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Reply Input */}
                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        if (!message.trim()) return;
                                        setIsSubmitting(true);
                                        try {
                                            const res = await fetch("/api/support", {
                                                method: "PUT",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                    id: trackedTicket.id,
                                                    reply: message,
                                                    sender: "user"
                                                }),
                                            });
                                            if (res.ok) {
                                                const updatedTicket = await res.json();
                                                setTrackedTicket(updatedTicket);
                                                setMessage("");
                                            }
                                        } catch (error) {
                                            console.error("Error sending reply:", error);
                                        } finally {
                                            setIsSubmitting(false);
                                        }
                                    }}
                                    className="relative"
                                >
                                    <input
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type your reply..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-red-500 transition-all placeholder-gray-600"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !message.trim()}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {isSuccess ? (
                            <div className="text-center py-8">
                                <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">Ticket Submitted!</h3>
                                <p className="text-gray-400 mb-4">Your support ticket has been successfully submitted.</p>
                                <p className="text-gray-300 text-sm mb-6">
                                    Your Ticket ID is: <span className="font-mono text-red-400 bg-white/5 px-2 py-1 rounded-md select-all">{isSuccess}</span>
                                </p>
                                <p className="text-gray-500 text-xs mb-6">Please save this ID to track your ticket status.</p>
                                <button
                                    onClick={onClose}
                                    className="w-full bg-red-600 text-white font-bold py-3.5 rounded-xl hover:bg-red-700 transition-all"
                                >
                                    CLOSE
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700"
                                        placeholder="Your name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Email</label>
                                    <input
                                        required
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700"
                                        placeholder="your@email.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Subject</label>
                                    <input
                                        required
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700"
                                        placeholder="How can we help?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Message</label>
                                    <textarea
                                        required
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={4}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700 resize-none"
                                        placeholder="Tell us more about your issue..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                                >
                                    {isSubmitting ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <>
                                            <span>Send Message</span>
                                            <Send size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
