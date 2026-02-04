import React from 'react';
import {Link} from 'react-router-dom';
import {Badge} from "@components/ui/badge.jsx";
import {Button} from "@components/ui/button.jsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@components/ui/dropdown-menu.jsx";
import {MoreVertical, Eye, Pencil, Ban, MapPin, Briefcase} from "lucide-react";

const ContractCard = ({
                          contract,
                          sessionUserRole,
                          menu,
                          handleContractClick,
                          handleOpenCancelModal,
                          getCategoryConfig,
                          getStatusBadge,
                          getPositions,
                          getLocation,
                          formatDate,
                          getCompensation
                      }) => {
    const config = getCategoryConfig(contract?.contract_type?.industry);
    const isActionDisabled = contract?.status === 'booked' || contract?.status === 'cancelled';

    return (
        <div
            className="rounded-lg border border-border bg-card p-2 transition-all hover:shadow-md cursor-pointer h-full flex flex-col justify-between"
            style={{borderLeft: `4px solid ${config.color}`}}
            onClick={() => handleContractClick(contract)}
        >
            <div>
                {/* Header: ID & Status */}
                <div className="mb-3 flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-[#374151]">#{contract.id}</span>
                        {contract?.data?.urgent_need && (
                            <Badge variant="destructive" className="text-[10px] py-0 px-2 h-5">Urgent</Badge>
                        )}
                    </div>
                    <div className="flex items-start gap-2">
                        <div onClick={(e) => e.stopPropagation()}>
                            {getStatusBadge(contract?.status)}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 !rounded-md bg-[#F3F4F6]">
                                    <MoreVertical className="h-5 w-5 text-[#2A394B]"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => handleContractClick(contract)}>
                                    <Eye className="mr-2 h-4 w-4"/> View Details
                                </DropdownMenuItem>
                                {!isActionDisabled && (
                                    <DropdownMenuItem asChild>
                                        <Link
                                            to={`/${sessionUserRole}/${menu}/${contract.id}/edit`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center"
                                        >
                                            <Pencil className="mr-2 h-4 w-4"/> Edit
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                {contract?.status !== 'booked' && contract?.status !== 'cancelled' && (
                                    <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenCancelModal(contract, e);
                                        }}
                                    >
                                        <Ban className="mr-2 h-4 w-4"/> Cancel
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Contract Title & Icon */}
                <div className="flex items-center gap-2 mb-1">
                    {/*<div className="flex h-7 w-7 items-center justify-center rounded-full shrink-0"*/}
                    {/*     style={{backgroundColor: config.bgColor}}>*/}
                    {/*    <i className={`${config.icon}`} style={{color: config.color, fontSize: '0.8rem'}}></i>*/}
                    {/*</div>*/}
                    <h3 className="line-clamp-2 text-sm font-bold text-[#2A394B]">
                        {contract?.contract_type?.contract_name || 'Unnamed'}
                    </h3>
                </div>

                {/* Position */}
                <p className="mb-1 text-xs text-muted-foreground line-clamp-1">
                    {/*<Briefcase className="inline mr-1 h-3 w-3"/> */}
                    {getPositions(contract)}
                </p>

                {/* Value & Date Grid */}
                <div className="mb-1 grid grid-cols-2 gap-3 border-t py-2">
                    <div>
                        <p className="!mb-0 text-[10px] uppercase text-muted-foreground font-semibold tracking-tight text-truncate">Value</p>
                        <p className="text-sm font-bold text-[#2D8FE3] !mb-0">{getCompensation(contract)}</p>
                    </div>
                    <div>
                        <p className=" text-[10px] uppercase text-muted-foreground font-semibold tracking-tight !mb-0">Start
                            Date</p>
                        <p className="text-sm font-medium text-[#2A394B] !mb-0">{formatDate(contract?.start_date)}</p>
                    </div>
                </div>
            </div>

            {/* Location */}
            <div className="mt-auto border-t pt-2">
                <p className="text-xs  text-[#6B7280]  tracking-tight !mb-0">Location</p>
                <p className="line-clamp-1 text-sm text-[#2A394B] flex items-center !mb-0">
                     {getLocation(contract)}
                </p>
            </div>
        </div>
    );
};

export default ContractCard;