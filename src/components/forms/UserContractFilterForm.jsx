import React, { useEffect } from "react";
import {
    Search, RotateCcw, Hash, MapPin, Stethoscope,
     Info, Calendar, DollarSign,
    AlertTriangle, Loader2
} from "lucide-react";

import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@components/ui/select";

// eslint-disable-next-line react/prop-types
const UserContractFilterForm = ({ setContracts, useFilterHook, onFiltersChange }) => {
    const {
        filters,
        handleChange,
        handleClear,
        handleSubmit,
        profile,
        positions = [],
        availableProvinces = [],
        availableSpecialties = [],
        availableContractTypes = [],
        loading,
    } = useFilterHook(setContracts);

    useEffect(() => {
        if (onFiltersChange) {
            const activeFiltersCount = Object.values(filters).filter(
                (value) => value !== "" && value !== null && value !== undefined
            ).length;
            onFiltersChange(activeFiltersCount);
        }
    }, [filters, onFiltersChange]);

    // Shadcn Select-কে আপনার handleChange এর সাথে মেলানোর জন্য একটি ছোট ফাংশন
    const handleSelectChange = (name, value) => {
        handleChange({
            target: { name, value }
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                <p className="text-slate-500 text-sm font-medium">Loading filters...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-5">

                {/* Contract ID */}
                <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-2">
                        <Hash className="w-3.5 h-3.5 text-blue-500" /> Contract ID
                    </div>
                    <Input
                        type="number"
                        name="contract_id"
                        placeholder="e.g. 102"
                        className="h-10"
                        value={filters.contract_id || ''}
                        onChange={handleChange}
                    />
                </div>

                {/* Region/Province Select */}
                {availableProvinces.length > 0 && (
                    <div className="space-y-2">
                        <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-blue-500" /> Province
                        </div>
                        <Select
                            value={filters.province || "all"}
                            onValueChange={(val) => handleSelectChange("province", val === "all" ? "" : val)}
                        >
                            <SelectTrigger className="h-10 w-full">
                                <SelectValue placeholder="All Regions" />
                            </SelectTrigger >
                            <SelectContent>
                                <SelectItem value="all">All Regions</SelectItem>
                                {availableProvinces.map((p, i) => (
                                    <SelectItem key={i} value={p}>{p}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Specialty Select */}
                {availableSpecialties.length > 0 && (
                    <div className="space-y-2">
                        <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-2">
                            <Stethoscope className="w-3.5 h-3.5 text-blue-500" /> Specialty
                        </div>
                        <Select
                            value={filters.specialty || "all"}
                            onValueChange={(val) => handleSelectChange("specialty", val === "all" ? "" : val)}
                        >
                            <SelectTrigger className="h-10 w-full">
                                <SelectValue placeholder="All Specialties" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Specialties</SelectItem>
                                {availableSpecialties.map((s, i) => (
                                    <SelectItem key={i} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Status Select */}
                <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-2">
                        <Info className="w-3.5 h-3.5 text-blue-500" /> Status
                    </div>
                    <Select
                        value={filters.status || "all"}
                        onValueChange={(val) => handleSelectChange("status", val === "all" ? "" : val)}
                    >
                        <SelectTrigger className="h-10 w-full">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {["open", "pending", "booked", "closed", "cancelled"].map(s => (
                                <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Date Inputs - Shadcn Input (type date) */}
                <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" /> Start From
                    </div>
                    <Input type="date" name="start_date" className="h-10" value={filters.start_date} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" /> End Until
                    </div>
                    <Input type="date" name="end_date" className="h-10" value={filters.end_date} onChange={handleChange} />
                </div>

                {/* Rates */}
                <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-2">
                        <DollarSign className="w-3.5 h-3.5 text-blue-500" /> Min Rate ($)
                    </div>
                    <Input
                        type="number"
                        name="min_rate"
                        placeholder="0.00"
                        className="h-10"
                        value={filters.min_rate}
                        onChange={handleChange}
                    />
                </div>

                {/* Special Filter with Warning Highlight */}
                <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Special Filter
                    </div>
                    <Select
                        value={filters.filter || "none"}
                        onValueChange={(val) => handleSelectChange("filter", val === "none" ? "" : val)}
                    >
                        <SelectTrigger className={`h-10 w-full ${filters.filter === 'no_applications' ? 'border-amber-400 bg-amber-50' : ''}`}>
                            <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="no_applications">No Applications (7+ days)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

            </div>

            {/* Profile Info Banner */}
            {profile && (
                <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-blue-900 leading-none">Profile-Based Filters Active</h4>
                        <p className="text-[11px] text-blue-700 mt-1.5 opacity-80">
                            Showing filters for {availableSpecialties.length} specialties and {availableProvinces.length} regions.
                        </p>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end items-center gap-3 mt-4 pt-3 border-t border-slate-100">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClear}
                    className="w-full sm:w-auto text-slate-600 font-semibold !rounded-md gap-2 h-11 px-6 hover:bg-slate-100 transition-all cursor-pointer"
                >
                    <RotateCcw className="w-4 h-4" /> Clear All
                </Button>
                <Button
                    type="submit"
                    className="w-full sm:w-auto bg-blue-600 !rounded-md hover:bg-blue-700 text-white font-semibold gap-2 h-11 px-10 shadow-lg shadow-blue-200 transition-all cursor-pointer"
                >
                    <Search className="w-4 h-4" /> Apply Filters
                </Button>
            </div>
        </form>
    );
};

export default UserContractFilterForm;