import {useMemo, useState} from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table';
import {
    MoreVertical, ChevronsUpDown, ChevronLeft,
    ChevronRight, Check, SendHorizontal
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@components/ui/dropdown-menu.jsx"
import {Badge} from "@components/ui/badge";

const JobListView = ({data, handleShowModal , onApply}) => {
    const [sorting, setSorting] = useState([]);

    // ১. কলাম ডেফিনিশন (ছবি অনুযায়ী)
    const columns = useMemo(() => [
        {
            accessorKey: 'id',
            header: 'ID',
            cell: info => <span className="text-slate-400 font-medium">#{info.row.index + 1}</span>,
        },
        {
            accessorKey: 'contract_type.contract_name',
            header: 'Contract Type',
            cell: info => <span className="font-bold text-[#2A394B]">{info.getValue()}</span>,
        },
        {
            id: 'position', // accessorKey এর বদলে id ব্যবহার করুন যখন accessorFn দিবেন
            header: 'Position',
            accessorFn: (row) => {
                // ১. চেক করুন contract_positions আছে কি না এবং তা খালি কি না
                if (row.contract_positions && row.contract_positions.length > 0) {
                    // ২. প্রথম পজিশনের নাম রিটার্ন করুন
                    return row.contract_positions[0].position?.name || "N/A";
                }
                return "N/A";
            },
            cell: info => <span className="text-slate-500">{info.getValue()}</span>,
        },
        {
            accessorFn: row => `${row.data.city}, ${row.data.province}`,
            header: 'Location',
            cell: info => <span className="truncate block max-w-[200px]">{info.getValue()}</span>,
        },
        {
            accessorFn: row => row.start_date ? new Date(row.start_date).getFullYear() : "2024",
            header: 'Start',
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: info => {
                const status = info.getValue()?.toLowerCase();
                const style = status === 'open' ? "bg-[#E1F7F3] text-[#19B28A]" : "bg-[#F1F5F9] text-[#64748B]";
                return <Badge
                    className={`px-2.5 py-0.5 rounded-[6px] shadow-none border-none font-bold text-[11px] ${style}`}>{status}</Badge>
            }
        },
        {
            id: 'contractValue', // accessorKey এর বদলে id দিন
            header: 'Contract Value',
            // accessorFn ব্যবহার করলে আমরা optional chaining (?.) ব্যবহার করতে পারি
            accessorFn: (row) => {
                // ডাটা অবজেক্ট এবং তার ভেতর contract_value আছে কি না চেক করা হচ্ছে
                return row.data?.contract_value ?? row.data?.annual_salary ?? row.data?.daily_rate;
            },
            cell: (info) => {
                const value = info.getValue();
                if (!value) return <span className="text-slate-400">—</span>;
                return (
                    <span className="font-bold text-[#2D8FE3]">
                    ${Number(value).toLocaleString()}
                </span>
                );
            },
        },
        {
            id: 'actions',
            cell: ({row}) => {
                const job = row.original;
                const hasApplied = job.user_application?.has_applied;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-1.5 hover:bg-slate-100 rounded-md cursor-pointer outline-none">
                                <MoreVertical className="w-4 h-4 text-slate-400"/>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handleShowModal(job.id, job.contract_type?.contract_name)}
                            >
                                View Details
                            </DropdownMenuItem>
                            {hasApplied ? (
                                <DropdownMenuItem disabled className="text-green-600 focus:text-green-600 font-medium bg-green-50/50">
                                    <Check className="w-4 h-4 mr-2" /> Applied
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem
                                    className="cursor-pointer text-blue-600"
                                    onClick={() => onApply(job.id)}
                                >
                                    <SendHorizontal className="w-4 h-4 mr-2" /> Apply Now
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            }
        }
    ], [handleShowModal, onApply]);

    // ২. টেবিল ইনস্ট্যান্স তৈরি
    const table = useReactTable({
        data,
        columns,
        state: {sorting},
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="w-full bg-white rounded-xl border border-[#E6E6EB] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="bg-[#F8FAFC] border-b border-[#E6E6EB]">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} className="px-4 py-4 text-[13px] font-semibold text-[#64748B]">
                                    <div
                                        className={`flex items-center gap-1 ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''}`}
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        {header.column.getCanSort() &&
                                            <ChevronsUpDown className="w-3.5 h-3.5 text-slate-300"/>}
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
                                <td key={cell.id} className="px-4 py-4 text-[14px] text-slate-500">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination UI - ছবির সাথে পিক্সেল পারফেক্ট */}
            {/*<div className="px-4 py-4 flex items-center justify-between border-t border-[#E6E6EB]">*/}
            {/*    <div className="flex items-center gap-2 text-[13px] text-slate-500 font-medium">*/}
            {/*        Showing*/}
            {/*        <select*/}
            {/*            value={table.getState().pagination.pageSize}*/}
            {/*            onChange={e => table.setPageSize(Number(e.target.value))}*/}
            {/*            className="bg-white border border-[#E6E6EB] rounded-lg px-2 py-1 font-bold text-slate-700 outline-none"*/}
            {/*        >*/}
            {/*            {[10, 20, 30, 40, 50].map(pageSize => (*/}
            {/*                <option key={pageSize} value={pageSize}>{pageSize}</option>*/}
            {/*            ))}*/}
            {/*        </select>*/}
            {/*        of {data.length} Entries*/}
            {/*    </div>*/}

            {/*    <div className="flex items-center gap-2">*/}
            {/*        <button*/}
            {/*            onClick={() => table.previousPage()}*/}
            {/*            disabled={!table.getCanPreviousPage()}*/}
            {/*            className="flex items-center gap-1 text-[13px] font-semibold text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"*/}
            {/*        >*/}
            {/*            <ChevronLeft className="w-4 h-4"/> Previous*/}
            {/*        </button>*/}

            {/*        <div className="flex items-center gap-1">*/}
            {/*            /!* Page Numbers *!/*/}
            {/*            <button*/}
            {/*                className="w-10 h-10 rounded-xl border border-[#E6E6EB] bg-white text-slate-700 font-bold shadow-sm">*/}
            {/*                {table.getState().pagination.pageIndex + 1}*/}
            {/*            </button>*/}
            {/*        </div>*/}

            {/*        <button*/}
            {/*            onClick={() => table.nextPage()}*/}
            {/*            disabled={!table.getCanNextPage()}*/}
            {/*            className="flex items-center gap-1 text-[13px] font-semibold text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"*/}
            {/*        >*/}
            {/*            Next <ChevronRight className="w-4 h-4"/>*/}
            {/*        </button>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </div>
    );
};

export default JobListView;