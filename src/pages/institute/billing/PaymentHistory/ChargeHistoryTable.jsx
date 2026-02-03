import React, { useMemo } from "react";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable
} from "@tanstack/react-table";
import {
    ArrowUpDown
} from "lucide-react";

const ChargeHistoryTable = ({
                                data,
                                getChargeStatusInfo,
                                formatDate,
                                formatAmount
                            }) => {
    const columnHelper = createColumnHelper();

    const columns = useMemo(() => [
        columnHelper.accessor("id", {
            header: "Charge ID",
            size: 180,
            cell: (info) => (
                <span className="text-xs text-[#2A394B] bg-gray-50 px-2 py-1 rounded border border-gray-100">
                    {info.getValue()?.substring(0, 18)}...
                </span>
            ),
        }),
        columnHelper.accessor("description", {
            header: "Description",
            size: 250,
            cell: (info) => (
                <span className="text-sm font-medium text-[#2A394B]">
                    {info.getValue() || info.row.original.statement_descriptor || 'Payment'}
                </span>
            ),
        }),
        columnHelper.accessor("created", {
            header: "Date",
            size: 150,
            cell: (info) => formatDate(info.getValue()),
        }),
        columnHelper.accessor("amount", {
            header: "Amount",
            size: 130,
            cell: (info) => (
                <span className="font-bold text-[#2A394B]">
                    {formatAmount(info.getValue(), info.row.original.currency)}
                </span>
            ),
        }),
        columnHelper.accessor("status", {
            header: "Status",
            size: 130,
            cell: (info) => {
                const status = getChargeStatusInfo(info.getValue());
                return (
                    <span
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold"
                        style={{ backgroundColor: status.bg, color: status.color }}
                    >
                        <i className={`fas ${status.icon} text-[10px]`}></i>
                        {status.label}
                    </span>
                );
            },
        }),
    ], [getChargeStatusInfo, formatDate, formatAmount]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm text-left border-collapse table-fixed">
                <thead className="bg-[#F8FAFC] text-[#64748B] border-b border-gray-100">
                {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                            const showIcon = header.column.id !== 'id';
                            return (
                                <th
                                    key={header.id}
                                    style={{ width: header.getSize() }}
                                    className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]"
                                >
                                    <div className={`flex items-center gap-1.5 ${showIcon ? 'cursor-pointer group select-none' : ''}`}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
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
                <tbody className="divide-y divide-gray-50 bg-white">
                {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                        {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-6 py-4 truncate">
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

export default ChargeHistoryTable;