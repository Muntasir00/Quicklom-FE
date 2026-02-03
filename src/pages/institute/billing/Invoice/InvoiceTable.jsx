import  { useMemo } from "react";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable
} from "@tanstack/react-table";
import {
    MoreVertical,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    FileText,
    ExternalLink,
    CreditCard,
    AlertTriangle
} from "lucide-react";
import { Button } from "@components/ui/button.jsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@components/ui/dropdown-menu.jsx";


const StatusBadge = ({ statusInfo }) => (
    <span
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold border transition-colors"
        style={{ backgroundColor: statusInfo.bg, color: statusInfo.color, borderColor: 'transparent' }}
    >
        <i className={`fas ${statusInfo.icon} text-[10px]`}></i>
        {statusInfo.label}
    </span>
);

const TypeBadge = ({ typeInfo }) => (
    <span
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border"
        style={{ backgroundColor: typeInfo.bg, color: typeInfo.color, borderColor: 'transparent' }}
    >
        <i className={`fas ${typeInfo.icon}`}></i>
        {typeInfo.label}
    </span>
);


const InvoiceTable = ({
                          data,
                          getStatusInfo,
                          getInvoiceTypeInfo,
                          getContractInfo,
                          getInvoiceNumber,
                          formatDate,
                          formatAmount,
                          handlePayInvoice,
                          handleViewPDF
                      }) => {
    const columnHelper = createColumnHelper();

    const columns = useMemo(() => [
        columnHelper.accessor("id", {
            header: "Invoice #",
            cell: (info) => (
                <span className="font-semibold text-[#2A394B]">
                    {getInvoiceNumber(info.row.original)}
                </span>
            ),
        }),
        columnHelper.display({
            id: "type",
            header: "Type",
            cell: (info) => <TypeBadge typeInfo={getInvoiceTypeInfo(info.row.original)} />,
        }),
        columnHelper.display({
            id: "contract",
            header: "Contract",
            cell: (info) => {
                const contract = getContractInfo(info.row.original);
                return contract.contractId ? (
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#2A394B]">#{contract.contractId}</span>
                        <span className="text-[10px] text-[#9CA3AF] truncate max-w-[150px]">
                            {contract.contractName || "N/A"}
                        </span>
                    </div>
                ) : <span className="text-gray-400">-</span>;
            },
        }),
        columnHelper.display({
            id: "issueDate",
            header: "Issue Date",
            cell: (info) => formatDate(info.row.original.created_at || info.row.original.created),
        }),
        columnHelper.display({
            id: "dueDate",
            header: "Due Date",
            cell: (info) => {
                const invoice = info.row.original;
                const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date() && invoice.status?.toLowerCase() === 'open';
                return (
                    <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : ''}`}>
                        {formatDate(invoice.due_date)}
                        {isOverdue && <AlertTriangle size={12} />}
                    </div>
                );
            },
        }),
        columnHelper.display({
            id: "amount",
            header: "Amount",
            cell: (info) => (
                <span className="font-bold text-[#2D8FE3]">
                    {formatAmount(info.row.original.amount_due, info.row.original.currency)}
                </span>
            ),
        }),
        columnHelper.display({
            id: "status",
            header: "Status",
            cell: (info) => <StatusBadge statusInfo={getStatusInfo(info.row.original)} />,
        }),
        columnHelper.display({
            id: "actions",
            header: () => <div className="text-right">Actions</div>,
            cell: (info) => {
                const invoice = info.row.original;
                return (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 !rounded-full">
                                    <MoreVertical className="h-4 w-4 text-gray-600" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                {invoice.status?.toLowerCase() === 'open' && invoice.hosted_invoice_url && (
                                    <DropdownMenuItem onClick={() => handlePayInvoice(invoice)} className="cursor-pointer text-blue-600 font-medium">
                                        <CreditCard className="mr-2 h-4 w-4" /> Pay Now
                                    </DropdownMenuItem>
                                )}
                                {(invoice.invoice_pdf || invoice.invoice_pdf_url) && (
                                    <DropdownMenuItem onClick={() => handleViewPDF(invoice)} className="cursor-pointer">
                                        <FileText className="mr-2 h-4 w-4" /> Download PDF
                                    </DropdownMenuItem>
                                )}
                                {invoice.hosted_invoice_url && (
                                    <DropdownMenuItem onClick={() => window.open(invoice.hosted_invoice_url, '_blank')} className="cursor-pointer">
                                        <ExternalLink className="mr-2 h-4 w-4" /> View Online
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        }),
    ], [getStatusInfo, getInvoiceTypeInfo, getContractInfo, getInvoiceNumber, formatDate, formatAmount, handlePayInvoice, handleViewPDF]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 10 } }
    });

    return (
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto bg-white">
                <table className="w-full min-w-[1000px] text-sm text-left">
                    <thead className="bg-[#E5E7EB] text-[#4B5563] border-b">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id} className="h-12 px-4 font-medium text-gray-600">
                                    <div
                                        className={header.column.getCanSort() ? "flex items-center gap-1 cursor-pointer select-none group" : "flex items-center gap-1"}
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        {header.column.getCanSort() && <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    ))}
                    </thead>
                    <tbody className="divide-y">
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className="p-4 text-[#2A394B]">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 border-t gap-4 bg-white">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Showing</span>
                    <select
                        value={table.getState().pagination.pageSize}
                        onChange={e => table.setPageSize(Number(e.target.value))}
                        className="h-8 rounded border bg-white px-2 outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        {[10, 20, 50].map(size => <option key={size} value={size}>{size}</option>)}
                    </select>
                    <span>of {data.length} entries</span>
                </div>

                <div className="flex items-center space-x-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="gap-1 px-3"
                    >
                        <ChevronLeft size={16} /> Previous
                    </Button>

                    <div className="flex items-center gap-1 px-2">
                        <span className="text-sm font-medium">
                            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                        </span>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="gap-1 px-3"
                    >
                        Next <ChevronRight size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceTable;