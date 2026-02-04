import React from 'react';
import {FileText, MoreVertical, XCircle, Users} from "lucide-react";
import {CONTRACT_APPLICATION_STATUS} from "@constants/ContractApplicationConstants";

const ApplicationCard = ({
                             application,
                             handleShowModal,
                             handleViewCandidates,
                             handleWithdraw,
                             formatCurrency, // From your View.jsx helpers
                             formatDate     // From your View.jsx helpers
                         }) => {
    const contract = application.contract;
    const contractTitle = contract?.data?.job_title || contract?.contract_type?.contract_name || 'Untitled Contract';
    const candidatesCount = application.additional_information?.length || 0;

    // Values for the metric section
    const contractValue = contract?.data?.contract_value || 0;
    const appliedDate = application.applied_at ? formatDate(application.applied_at) : 'N/A';
    const startDate = contract?.start_date ? formatDate(contract.start_date) : 'N/A';

    return (
        <div
            className="border border-gray-200 rounded-xl mt-3 p-3 bg-white shadow-sm hover:shadow-md transition-shadow group">
            {/* Header: ID and Status */}
            <div className="flex justify-between items-center flex-wrap gap-5 mb-2">
                <p className="text-gray-400 text-sm font-medium">#{application.id}</p>
                <div className="flex items-center gap-2">
                    <span
                        className="bg-[#FBF1E7] text-[#F36B2D] px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-orange-100">
                        {application.status || 'Pending'}
                    </span>
                    <button className="text-[#2A394B] bg-[#F3F4F6] p-1 rounded-lg hover:bg-gray-200 transition-colors">
                        <MoreVertical size={20}/>
                    </button>
                </div>
            </div>

            {/* Content: Title */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 w-full">
                <div className="flex-1">
                    <h3 className="!text-base font-medium text-[#2A394B] leading-tight">
                        {contractTitle}
                    </h3>
                </div>
            </div>

            {/* Footer: Metrics and Actions */}
            <div className="flex justify-between items-center flex-wrap gap-6">
                {/* Metrics Group */}
                <div className="flex flex-wrap gap-8 md:gap-12">
                    <div>
                        <p className="text-xs text-[#6B7280] mb-1">Contract value</p>
                        <p className="text-sm font-medium text-[#2D8FE3]">
                            {contractValue > 0 ? formatCurrency(contractValue) : '$ 0.00'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-[#6B7280] mb-1">Applied</p>
                        <p className="text-sm font-medium text-[#2A394B]">{appliedDate}</p>
                    </div>
                    <div>
                        <p className="text-xs text-[#6B7280] mb-1">Starts from</p>
                        <p className="text-sm font-medium text-[#2A394B]">{startDate}</p>
                    </div>
                </div>

                {/* Button Group */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 w-full lg:w-auto">
                    {/* View Candidates (If exists) */}
                    {candidatesCount > 0 && (
                        <button
                            onClick={() => handleViewCandidates(application)}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-[2px] border-indigo-100 text-indigo-600 bg-indigo-50 font-medium text-sm transition-colors"
                        >
                            <Users size={16}/>
                            {candidatesCount} Candidates
                        </button>
                    )}

                    <button
                        onClick={() => handleShowModal(application.contract_id, contract?.contract_type?.contract_name)}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-[2px] border-[#BDD7ED] text-[#2D8FE3] bg-[#EAF5FE] font-medium text-sm transition-all hover:bg-[#dbeafe]"
                    >
                        <FileText size={16}/>
                        Contract details
                    </button>

                    {/* Show Withdraw button if not already processed */}
                    {application.status !== CONTRACT_APPLICATION_STATUS.WITHDRAWN && application.status !== 'rejected' && (
                        <button
                            onClick={(e) => handleWithdraw(e)}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-[2px] border-red-200 text-[#ED354A] bg-[#FCF1F1] font-medium text-sm transition-all hover:bg-[#fdeaea]"
                        >
                            <XCircle size={16}/>
                            Withdraw Application
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApplicationCard;