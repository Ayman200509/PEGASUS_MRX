"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, MessageSquare, MoreVertical, CheckCircle2, Clock, AlertCircle, Send, User, Loader2, Trash2 } from "lucide-react";
import { SupportTicket } from "@/lib/db";

export default function SupportPage() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [reply, setReply] = useState("");
    const [loading, setLoading] = useState(true);
    const [sendingReply, setSendingReply] = useState(false);
    const [filterStatus, setFilterStatus] = useState<"all" | "open" | "pending" | "closed">("all");

    const fetchTickets = useCallback(async () => {
        try {
            const res = await fetch("/api/support");
            const data = await res.json();

            // Do not reset loading state on every poll to avoid flicker
            // Only set tickets if data is different or on initial load
            setTickets(prev => {
                if (!Array.isArray(data)) {
                    console.warn("Support API returned non-array:", data);
                    return [];
                }

                if (JSON.stringify(prev) !== JSON.stringify(data)) {
                    // Update selected ticket if it exists and changed
                    if (selectedTicket) {
                        const updatedSelected = data.find((t: SupportTicket) => t.id === selectedTicket.id);
                        if (updatedSelected && JSON.stringify(updatedSelected) !== JSON.stringify(selectedTicket)) {
                            setSelectedTicket(updatedSelected);
                        }
                    }
                    return data;
                }
                return prev;
            });
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setLoading(false);
        }
    }, [selectedTicket]);

    useEffect(() => {
        fetchTickets();
        const interval = setInterval(fetchTickets, 3000);
        return () => clearInterval(interval);
    }, [fetchTickets]);

    const handleStatusChange = async (newStatus: "open" | "pending" | "closed") => {
        if (!selectedTicket) return;
        try {
            const res = await fetch("/api/support", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: selectedTicket.id,
                    status: newStatus
                }),
            });

            if (res.ok) {
                const updatedTicket = await res.json();
                setTickets(tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
                setSelectedTicket(updatedTicket);
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleDelete = async () => {
        if (!selectedTicket) return;
        if (!confirm("Are you sure you want to delete this ticket?")) return;

        try {
            const res = await fetch(`/api/support?id=${selectedTicket.id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                setTickets(tickets.filter(t => t.id !== selectedTicket.id));
                setSelectedTicket(null);
            }
        } catch (error) {
            console.error("Error deleting ticket:", error);
        }
    };

    const handleReply = async () => {
        if (!selectedTicket || !reply.trim()) return;
        setSendingReply(true);

        try {
            const res = await fetch("/api/support", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: selectedTicket.id,
                    reply: reply,
                    status: "pending" // Auto update status
                }),
            });

            if (res.ok) {
                const updatedTicket = await res.json();

                // Update local state
                setTickets(tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
                setSelectedTicket(updatedTicket);
                setReply("");
            }
        } catch (error) {
            console.error("Error sending reply:", error);
        } finally {
            setSendingReply(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "open": return "text-red-500 bg-red-500/10 border-red-500/20";
            case "pending": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
            case "closed": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
            default: return "text-gray-500 bg-gray-500/10 border-gray-500/20";
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case "high": return <AlertCircle size={14} className="text-red-500" />;
            case "medium": return <Clock size={14} className="text-amber-500" />;
            case "low": return <CheckCircle2 size={14} className="text-emerald-500" />;
            default: return null;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6">

            {/* Ticket List */}
            <div className="w-1/3 glass-panel rounded-3xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/5">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            placeholder="Search tickets..."
                            className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                        />
                    </div>
                    <div className="flex gap-2 text-xs font-bold">
                        <button
                            onClick={() => setFilterStatus("all")}
                            className={`px-3 py-1.5 rounded-lg transition-colors ${filterStatus === "all" ? "bg-red-600 text-white" : "hover:bg-white/5 text-gray-400"}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterStatus("open")}
                            className={`px-3 py-1.5 rounded-lg transition-colors ${filterStatus === "open" ? "bg-red-600 text-white" : "hover:bg-white/5 text-gray-400"}`}
                        >
                            Open
                        </button>
                        <button
                            onClick={() => setFilterStatus("pending")}
                            className={`px-3 py-1.5 rounded-lg transition-colors ${filterStatus === "pending" ? "bg-red-600 text-white" : "hover:bg-white/5 text-gray-400"}`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setFilterStatus("closed")}
                            className={`px-3 py-1.5 rounded-lg transition-colors ${filterStatus === "closed" ? "bg-red-600 text-white" : "hover:bg-white/5 text-gray-400"}`}
                        >
                            Closed
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {tickets.filter(t => filterStatus === "all" || t.status === filterStatus).length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                            <p className="text-sm">No tickets found</p>
                        </div>
                    ) : (
                        tickets
                            .filter(t => filterStatus === "all" || t.status === filterStatus)
                            .map(ticket => (
                                <div
                                    key={ticket.id}
                                    onClick={() => setSelectedTicket(ticket)}
                                    className={`p-4 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5 ${selectedTicket?.id === ticket.id ? "bg-white/5 border-l-2 border-l-red-500" : "border-l-2 border-l-transparent"}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getStatusColor(ticket.status)} uppercase tracking-wider`}>
                                                {ticket.status}
                                            </span>
                                            <span className="text-[10px] text-gray-500">{ticket.id}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-500">{ticket.date}</span>
                                    </div>
                                    <h3 className="text-sm font-bold text-white mb-1 truncate">{ticket.subject}</h3>
                                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">{ticket.message}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-bold text-white">
                                                {ticket.user.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-xs text-gray-400 font-medium">{ticket.user}</span>
                                        </div>
                                        {getPriorityIcon(ticket.priority)}
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            </div>

            {/* Ticket Detail */}
            <div className="flex-1 glass-panel rounded-3xl overflow-hidden flex flex-col">
                {selectedTicket ? (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-xl font-bold text-white">{selectedTicket.subject}</h2>
                                    <select
                                        value={selectedTicket.status}
                                        onChange={(e) => handleStatusChange(e.target.value as any)}
                                        className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider bg-transparent cursor-pointer focus:outline-none ${getStatusColor(selectedTicket.status)}`}
                                    >
                                        <option value="open" className="bg-[#101015] text-red-500">Open</option>
                                        <option value="pending" className="bg-[#101015] text-amber-500">Pending</option>
                                        <option value="closed" className="bg-[#101015] text-emerald-500">Closed</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><User size={14} /> {selectedTicket.user}</span>
                                    <span className="flex items-center gap-1"><Clock size={14} /> {selectedTicket.date}</span>
                                    <span className="flex items-center gap-1">Ticket ID: #{selectedTicket.id}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleDelete}
                                    className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-gray-400 transition-colors"
                                    title="Delete Ticket"
                                >
                                    <Trash2 size={20} />
                                </button>
                                <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 transition-colors">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={el => {
                            if (el) el.scrollTop = el.scrollHeight;
                        }}>
                            {selectedTicket.messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl p-3 ${msg.sender === 'admin' ? 'bg-red-600 text-white rounded-tr-none' : 'bg-white/10 text-gray-200 rounded-tl-none'
                                        }`}>
                                        <p className="text-sm leading-relaxed">{msg.text}</p>
                                        <p className="text-[10px] mt-1 opacity-50 text-right">{msg.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reply Input */}
                        <div className="p-4 border-t border-white/5 bg-[#0a0a0c]/30">
                            <div className="relative">
                                <input
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                                    placeholder="Type your reply..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-red-500 transition-all placeholder-gray-600"
                                />
                                <button
                                    onClick={handleReply}
                                    disabled={sendingReply || !reply.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {sendingReply ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <MessageSquare size={48} className="mb-4 opacity-50" />
                        <p>Select a ticket to view details</p>
                    </div>
                )}
            </div>

        </div>
    );
}
