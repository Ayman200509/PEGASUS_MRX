import Link from 'next/link';
import { AlertCircle, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4">
            <div className="text-center space-y-8 max-w-md">
                {/* Error Icon */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
                        <div className="relative w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
                            <AlertCircle size={48} className="text-red-500" />
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                <div className="space-y-4">
                    <h1 className="text-5xl font-black text-white tracking-tight">
                        Page Not Found
                    </h1>
                    <p className="text-lg text-gray-400 leading-relaxed">
                        The page you are looking for does not exist or has been moved.
                    </p>
                </div>

                {/* Return Home Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] group"
                >
                    <Home size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Return Home
                </Link>
            </div>
        </div>
    );
}
