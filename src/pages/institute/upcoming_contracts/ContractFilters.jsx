import React from 'react';
import { Search, Filter, X } from "lucide-react";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@components/ui/select";
import { Badge } from "@components/ui/badge";

const ContractFilters = ({
                             searchText, setSearchText,
                             showFilters, setShowFilters,
                             activeFiltersCount,
                             filterUrgency, setFilterUrgency,
                             filterStatus, setFilterStatus,
                             filterProfessional, setFilterProfessional
                         }) => {

    return (
        <div className="mb-6 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="p-4">
                {/* Search and Filter Toggle Row */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full min-w-[280px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search by contract name, position, or location..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="!pl-10 pr-10 h-11 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-blue-400 transition-all rounded-lg"
                        />
                        {searchText && (
                            <button
                                onClick={() => setSearchText("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full transition-colors"
                            >
                                <X className="w-3.5 h-3.5 text-slate-500" />
                            </button>
                        )}
                    </div>

                    <div className="relative shrink-0">
                        <Button
                            variant={showFilters ? "default" : "outline"}
                            onClick={() => setShowFilters(!showFilters)}
                            className={`h-11 px-6 !rounded-lg font-bold flex items-center gap-2 transition-all ${
                                showFilters
                                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 hover:opacity-90 border-none text-white shadow-lg shadow-indigo-200"
                                    : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200"
                            }`}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            {activeFiltersCount > 0 && (
                                <Badge className="ml-1 bg-white text-indigo-600 hover:bg-white border-none h-5 min-w-5 flex items-center justify-center p-0 text-[10px] font-black">
                                    {activeFiltersCount}
                                </Badge>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Collapsible Filter Section */}
                {showFilters && (
                    <div className="mt-2 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end animate-in fade-in slide-in-from-top-2 duration-300">

                        {/* Urgency Level Select */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Urgency Level</label>
                            <Select value={filterUrgency} onValueChange={setFilterUrgency}>
                                <SelectTrigger className="h-11 !rounded-lg border-slate-200 focus:ring-blue-400/20 w-full">
                                    <SelectValue placeholder="All Levels" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg">
                                    <SelectItem value="all">All Levels</SelectItem>
                                    <SelectItem value="critical">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-600" /> Critical
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="high">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-amber-500" /> High
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="medium">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" /> Medium
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="normal">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" /> Normal
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Contract Status Select */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Contract Status</label>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="h-11 !rounded-lg border-slate-200 focus:ring-blue-400/20 w-full">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg">
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="booked">Booked</SelectItem>
                                    <SelectItem value="pending_signature">Pending Signature</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Assignment Select */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Assignment</label>
                            <Select value={filterProfessional} onValueChange={setFilterProfessional}>
                                <SelectTrigger className="h-11 !rounded-lg border-slate-200 focus:ring-blue-400/20 w-full">
                                    <SelectValue placeholder="All Contracts" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg">
                                    <SelectItem value="all">All Contracts</SelectItem>
                                    <SelectItem value="assigned">Assigned Only</SelectItem>
                                    <SelectItem value="unassigned">Unassigned Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Clear Filters Button */}
                        <div className="pb-1">
                            {activeFiltersCount > 0 && (
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setSearchText("");
                                        setFilterUrgency("all");
                                        setFilterStatus("all");
                                        setFilterProfessional("all");
                                    }}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold text-xs h-10 w-full justify-start md:justify-center rounded-xl"
                                >
                                    <X className="w-4 h-4 mr-1.5" />
                                    Clear All ({activeFiltersCount})
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContractFilters;