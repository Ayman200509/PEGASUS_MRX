import { FileText, Key, User, Briefcase } from "lucide-react";

interface StepTypeProps {
    type: string;
    setType: (type: string) => void;
}

export function StepType({ type, setType }: StepTypeProps) {
    const types = [
        { id: "Instant File", icon: FileText, label: "Instant File", desc: "Ebook, PDF, Software" },
        { id: "Instant Serial", icon: Key, label: "Instant Serial", desc: "License keys, Codes" },
        { id: "Account", icon: User, label: "Account", desc: "Username & password" },
        { id: "Service", icon: Briefcase, label: "Manual Delivery", desc: "Services, Top-up" },
    ];

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Choose Product Type</h3>
                <p className="text-gray-400">Select what kind of digital product you are selling.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {types.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setType(t.id)}
                        className={`p-6 rounded-2xl border-2 text-left transition-all group ${type === t.id
                                ? "border-red-500 bg-red-500/10"
                                : "border-white/5 bg-[#0a0a0c] hover:border-red-500/50 hover:bg-white/5"
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${type === t.id ? "bg-red-500 text-white" : "bg-white/5 text-gray-400 group-hover:text-white"
                            }`}>
                            <t.icon size={24} />
                        </div>
                        <div className={`font-bold text-lg mb-1 ${type === t.id ? "text-red-500" : "text-white"}`}>
                            {t.label}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                            {t.desc}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
