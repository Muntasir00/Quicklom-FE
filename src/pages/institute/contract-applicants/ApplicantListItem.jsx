import React from 'react';
import {
    MoreVertical,
    User,
    FileText,
    Users,
    Check,
    X,
    Mail,
    Calendar, XCircle
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@components/ui/dropdown-menu"; // নিশ্চিত করুন Shadcn UI ইন্সটল আছে
import {Button} from "@components/ui/button";
import {Badge} from "@components/ui/badge";

const ApplicantListItem = ({
                               applicant,
                               getActionButtons,
                               getStatusColor,
                               handleAcceptCandidate,
                               handleRejectCandidate
                           }) => {
    const actions = getActionButtons(applicant);

    // পৃথকভাবে অ্যাকশনগুলো খুঁজে নেওয়া ড্রপডাউন এবং বাটনের জন্য
    const viewProfileAction = actions.find(a => a.props.label === 'View Profile');
    const viewContractsAction = actions.find(a => a.props.label === 'View Contract');
    const viewCandidatesAction = actions.find(a => a.props.label === 'View Candidates');
    const acceptAction = actions.find(a => a.props.label === 'Accept');
    const rejectAction = actions.find(a => a.props.label === 'Reject');

    return (
        <div
            className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 mb-4 transition-all duration-200">
            {/* Top Section: Header & Actions */}
            <div className="flex flex-row justify-between items-start mb-6 gap-2">
                {/* Name and ID */}
                <div className="flex flex-col gap-1 min-w-0">
                    <span
                        className="text-gray-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">#{applicant.id}</span>
                    <h3 className="!text-base  font-medium text-[#2A394B] truncate !mb-0">
                        {applicant.user?.name || applicant.applicant_name || 'Unknown'}
                    </h3>
                </div>

                {/* Status & Menu */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <Badge className={`
                px-2 py-0.5 sm:px-3 sm:py-1 rounded-md border-none capitalize font-bold text-[9px] sm:text-[10px] shadow-none whitespace-nowrap
                ${applicant.status === 'pending' ? 'bg-[#FEF3C7] text-[#D97706]' : 'bg-[#E1F7F3] text-[#10B981]'}
            `}>
                        {applicant.status}
                    </Badge>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"
                                    className="h-8 w-8 bg-gray-50 rounded-md hover:bg-gray-100">
                                <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl">
                            {viewProfileAction && (
                                <DropdownMenuItem onClick={viewProfileAction.props.onClick}
                                                  className="flex gap-2 py-2.5 cursor-pointer text-[#2A394B]">
                                    <User size={18} className="text-gray-500"/> View Profile
                                </DropdownMenuItem>
                            )}
                            {viewContractsAction && (
                                <DropdownMenuItem onClick={viewContractsAction.props.onClick}
                                                  className="flex gap-2 py-2.5 cursor-pointer text-[#2A394B]">
                                    <FileText size={18} className="text-gray-500"/> View Contracts
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator className="my-1 bg-gray-100"/>
                            {viewCandidatesAction && (
                                <DropdownMenuItem onClick={viewCandidatesAction.props.onClick}
                                                  className="flex gap-2 py-2.5 cursor-pointer text-[#2A394B]">
                                    <Users size={18} className="text-gray-500"/> View Candidates
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Bottom Section: Details Grid & Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-4 items-end">

                {/* Detail: Contract Type */}
                <div className="flex flex-col min-w-0">
                    <span className="text-xs text-[#6B7280] uppercase  mb-1.5 tracking-tight">Contract type</span>
                    <p className="!text-sm font-semibold text-[#2D8FE3] hover:underline cursor-pointer truncate !mb-0">
                        {applicant.contract?.contract_type?.contract_name || 'N/A'}
                    </p>
                </div>

                {/* Detail: Email */}
                <div className="flex flex-col min-w-0">
                    <span className="text-xs text-[#6B7280] uppercase  mb-1.5 tracking-tight">Email</span>
                    <p className="!text-sm text-[#4B5563] truncate break-all font-medium !mb-0">
                        {applicant.applicant_email || applicant.email || applicant.user?.email || 'No email'}
                    </p>
                </div>

                {/* Detail: Applied Date */}
                <div className="flex flex-col min-w-0">
                    <span className="text-xs text-[#6B7280] uppercase  mb-1.5 tracking-tight">Applied</span>
                    <p className="!text-sm text-[#4B5563] font-medium !mb-0">
                        {applicant.applied_at ? new Date(applicant.applied_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        }) : 'N/A'}
                    </p>
                </div>

                {/* Action Buttons Section */}
                <div className="flex flex-row items-center justify-start lg:justify-end gap-2 mt-2 lg:mt-0">
                    {applicant.status === 'pending' ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={rejectAction?.props.onClick}
                                disabled={rejectAction?.props.disabled}
                                className="flex-1 lg:flex-none justify-center rounded-lg border-none bg-red-50 text-red-500 hover:bg-red-100 h-10 lg:h-9 px-4 flex gap-2 font-bold text-sm transition-colors"
                            >
                                <XCircle className="h-4 w-4 text-red-600  shrink-0"/>
                                Reject
                            </Button>

                            <Button
                                onClick={acceptAction?.props.onClick}
                                disabled={acceptAction?.props.disabled}
                                className="flex-1 lg:flex-none justify-center rounded-lg bg-[#E1F7F3] text-[#10B981] hover:bg-[#d4f2ec] h-10 lg:h-9 px-4 flex gap-2 font-bold shadow-none border-none text-sm transition-colors"
                            >
                                <Check className="h-4 w-4 bg-[#10B981] text-white rounded-full p-0.5 shrink-0"/>
                                Accept
                            </Button>
                        </>
                    ) : (
                        <div className="flex flex-row gap-2 w-full lg:w-auto">
                            <Button variant="outline" onClick={viewContractsAction?.props.onClick}
                                    className="flex-1 lg:flex-none bg-[#F0F7FF] text-[#2D8FE3] border-none hover:bg-blue-100 h-10 lg:h-9 px-4 flex gap-2 font-bold text-xs">
                                <FileText className="h-4 w-4"/> View Contracts
                            </Button>
                            <Button variant="outline" onClick={viewProfileAction?.props.onClick}
                                    className="flex-1 lg:flex-none bg-[#F0F7FF] text-[#2D8FE3] border-none hover:bg-blue-100 h-10 lg:h-9 px-4 flex gap-2 font-bold text-xs">
                                <User className="h-4 w-4"/> View Profile
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApplicantListItem;