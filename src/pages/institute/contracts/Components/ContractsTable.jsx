import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {ArrowUpDown} from "lucide-react";
import React from "react";

const ContractsTable = ({columns, data, onRowClick}) => {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="w-full overflow-x-auto !rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full text-left border-collapse ">
                <thead className="bg-[#E5E7EB]">
                <tr className="border-b border-border bg-muted/30">
                    {table.getHeaderGroups().map((headerGroup) =>
                        headerGroup.headers.map((header) => {
                            const showIcon = header.column.id !== 'id' && header.column.id !== 'actions';
                            return (
                                <th key={header.id}
                                    className="py-[7.5px] px-3 gap-2 text-left text-sm font-medium text-[#4B5563] first:rounded-l-md first:rounded-bl-none last:rounded-r-md last:rounded-br-none">
                                    <div
                                        className={`flex items-center gap-1.5 ${showIcon ? 'cursor-pointer group select-none' : ''}`}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        {showIcon && (
                                            <ArrowUpDown size={14}
                                                         className="text-gray-300 group-hover:text-gray-600 transition-colors"/>
                                        )}
                                    </div>
                                </th>
                            )
                        }),
                    )}
                </tr>
                </thead>
                {/*<thead className="bg-gray-50 border-b border-gray-200">*/}
                {/*{table.getHeaderGroups().map((headerGroup) => (*/}
                {/*    <tr key={headerGroup.id}>*/}
                {/*        {headerGroup.headers.map((header) => (*/}
                {/*            <th*/}
                {/*                key={header.id}*/}
                {/*                className="px-4 py-3 text-sm font-semibold text-gray-700"*/}
                {/*            >*/}
                {/*                {header.isPlaceholder*/}
                {/*                    ? null*/}
                {/*                    : flexRender(*/}
                {/*                        header.column.columnDef.header,*/}
                {/*                        header.getContext()*/}
                {/*                    )}*/}
                {/*            </th>*/}
                {/*        ))}*/}
                {/*    </tr>*/}
                {/*))}*/}
                {/*</thead>*/}
                <tbody className="divide-y divide-gray-100">
                {table.getRowModel().rows.map((row) => (
                    <tr
                        key={row.id}
                        onClick={() => onRowClick?.(row.original)}
                        className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                    >
                        {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-4 py-3 text-sm text-gray-600">
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

export default ContractsTable;