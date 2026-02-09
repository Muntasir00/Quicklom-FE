import React from "react";
import {Link} from "react-router-dom";
import {
    MapPin,
    Calendar,
    Clock,
    User2,
    CalendarCheck,
    MoreVertical
} from "lucide-react";
import {IconButton, Tooltip} from "@mui/material";
import {Visibility, Cancel} from "@mui/icons-material";
import {Button} from "@components/ui/button.jsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@components/ui/dropdown-menu.jsx";

const WorkCard = ({job, actions, showActions = true}) => {
    const c = job?.raw; // original contract (যদি দরকার হয়)

    const canCancel = c?.status !== "booked"; // টেবিলের মতো

    return (
        <div
            className=" border border-[#D1D5DB] rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            {/* top accent */}
            <div className="flex justify-between items-start mb-3 flex-wrap">
                <div className="space-y-2">
                    <h3 className="text-[#194185] font-medium text-[16px] leading-tight tracking-tight !mb-0">
                        {job.title || "Registered Nurse"}
                    </h3>
                    <p className=" font-semibold text-xs">
                        {job.hospital || "City General Hospital"}
                    </p>
                </div>

                {/* Starting Soon Badge */}
                <div className="flex justify-end flex-wrap gap-2">
                    {job?.urgencyText && (
                        <div className="bg-[#FAF4DE] border border-[#FFEDD5] px-3 py-2 rounded-md">
                        <span className="text-[#E08913] text-xs whitespace-nowrap">
                          {job.urgencyText}
                        </span>
                        </div>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="p-0 h-8 w-8 !rounded-md bg-[#F3F4F6] cursor-pointer">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-6 w-6 text-[#2A394B]"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    actions?.onViewDetails?.();
                                }}
                            >
                                View Details
                            </DropdownMenuItem>
                            {actions?.redirectInfo && (
                                <>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem className="cursor-pointer">
                                        <Link
                                            to={actions.redirectInfo.link}
                                        >
                                            {actions.redirectInfo.label}
                                        </Link>
                                    </DropdownMenuItem>
                                </>
                            )}
                            {canCancel && (
                                <>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            actions?.onCancel?.();
                                        }}
                                    >
                                        Cancel
                                    </DropdownMenuItem>
                                </>
                            )
                            }
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="space-y-[10px]">
                <div className="flex items-center gap-1 text-[#374151]">
                    <MapPin className="w-4 h-4  shrink-0"/>
                    <span className="text-xs">{job.location || "San Francisco, CA"}</span>
                </div>

                <div className="flex items-center gap-1 text-[#374151]">
                    <Calendar className="w-4 h-4  shrink-0"/>
                    <span className="text-xs">{job?.dateRange}</span>
                </div>

                {job.shift !== "-" && <div className="flex items-center gap-1 text-[#374151]">
                    <Clock className="w-4 h-4  shrink-0"/>
                    <span className="text-xs">{job.shift || "Day Shift (7am - 7pm)"}</span>
                </div>}

                <div className="flex items-center gap-3">
                    {job?.assignedProfessional ? (
                        <div className="flex items-center gap-2 text-xs">
                            <User2 className="w-4 h-4 shrink-0"/>
                            <span className="line-clamp-1">{job.assignedProfessional}</span>
                        </div>
                    ) : (
                        <div
                            className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 inline-flex">
                            Unassigned
                        </div>
                    )}

                    <div
                        className="text-xs font-semibold border border-amber-100 rounded-lg px-3 py-2 inline-flex items-center gap-2 capitalize"
                        style={{color: job?.raw?.status_display?.color}}
                    >
                        <CalendarCheck className="w-5 h-5"/>
                        {job?.raw?.status}
                    </div>

                </div>

            </div>
        </div>
    );
};

export default WorkCard;
