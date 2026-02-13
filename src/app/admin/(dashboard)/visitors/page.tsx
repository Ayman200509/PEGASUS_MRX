"use client";

import { useEffect, useState } from "react";
import { Visit } from "@/lib/db";
import { Eye, Calendar, Filter } from "lucide-react";

export default function VisitorsPage() {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("today"); // today, week, month, all

    useEffect(() => {
        fetch('/api/analytics')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Sort by date desc
                    const sorted = data.sort((a: Visit, b: Visit) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    setVisits(sorted);
                } else {
                    console.warn("Analytics API did not return an array:", data);
                    setVisits([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load visits", err);
                setLoading(false);
            });
    }, []);

    const filteredVisits = visits.filter(visit => {
        const visitDate = new Date(visit.date);
        const now = new Date();

        if (filter === "today") {
            return visitDate.getDate() === now.getDate() && visitDate.getMonth() === now.getMonth() && visitDate.getFullYear() === now.getFullYear();
        }
        if (filter === "week") {
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return visitDate >= oneWeekAgo;
        }
        if (filter === "month") {
            const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return visitDate >= oneMonthAgo;
        }
        return true;
    });

    const uniquePages = new Set(filteredVisits.map(v => v.path)).size;

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Visitors Analytics</h1>
                    <p className="text-gray-400">Track page views and user activity.</p>
                </div>

                <div className="flex items-center gap-2 bg-[#121215] p-1 rounded-xl border border-white/5">
                    {['today', 'week', 'month', 'all'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === f ? 'bg-white text-black' : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {f === 'all' ? 'All Time' : f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Eye size={48} className="text-blue-500" />
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Views</p>
                    <p className="text-4xl font-black text-white">{filteredVisits.length}</p>
                </div>

                <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calendar size={48} className="text-green-500" />
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Unique Pages</p>
                    <p className="text-4xl font-black text-white">{uniquePages}</p>
                </div>
            </div>

            {/* Page Views Table */}
            <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
                <div className="p-6 border-b border-white/5">
                    <h2 className="text-lg font-bold text-white">Recent Activity</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                <th className="p-4 pl-6">Index</th>
                                <th className="p-4">Page Path</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Time</th>
                                <th className="p-4">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">Loading visits...</td>
                                </tr>
                            ) : filteredVisits.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">No visits found for this period.</td>
                                </tr>
                            ) : (
                                filteredVisits.map((visit, index) => (
                                    <tr key={visit.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 pl-6 text-sm text-gray-500 font-mono">#{visit.id.substring(0, 4)}</td>
                                        <td className="p-4">
                                            <span className="inline-block px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20 font-mono">
                                                {visit.path}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-400">
                                            {new Date(visit.date).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-sm text-gray-400 font-mono">
                                            {new Date(visit.date).toLocaleTimeString()}
                                        </td>
                                        <td className="p-4 text-sm text-gray-500 font-mono opacity-50">
                                            {visit.ip || "Unknown"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
