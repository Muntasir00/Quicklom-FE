import {createColumnHelper} from "@tanstack/react-table";
import {Link} from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem, DropdownMenuSeparator
} from "@components/ui/dropdown-menu.jsx";
import {Button} from "@components/ui/button.jsx";
import {MoreVertical} from "lucide-react";

const columnHelper = createColumnHelper();

export const getContractColumns = (handleContractClick, sessionUserRole, menu, helpers) => [
    columnHelper.accessor("id", {
        header: "ID",
        cell: (info) => `#${info.getValue()}`,
    }),
    columnHelper.accessor("contract_type.contract_name", {
        header: "Contract Type",
        cell: (info) => (
            <div className="truncate max-w-[150px]" title={info.getValue()}>
                {info.getValue()}
            </div>
        ),
    }),
    columnHelper.accessor((row) => helpers.getPositions(row), {
        id: "position",
        header: "Position",
        cell: (info) => <div className="truncate max-w-[120px]">{info.getValue()}</div>,
    }),
    columnHelper.accessor((row) => helpers.getLocation(row), {
        id: "location",
        header: "Location",
        cell: (info) => <div className="truncate max-w-[100px]">{info.getValue()}</div>,
    }),
    columnHelper.accessor("start_date", {
        header: "Start",
        cell: (info) => helpers.formatDate(info.getValue()),
    }),
    columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => helpers.getStatusBadge(info.getValue()),
    }),
    columnHelper.accessor((row) => helpers.getCompensation(row), {
        id: "compensation",
        header: "Contract Value",
        cell: (info) => <span className="text-green-600 font-bold">{info.getValue()}</span>,
    }),
    columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({row}) => {
            const contract = row.original;
            return (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="p-0 h-8 w-8 !rounded-md bg-[#F3F4F6] cursor-pointer">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-6 w-6 text-[#2A394B]"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleContractClick(contract)}>
                                View Details
                            </DropdownMenuItem>
                            {contract?.status !== "booked" && contract?.status !== "cancelled" && (
                                <>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem className="cursor-pointer">
                                        <Link
                                            to={`/${sessionUserRole}/${menu}/${contract.id}/edit`}
                                        >
                                            Edit Contract
                                        </Link>
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/*<div className="flex gap-2" onClick={(e) => e.stopPropagation()}>*/
                    }
                    {/*    <button*/
                    }
                    {/*        className="p-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 transition-colors"*/
                    }
                    {/*        onClick={() => handleContractClick(contract)}*/
                    }
                    {/*    >*/
                    }
                    {/*        <i className="fas fa-eye text-xs"></i>*/
                    }
                    {/*    </button>*/
                    }
                    {/*    {contract?.status !== "booked" && contract?.status !== "cancelled" && (*/
                    }
                    {/*        <Link*/
                    }
                    {/*            to={`/${sessionUserRole}/${menu}/${contract.id}/edit`}*/
                    }
                    {/*            className="p-2 border border-amber-500 text-amber-500 rounded hover:bg-amber-50 transition-colors"*/
                    }
                    {/*        >*/
                    }
                    {/*            <i className="fas fa-edit text-xs"></i>*/
                    }
                    {/*        </Link>*/
                    }
                    {/*    )}*/
                    }
                    {/*</div>*/
                    }
                </>
            )
                ;
        },
    }),
];