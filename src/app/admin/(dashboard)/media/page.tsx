"use client";

import { useEffect, useState } from "react";
import { Upload, Trash2, FileIcon, Copy, Loader2, Check } from "lucide-react";

interface MediaFile {
    name: string;
    url: string;
    size: number;
    createdAt: string;
    type: "image" | "video";
}

export default function MediaLibraryPage() {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    // Fetch files on mount
    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/media");
            if (!res.ok) throw new Error("Failed to fetch media");
            const data = await res.json();
            setFiles(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            // Refresh list
            await fetchFiles();
        } catch (error) {
            console.error(error);
            alert("Failed to upload file");
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = "";
        }
    };

    const handleDelete = async (filename: string) => {
        if (!confirm("Are you sure you want to delete this file?")) return;

        try {
            const res = await fetch(`/api/media?filename=${filename}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Delete failed");

            // Remove from state locally for instant feedback
            setFiles((prev) => prev.filter((f) => f.name !== filename));
        } catch (error) {
            console.error(error);
            alert("Failed to delete file");
        }
    };

    const copyToClipboard = (url: string) => {
        const fullUrl = window.location.origin + url;
        navigator.clipboard.writeText(fullUrl);
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Media Library</h1>
                    <p className="text-gray-400 mt-2">Manage your images and videos.</p>
                </div>

                {/* Upload Button */}
                <label className={`
                    flex items-center gap-3 px-6 py-3 bg-red-600 hover:bg-red-700 
                    text-white font-bold rounded-xl cursor-pointer transition-all
                    ${uploading ? "opacity-50 cursor-not-allowed" : ""}
                `}>
                    {uploading ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
                    <span>{uploading ? "Uploading..." : "Upload New"}</span>
                    <input
                        type="file"
                        className="hidden"
                        onChange={handleUpload}
                        disabled={uploading}
                        accept="image/*,video/*"
                    />
                </label>
            </div>

            {/* Gallery Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-red-600" size={40} />
                </div>
            ) : files.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-3xl">
                    <FileIcon size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">No media files found. Upload some!</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {files.map((file) => (
                        <div key={file.name} className="group relative bg-[#111] border border-white/5 rounded-2xl overflow-hidden hover:border-red-600/50 transition-all">

                            {/* Preview */}
                            <div className="aspect-square bg-black flex items-center justify-center relative">
                                {file.type === "image" ? (
                                    <img
                                        src={file.url}
                                        alt={file.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <video
                                        src={file.url}
                                        className="w-full h-full object-cover"
                                        muted
                                        loop
                                        onMouseOver={(e) => e.currentTarget.play()}
                                        onMouseOut={(e) => e.currentTarget.pause()}
                                    />
                                )}

                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button
                                        onClick={() => copyToClipboard(file.url)}
                                        className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-colors"
                                        title="Copy URL"
                                    >
                                        {copiedUrl === file.url ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(file.name)}
                                        className="p-3 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white rounded-full backdrop-blur-sm transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-4">
                                <p className="text-sm font-medium text-gray-200 truncate" title={file.name}>
                                    {file.name}
                                </p>
                                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                                    <span>{(file.size / 1024).toFixed(1)} KB</span>
                                    <span className="uppercase">{file.type}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
