import {useMemo, useState} from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table';
import {
    Eye, ChevronLeft, ChevronRight,
    Info, ChevronsUpDown, ArrowDownUpIcon
} from "lucide-react";
import {Badge} from "@components/ui/badge";
import {Button} from "@components/ui/button";

// eslint-disable-next-line react/prop-types
const AgreementTable = ({data, handleSignAgreement, handleDownloadPDF, handlePreviewAgreement, navigate}) => {
    const [sorting, setSorting] = useState([]);

    const columns = useMemo(() => [
        {
            accessorKey: 'agreement_number',
            header: 'Agreement #',
            cell: info => <span className="text-sm text-[#2A394B]">{info.getValue()}</span>,
        },
        {
            accessorKey: 'contract_id',
            header: 'Contract',
            cell: ({row}) => (
                <div className="flex flex-col">
                    <button
                        onClick={() => navigate(`/professional/contract-applications`)}
                        className="text-[#2D8FE3] text-sm font-bold underline text-left"
                    >
                        #{row.original.contract_id}
                    </button>
                    <span className="text-[10px] text-[#9CA3AF]">
                        {row.original.contract_type?.industry || 'General Medicine'}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: 'agreement_data.job.title',
            header: 'Position',
            cell: info => <span className="text-[#2A394B] font-normal text-sm">{info.getValue() || 'N/A'}</span>,
        },
        {
            id: 'you',
            header: 'You',
            cell: ({row}) => (
                <Badge className="bg-[#E1F7F3] text-[#19B28A] border-none px-2 py-[3px] rounded-lg text-[12px]">
                    Applicant
                </Badge>
            ),
        },
        {
            id: 'other_party',
            header: 'Other Party',
            cell: ({row}) => (
                <div className="flex flex-col">
                    <span
                        className="text-sm text-[#2A394B]">{row.original.agreement_data?.client?.name || 'headhunter 1'}</span>
                    <span className="text-[10px] text-[#9CA3AF]">(Publisher)</span>
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: info => <span
                className="text-[#2A394B] text-sm leading-tight block max-w-[150px]">{info.getValue()?.replace(/_/g, ' ')}</span>,
        },
        {
            accessorKey: 'created_at',
            header: 'Created',
            cell: info => <span
                className="text-[#2A394B] text-sm">{new Date(info.getValue()).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })}</span>,
        },
        {
            id: 'actions',
            header: 'Action',
            cell: ({row}) => {
                const ag = row.original;
                // আপনার বিদ্যমান লজিক
                const needsFees = ag.status === 'pending_fees' || (ag.agency_signed === false && ag.client_signed === true);
                const fullySigned = ag.status === 'fully_signed';

                return (
                    <div className="flex items-center gap-2">
                        {needsFees ? (
                            <Button
                                onClick={() => handleSignAgreement(ag.id)}
                                className="bg-[#F0A33A] hover:bg-[#D97706] text-white text-[12px] font-bold py-[10px] px-2 !rounded-lg"
                            >
                                Enter Fee & Sign
                            </Button>
                        ) : fullySigned ? (
                            <Button
                                onClick={() => handleDownloadPDF(ag.id)}
                                className="bg-[#19B28A] hover:bg-[#059669] text-white text-[12px] font-bold py-[10px] px-2 !rounded-lg"
                            >
                                Download PDF
                            </Button>
                        ) : (
                            <Button
                                className="bg-[#2D8FE3] hover:bg-[#2579C1] text-white text-[12px] font-bold py-[10px] px-2 !rounded-lg"
                            >
                                Pick & Send
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePreviewAgreement(ag)}
                            className="p-2 bg-[#F3F4F6] hover:bg-slate-200 text-[#2A394B] !rounded-lg"
                        >
                            <Eye className="w-4 h-4 text-[#2A394B]"/>
                        </Button>
                    </div>
                );
            },
        }
    ], [navigate]);

    const table = useReactTable({
        data,
        columns,
        state: {sorting},
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="w-full space-y-4">
            {/* Table Container */}
            <div className="bg-white rounded-xl border border-[#E6E6EB] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1100px]">
                        <thead className="bg-[#F8FAFC] border-b border-[#E6E6EB]">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id}
                                        className="py-2 px-3 text-sm font-semibold text-[#4B5563] bg-[#E5E7EB]">
                                        <div
                                            className={`flex items-center gap-1 ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''}`}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getCanSort() &&
                                                <ArrowDownUpIcon className="w-4 h-4 text-[#2A394B]"/>}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                        </thead>
                        <tbody className="divide-y divide-[#E6E6EB]">
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="px-3 py-2 align-middle">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Section (ছবির মতো) */}
                <div className="p-2 flex items-center justify-between border border-[#E9E8E8] bg-white">
                    <div className="flex items-center gap-2 text-[13px] text-slate-500 font-medium">
                        Showing
                        <select
                            value={table.getState().pagination.pageSize}
                            onChange={e => table.setPageSize(Number(e.target.value))}
                            className="bg-white border border-[#E6E6EB] rounded-lg px-2 py-1 font-bold text-slate-700 outline-none cursor-pointer"
                        >
                            {[10, 20, 50].map(pageSize => (
                                <option key={pageSize} value={pageSize}>{pageSize}</option>
                            ))}
                        </select>
                        of 1000 Entries
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="flex items-center gap-1 text-[13px] font-semibold text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        >
                            <ChevronLeft className="w-4 h-4"/> Previous
                        </button>

                        <div className="flex items-center gap-1 mx-2">
                            <button className="w-9 h-9 rounded-lg text-[13px] font-bold text-slate-400">1</button>
                            <span className="text-slate-300">...</span>
                            <button
                                className="w-10 h-10 rounded-xl border border-[#E6E6EB] bg-white text-slate-700 font-bold shadow-sm">10
                            </button>
                        </div>

                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="flex items-center gap-1 text-[13px] font-semibold text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        >
                            Next <ChevronRight className="w-4 h-4"/>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Commission Info (ছবির মতো) */}
            <div className="bg-[#EBF5FF] border border-[#BFDBFE] rounded-xl p-2 flex items-start gap-3 mt-6">
                <div className="bg-white rounded-full p-1 border border-blue-200">
                    <Info className="w-4 h-4 text-[#2D8FE3]"/>
                </div>
                <p className="text-[13px] leading-relaxed text-slate-600">
                    <span className="font-bold text-[#2D8FE3]">Commission Structure</span> QuickLocum charges a
                    simple <span className="font-bold text-slate-800">10% commission</span> on direct hire contract
                    values, plus a <span className="font-bold text-slate-800">$20 service fee</span> per booked
                    contract. Agencies and headhunters also have a <span className="font-bold text-slate-800">$300/month subscription</span> that
                    activates after the 2nd booked contract of the month.
                </p>
            </div>
        </div>
    );
};

export default AgreementTable;