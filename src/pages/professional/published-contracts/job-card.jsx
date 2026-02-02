import {Card} from "@components/ui/card.jsx"
import {Badge} from "@components/ui/badge.jsx"
import {Check, MoreVertical, SendHorizontal} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@components/ui/dropdown-menu.jsx"

export function JobCard({job, onViewDetails, onApply}) {
    // স্ট্যাটাস অনুযায়ী ডাইনামিক কালার (ছবির সাথে মিলিয়ে)
    const getStatusStyle = (status) => {
        const s = status?.toLowerCase();
        if (s === 'open') return "bg-[#E1F7F3] text-[#19B28A] border-none"; // Greenish
        if (s === 'closed') return "bg-[#E2F2F1] text-[#54A39D] border-none"; // Tealish
        if (s === 'pending') return "bg-[#FBF1E7] text-[#F36B2D] border-none"; // Orange
        return "bg-gray-100 text-gray-600 border-none";
    };

    // ডাটা এক্সট্রাক্ট করা
    const data = job.data || {};
    const contractValue = data.contract_value || data.annual_salary || data.daily_rate;
    const startYear = job.start_date ? new Date(job.start_date).getFullYear() : "N/A";
    const location = data.contract_location || `${data.city}, ${data.province}, ${data.country}`;

    const hasApplied = job.user_application?.has_applied;

    return (
        <Card
            className=" p-3 border border-[#E6E6EB] rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow h-full flex flex-col justify-between">
            <div>
                {/* Header Section */}
                <div className="flex justify-between items-start mb-3">
                    <span className="text-sm text-gray-400 font-medium">#{job.id}</span>
                    <div className="flex items-center gap-1.5">
                        <Badge
                            className={`capitalize px-2.5 py-0.5 text-[11px] font-bold rounded-[6px] ${getStatusStyle(job.status)}`}>
                            {job.status}
                        </Badge>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="outline-none cursor-pointer p-1">
                                    <MoreVertical className="h-4 w-4 text-gray-400"/>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {/* এখানে onClick যোগ করুন */}
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={onViewDetails}
                                >
                                    View Details
                                </DropdownMenuItem>
                                {hasApplied ? (
                                    <DropdownMenuItem disabled
                                                      className="text-green-600 focus:text-green-600 font-medium">
                                        <Check className="w-4 h-4 mr-2"/> Applied
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem className="cursor-pointer text-blue-600" onClick={onApply}>
                                        <SendHorizontal className="w-4 h-4 mr-2"/> Apply Now
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Title & Position */}
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-[#2A394B] leading-snug mb-1">
                        {job.contract_type?.contract_name || "Contract"}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {job.contract_positions?.[0]?.position?.name || "Professional"}
                    </p>
                </div>

                {/* Stats Grid: Value and Start */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="flex flex-col">
                        <span
                            className="text-[11px] text-gray-400 font-medium uppercase tracking-tight">Contract value</span>
                        <span className="text-sm font-bold text-[#2D8FE3]">
                            {contractValue ? `$ ${Number(contractValue).toLocaleString()}` : "Negotiable"}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] text-gray-400 font-medium uppercase tracking-tight">Start</span>
                        <span className="text-sm font-bold text-gray-700">{startYear}</span>
                    </div>
                </div>

                {/* Location Section */}
                <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] text-gray-400 font-medium uppercase tracking-tight">Location</span>
                    <p className="text-[12px] text-gray-600 leading-[1.4] line-clamp-3">
                        {location}
                    </p>
                </div>
            </div>
        </Card>
    );
}