import React, { useMemo } from "react";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable
} from "@tanstack/react-table";
import {
    Download,
    ExternalLink,
    MoreHorizontal,
    AlertTriangle,
    ArrowUpDown // নতুন আইকন
} from "lucide-react";
import { Button } from "@components/ui/button.jsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@components/ui/dropdown-menu.jsx";

const InvoiceHistoryTable = ({
                                 data,
                                 getStatusInfo,
                                 getInvoiceTypeInfo,
                                 getContractInfo,
                                 getInvoiceNumber,
                                 formatDate,
                                 formatAmount
                             }) => {
    const columnHelper = createColumnHelper();

    // কলামগুলোর নির্দিষ্ট Width (size) সেট করা হয়েছে
    const columns = useMemo(() => [
        columnHelper.accessor("id", {
            header: "Invoice #",
            size: 120, // Width 120px
            cell: (info) => <span className="text-sm text-[#2A394B]">{getInvoiceNumber(info.row.original)}</span>,
        }),
        columnHelper.display({
            id: "type",
            header: "Type",
            size: 120, // Width 160px
            cell: (info) => {
                const type = getInvoiceTypeInfo(info.row.original);
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm text-[#2A394B]  border"
                          style={{ backgroundColor: type.bg, color: type.color, borderColor: 'transparent' }}>
                        <i className={`fas ${type.icon}`}></i> {type.label}
                    </span>
                );
            },
        }),
        columnHelper.display({
            id: "contract",
            header: "Contract",
            size: 120, // Width 180px
            cell: (info) => {
                const contract = getContractInfo(info.row.original);
                return contract.contractId ? (
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#2A394B]">#{contract.contractId}</span>
                        <span className="text-[10px] text-[#9CA3AF] truncate max-w-[150px]">{contract.contractType || '-'}</span>
                    </div>
                ) : <span className="text-gray-400">-</span>;
            },
        }),
        columnHelper.display({
            id: "issueDate",
            header: "Issue Date",
            size: 140, // Width 130px
            cell: (info) => formatDate(info.row.original.created_at || info.row.original.created),
        }),
        columnHelper.display({
            id: "dueDate",
            header: "Due Date",
            size: 130, // Width 130px
            cell: (info) => {
                const inv = info.row.original;
                const isOverdue = inv.due_date && new Date(inv.due_date) < new Date() && inv.status?.toLowerCase() === 'open';
                return (
                    <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : ''}`}>
                        {formatDate(inv.due_date)}
                        {isOverdue && <AlertTriangle size={12} />}
                    </div>
                );
            },
        }),
        columnHelper.display({
            id: "amountDue",
            header: "Amount Due",
            size: 160, // Width 130px
            cell: (info) => <span className="font-bold text-[#2A394B]">{formatAmount(info.row.original.amount_due, info.row.original.currency)}</span>,
        }),
        columnHelper.display({
            id: "amountPaid",
            header: "Amount Paid",
            size: 160, // Width 130px
            cell: (info) => <span className="font-medium text-green-600">{formatAmount(info.row.original.amount_paid, info.row.original.currency)}</span>,
        }),
        columnHelper.display({
            id: "status",
            header: "Status",
            size: 120,
            cell: (info) => {
                const status = getStatusInfo(info.row.original);
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold"
                          style={{ backgroundColor: status.bg, color: status.color }}>
                         {status.label}
                    </span>
                );
            },
        }),
        columnHelper.display({
            id: "actions",
            header: () => <div className="text-right">Actions</div>,
            size: 100, // Width 80px
            cell: (info) => {
                const inv = info.row.original;
                return (
                    <div className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                                {(inv.invoice_pdf || inv.invoice_pdf_url) && (
                                    <DropdownMenuItem className="cursor-pointer" onClick={() => window.open(inv.invoice_pdf || inv.invoice_pdf_url, '_blank')}>
                                        <Download className="mr-2 h-4 w-4" /> Download PDF
                                    </DropdownMenuItem>
                                )}
                                {inv.hosted_invoice_url && (
                                    <DropdownMenuItem className="cursor-pointer" onClick={() => window.open(inv.hosted_invoice_url, '_blank')}>
                                        <ExternalLink className="mr-2 h-4 w-4" /> View Online
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        }),
    ], []);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm text-left border-collapse table-fixed">
                <thead className="bg-[#F8FAFC] text-[#64748B] border-b border-gray-100">
                {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                            // Invoice # এবং Actions এ আইকন দেখানো হবে না
                            const showIcon = header.column.id !== 'id' && header.column.id !== 'actions';

                            return (
                                <th
                                    key={header.id}
                                    style={{ width: header.getSize() }} // এখানে Width সেট হচ্ছে
                                    className="px-6 py-4 capitalize tracking-wider text-sm font-medium text-[#4B5563]"
                                >
                                    <div className={`flex items-center gap-1.5 ${showIcon ? 'cursor-pointer group select-none' : ''}`}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}

                                        {/* শর্তসাপেক্ষে Arrow আইকন রেন্ডার করা */}
                                        {showIcon && (
                                            <ArrowUpDown size={14} className="text-gray-300 group-hover:text-gray-600 transition-colors" />
                                        )}
                                    </div>
                                </th>
                            );
                        })}
                    </tr>
                ))}
                </thead>
                <tbody className="divide-y divide-gray-50">
                {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                        {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-6 py-4 overflow-hidden text-ellipsis">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default InvoiceHistoryTable;