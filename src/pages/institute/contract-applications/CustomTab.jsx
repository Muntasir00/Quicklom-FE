import { ListFilter } from "lucide-react";
import React, { useState } from "react";

export default function CustomTab({ tabs, defaultValue, showFilterButton = true, onTabChange }) {
    // অ্যাক্টিভ ট্যাব ম্যানেজ করার জন্য স্টেট
    const [activeTab, setActiveTab] = useState(defaultValue || tabs[0]?.value);

    const handleTabClick = (value) => {
        setActiveTab(value);
        if (onTabChange) {
            onTabChange(value); // এখানে .value ছাড়াই সরাসরি ভ্যালু পাস করা ভালো
        }
    };

    return (
        <div className="w-full">
            {/* ট্যাব হেডার অংশ */}
            <div className="flex items-center gap-2 mb-4">
                {showFilterButton && (
                    <button className="flex items-center justify-center p-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors shrink-0">
                        <ListFilter size={18} className="text-gray-600" />
                    </button>
                )}

                {/* স্ক্রোলযোগ্য ট্যাব লিস্ট */}
                <div className="relative w-full overflow-x-auto scrollbar-hide select-none">
                    <div className="inline-flex items-center gap-2 p-1 border border-gray-200 rounded-xl bg-white">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.value;

                            return (
                                <button
                                    key={tab.value}
                                    onClick={() => handleTabClick(tab.value)}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-200 whitespace-nowrap rounded-lg
                                        ${isActive
                                        ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm"
                                        : "text-gray-500 hover:bg-gray-50 border border-transparent"
                                    }
                                    `}
                                >
                                    {Icon && <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />}
                                    <span>{tab.label}</span>

                                    {tab.count !== undefined && (
                                        <span className={`
                                            ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-md
                                            ${isActive ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"}
                                        `}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ট্যাব কন্টেন্ট অংশ */}
            <div className="mt-2">
                {tabs.map((tab) => {
                    if (activeTab !== tab.value) return null; // শুধু অ্যাক্টিভ ট্যাবের কন্টেন্ট দেখাবে

                    return (
                        <div key={tab.value} className="animate-in fade-in duration-300">
                            {tab.content || (
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-800">{tab.label}</h3>
                                    <p className="mt-2 text-sm text-gray-500">
                                        {tab.count !== undefined
                                            ? `Showing ${tab.count} item${tab.count !== 1 ? "s" : ""} in ${tab.label}`
                                            : `Showing content for ${tab.label}`}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}