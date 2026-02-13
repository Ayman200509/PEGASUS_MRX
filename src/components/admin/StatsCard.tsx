import { DivideIcon as LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string;
    trend?: string;
    trendUp?: boolean;
    icon: any;
}

export function StatsCard({ title, value, trend, trendUp, icon: Icon }: StatsCardProps) {
    return (
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-red-500 group-hover:bg-red-500/10 transition-all duration-500">
                    <Icon size={24} />
                </div>
                {trend && (
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${trendUp
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                        }`}>
                        {trend}
                    </span>
                )}
            </div>

            <div>
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
                <p className="text-3xl font-black text-white tracking-tight">{value}</p>
            </div>

            {/* Decorative Glow */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-red-600/5 rounded-full blur-[40px] group-hover:bg-red-600/10 transition-all duration-500" />
        </div>
    );
}
