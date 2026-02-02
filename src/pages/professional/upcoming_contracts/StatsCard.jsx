import { MoreHorizontal, TrendingUp, TrendingDown } from "lucide-react";

export function StatsCard({ title, value, percentage, subText, isNegative = false }) {
    return (
        <div className="bg-[#F3F9FE] p-3 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-[#2A394B] text-sm font-semibold">{title}</span>
                </div>
                <button className="text-slate-400 hover:bg-slate-50 p-1 rounded-md transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            <div className="flex items-end gap-3 mb-2 bg-white p-3 rounded-xl">
                <h2 className="text-[32px] font-medium text-[#2A394B] leading-none !mb-0">{value}</h2>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
                    isNegative ? 'bg-red-50 text-red-500' : 'bg-[#F1F9F8] text-emerald-500'
                }`}>
                    {isNegative ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                    {percentage}%
                </div>
            </div>

            <p className="text-[#374151] text-xs font-medium">{subText}</p>
        </div>
    );
}