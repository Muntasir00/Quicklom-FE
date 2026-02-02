import { Card } from "@components/ui/card.jsx"
import { Badge } from "@components/ui/badge.jsx"
import { Button } from "@components/ui/button.jsx"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@components/ui/dropdown-menu.jsx"
import { MoreVertical, FileText, CircleX } from "lucide-react"

export default function ApplicantCard({
                                          index,
                                          title,
                                          contractValue,
                                          appliedDate,
                                          startDate,
                                          status,
                                          onViewDetails,
                                          onWithdraw,
                                      }) {
    // স্ট্যাটাস অনুযায়ী ডাইনামিক স্টাইল
    const statusStyles = {
        pending: "bg-[#FBF1E7] text-[#F36B2D] border-none",
        accepted: "bg-green-100 text-green-600 border-none",
        rejected: "bg-red-100 text-red-600 border-none",
        booked: "bg-blue-100 text-blue-600 border-none",
    }

    return (
        <Card className="w-full p-4 border border-gray-200 rounded-lg">
            <div className="flex flex-col gap-4">

                {/* Header: Index, Status and More */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 font-medium">#{index}</span>
                    <div className="flex items-center gap-2">
                        <Badge className={`capitalize px-3 py-1 text-xs font-semibold rounded-md ${statusStyles[status?.toLowerCase()] || statusStyles.pending}`}>
                            {status}
                        </Badge>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0 hover:bg-gray-100 outline-none">
                                    <MoreVertical className="h-4 w-4 text-gray-500" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem className="cursor-pointer">Report Issue</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-[#2A394B] -mt-2">
                    {title}
                </h3>

                {/* Data Row and Buttons */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                    {/* Metrics Section */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 flex-1">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-tight">Contract value</span>
                            <span className="text-sm font-bold text-[#2D8FE3]">
                                {contractValue ? `$ ${Number(contractValue).toLocaleString()}` : "N/A"}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-tight">Applied</span>
                            <span className="text-sm font-semibold text-gray-600">{appliedDate}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-tight">Starts from</span>
                            <span className="text-sm font-semibold text-gray-600">{startDate}</span>
                        </div>
                    </div>

                    {/* Action Buttons Section */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            className="h-11 px-4 text-[#2D8FE3] border-[#2D8FE3] bg-[#DBEEFF]/30 hover:bg-[#DBEEFF] hover:text-[#2D8FE3] rounded-lg font-semibold flex gap-2"
                            onClick={onViewDetails}
                        >
                            <FileText className="h-4 w-4" />
                            Contract details
                        </Button>
                        <Button
                            variant="outline"
                            className="h-11 px-4 text-[#ED354A] border-[#ED354A]/20 bg-[#FCF1F1] hover:bg-[#FCF1F1] hover:text-[#ED354A] rounded-lg font-semibold flex gap-2"
                            onClick={onWithdraw}
                        >
                            <CircleX className="h-4 w-4" />
                            Withdraw Application
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    )
}