import {useMemo} from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table';
import {
    ArrowUpDown,
    Eye,
    ChevronLeft,
    ChevronRight,
    Download,
    Send,
    PenTool,
    DollarSign,
    Info
} from 'lucide-react';

const AgreementTable = ({
                            data,
                            currentUser,
                            onSign,
                            onPreview,
                            onDownload,
                            onContractClick,
                            AgreementService
                        }) => {

    const columns = useMemo(() => [
        {
            accessorKey: 'agreement_number',
            header: 'Agreement #',
            cell: info => <span className="font-medium text-slate-900">{info.getValue()}</span>
        },
        {
            accessorKey: 'contract_id',
            header: 'Contract',
            cell: info => {
                const agreement = info.row.original;
                return (
                    <div className="flex flex-col">
                        <button
                            onClick={() => onContractClick(agreement)}
                            className="text-[#2D8FE3] font-bold hover:underline text-sm text-left"
                        >
                            #{agreement.contract_id}
                        </button>
                        <span className="text-[11px] text-slate-400 font-medium leading-none">
                            {agreement.contract_type?.industry || agreement.contract_type?.name || 'N/A'}
                        </span>
                    </div>
                );
            }
        },
        {
            accessorKey: 'agreement_data.job.title',
            header: 'Position',
            cell: info => <span className="text-slate-700 font-medium">{info.getValue() || 'N/A'}</span>
        },
        {
            id: 'you',
            header: 'You',
            cell: info => {
                const myRole = AgreementService.getMyRole(info.row.original, currentUser?.id);
                const isPublisher = myRole === 'client';
                return (
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                        isPublisher
                            ? 'bg-[#EEF7FF] text-[#2D8FE3] border-[#DBEEFF]'
                            : 'bg-[#E1F7F3] text-[#19B28A] border-[#C3EFDB]'
                    }`}>
                        {isPublisher ? 'Publisher' : 'Applicant'}
                    </span>
                );
            }
        },
        {
            id: 'other_party',
            header: 'Other Party',
            cell: info => {
                const agreement = info.row.original;
                const myRole = AgreementService.getMyRole(agreement, currentUser?.id);
                const name = myRole === 'client'
                    ? (agreement.agreement_data?.agency?.name || 'N/A')
                    : (agreement.agreement_data?.client?.name || 'N/A');
                return (
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 text-sm">{name}</span>
                        <span className="text-[11px] text-slate-400 font-medium">
                            ({myRole === 'client' ? 'Applicant' : 'Publisher'})
                        </span>
                    </div>
                );
            }
        },
        {
            id: 'status',
            header: 'Status',
            cell: info => (
                <span className="text-slate-700 text-[13px] leading-tight block max-w-[220px]">
                    {AgreementService.getStatusText(info.row.original.status, info.row.original, currentUser?.id)}
                </span>
            )
        },
        {
            accessorKey: 'created_at',
            header: 'Created',
            cell: info => (
                <span className="text-slate-600 whitespace-nowrap text-sm">
                    {AgreementService.formatDate(info.getValue())}
                </span>
            )
        },
        {
            id: 'actions',
            header: 'Action',
            size: 200,
            cell: info => {
                const agreement = info.row.original;
                const myRole = AgreementService?.getMyRole(agreement, currentUser?.id);
                const needsFeesInput = AgreementService?.requiresFeesInput(agreement, currentUser?.id);
                console.log(agreement.id)
                console.log(agreement.agreement_number)
                return (
                    <div className="flex items-center gap-2 justify-start">
                        <ActionButton
                            agreement={agreement}
                            myRole={myRole}
                            needsFeesInput={needsFeesInput}
                            onAction={() => onSign(agreement.id)}
                            onDownload={() => onDownload(agreement.id, agreement.agreement_number)}
                        />
                        <button
                            onClick={() => onPreview(agreement)}
                            className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                            <Eye size={18} strokeWidth={1.5}/>
                        </button>
                    </div>
                );
            }
        }
    ], [currentUser, AgreementService, onSign, onPreview, onDownload, onContractClick]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="flex flex-col w-full bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#E5E7EB]/50 border-b border-slate-200">
                    {table.getHeaderGroups().map(header => {
                        const showSortIcon = header.id !== 'agreement_number' && header.id !== 'actions';
                        return (
                            <th key={header.id}
                                className="px-4 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-tight">
                                <div className="flex items-center gap-1">
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {showSortIcon && (
                                        <ArrowUpDown size={14} className="text-slate-400 opacity-70"/>
                                    )}
                                </div>
                            </th>
                        );
                    })}
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id} className="px-4 py-4 align-middle">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>Showing</span>
                    <select
                        className="border border-slate-200 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                        value={table.getState().pagination.pageSize}
                        onChange={e => table.setPageSize(Number(e.target.value))}
                    >
                        {[10, 20, 50].map(pageSize => (
                            <option key={pageSize} value={pageSize}>{pageSize}</option>
                        ))}
                    </select>
                    <span>of {data.length} Entries</span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="flex items-center gap-1 text-sm font-medium text-slate-600 disabled:opacity-30 hover:text-slate-900"
                    >
                        <ChevronLeft size={18}/> Previous
                    </button>
                    <div className="flex items-center gap-1">
                        {[...Array(table.getPageCount())].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => table.setPageIndex(i)}
                                className={`h-8 w-8 rounded text-sm font-bold transition-all ${
                                    table.getState().pagination.pageIndex === i
                                        ? 'bg-[#EEF7FF] text-[#2D8FE3] border border-[#DBEEFF]'
                                        : 'text-slate-500 hover:bg-slate-50'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="flex items-center gap-1 text-sm font-medium text-slate-600 disabled:opacity-30 hover:text-slate-900"
                    >
                        Next <ChevronRight size={18}/>
                    </button>
                </div>
            </div>
        </div>
    );
};

// ActionButton এর ভেতরে FontAwesome এর বদলে Lucide ব্যবহার করুন (ভালো প্র্যাকটিস)
const ActionButton = ({ agreement, myRole, needsFeesInput, onAction, onDownload }) => {
    const baseClass = "h-9 w-[140px] flex items-center justify-center text-[11px] font-bold rounded-lg shadow-sm px-2 transition-colors whitespace-nowrap cursor-pointer border-none outline-none";

    // ১. PUBLISHER (client) লজিক
    if (myRole === 'client') {
        if (agreement.status === 'draft') {
            return (
                <button type="button" onClick={(e) => { e.stopPropagation(); onAction(); }} className={`${baseClass} bg-[#2D8FE3] text-white hover:bg-blue-600`}>
                    <Send size={14} className="mr-1" /> Pick & Send
                </button>
            );
        }
        if (!agreement.agency_signed && agreement.status !== 'fully_signed') {
            return (
                <button type="button" onClick={(e) => { e.stopPropagation(); onAction(); }} className={`${baseClass} bg-slate-100 text-slate-500 border border-slate-200`}>
                    <Info size={14} className="mr-1" /> Waiting
                </button>
            );
        }
        if (agreement.agency_signed && !agreement.client_signed) {
            return (
                <button type="button" onClick={(e) => { e.stopPropagation(); onAction(); }} className={`${baseClass} bg-[#19B28A] text-white hover:bg-emerald-600`}>
                    <PenTool size={14} className="mr-1" /> Review & Sign
                </button>
            );
        }
    }

    // ২. APPLICANT (agency) লজিক
    else if (myRole === 'agency') {
        if (needsFeesInput) {
            return (
                <button type="button" onClick={(e) => { e.stopPropagation(); onAction(); }} className={`${baseClass} bg-[#F0A33A] text-white hover:bg-orange-500`}>
                    <DollarSign size={14} className="mr-1" /> Fee & Sign
                </button>
            );
        }
        if (!agreement.agency_signed) {
            return (
                <button type="button" onClick={(e) => { e.stopPropagation(); onAction(); }} className={`${baseClass} bg-[#19B28A] text-white hover:bg-emerald-600`}>
                    <PenTool size={14} className="mr-1" /> Sign
                </button>
            );
        }
        if (agreement.agency_signed && !agreement.client_signed) {
            return (
                <button type="button" onClick={(e) => { e.stopPropagation(); onAction(); }} className={`${baseClass} bg-slate-100 text-slate-500 border border-slate-200`}>
                    <Info size={14} className="mr-1" /> Waiting
                </button>
            );
        }
    }

    // ৩. Fully Signed (Download)
    if (agreement.status === 'fully_signed') {
        return (
            <button type="button" onClick={(e) => { e.stopPropagation(); onDownload(); }} className={`${baseClass} bg-[#19B28A] text-white hover:bg-emerald-600`}>
                <Download size={14} className="mr-1" /> Download PDF
            </button>
        );
    }

    return null;
};
export default AgreementTable;