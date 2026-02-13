import { Plus, Trash2, HelpCircle } from "lucide-react";

interface StepContentProps {
    type: string;
    customFields: any[];
    setCustomFields: (fields: any[]) => void;
    content: string;
    setContent: (content: string) => void;
}

export function StepContent({ type, customFields, setCustomFields, content, setContent }: StepContentProps) {

    const addCustomField = () => {
        setCustomFields([...customFields, { label: "", required: true, type: "text" }]);
    };

    const updateCustomField = (index: number, field: string, value: any) => {
        const newFields = [...customFields];
        newFields[index] = { ...newFields[index], [field]: value };
        setCustomFields(newFields);
    };

    const removeCustomField = (index: number) => {
        setCustomFields(customFields.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Configure Content</h3>
                <div className="inline-block px-3 py-1 rounded bg-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider">
                    Type: {type}
                </div>
            </div>

            {/* Content Delivery */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#0a0a0c]">
                {/* Custom Fields - Available for ALL types now */}
                <div className="mb-8 border-b border-white/5 pb-8">
                    <div className="flex justify-between mb-4">
                        <div>
                            <h4 className="text-sm font-bold text-white uppercase tracking-widest">Custom Input Fields</h4>
                            <p className="text-xs text-gray-500 mt-1">Collect information from the customer at checkout.</p>
                        </div>
                        <button
                            onClick={addCustomField}
                            type="button"
                            className="text-xs font-bold text-green-500 hover:text-green-400 flex items-center gap-1 transition-colors"
                        >
                            <Plus size={14} /> Add Field
                        </button>
                    </div>

                    {customFields.length === 0 ? (
                        <div className="text-center py-6 border-2 border-dashed border-white/5 rounded-xl text-gray-500 text-sm">
                            <p>No custom fields added.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {customFields.map((field, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                    <input
                                        value={field.label}
                                        onChange={(e) => updateCustomField(idx, 'label', e.target.value)}
                                        className="flex-1 bg-transparent border-none text-sm text-white focus:ring-0 placeholder-gray-500"
                                        placeholder="Field label (e.g. Game ID, Email)"
                                    />
                                    <div className="flex items-center gap-2 border-l border-white/10 pl-3">
                                        <input
                                            type="checkbox"
                                            checked={field.required}
                                            onChange={(e) => updateCustomField(idx, 'required', e.target.checked)}
                                            className="rounded bg-black border-white/20 text-green-500 focus:ring-0 w-4 h-4 cursor-pointer"
                                        />
                                        <span className="text-xs text-gray-400">Required</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeCustomField(idx)}
                                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Digital Content - For types that deliver something */}
                {type !== "Service" && (
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                {type === "Instant Serial" ? "Paste Keys / Serials" :
                                    type === "Account" ? "Accounts (User:Pass)" :
                                        "Downloadable Content / Link"}
                            </label>
                        </div>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700 h-48 resize-none font-mono text-sm"
                            placeholder={
                                type === "Instant Serial" ? "Key1\nKey2\nKey3..." :
                                    type === "Account" ? "user1:pass1\nuser2:pass2..." :
                                        "Enter download link or secure content..."
                            }
                        />
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <HelpCircle size={12} />
                            {type === "Instant Serial" || type === "Account" ? "Separate each item with a new line. One item will be delivered per order." : "This content will be delivered instantly after purchase."}
                        </p>
                    </div>
                )}

                {/* Service Note */}
                {type === "Service" && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        <p>Services are processed manually.</p>
                        <p className="text-xs mt-1">Make sure to add Custom Fields above to get necessary details from the buyer.</p>
                    </div>
                )}
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#0a0a0c]">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Thank You Note / Extra Message</label>
                <textarea
                    className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700 h-24 resize-none text-sm"
                    placeholder="Message to display after purchase (optional)..."
                />
            </div>
        </div>
    );
}
