import React from 'react';
import { Label } from "@components/ui/label";
import { Input } from "@components/ui/input";
import { ChevronDown } from "lucide-react";

const WorkScheduleSection = ({ register, watch, errors }) => {
    const isBreakIncluded = watch("break_included") === "yes";

    return (
        <div className="w-full mt-8 mb-6">
            {/* Legend Style Wrapper */}
            <div className="relative border border-slate-200 rounded-lg p-6 md:p-8 pt-8 bg-white shadow-sm">

                {/* Top Title (Legend) */}
                <span className="absolute -top-3 left-4 bg-white px-2 text-[15px] text-slate-400 font-normal">
          Work Schedule
        </span>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

                    {/* Break Included Select */}
                    <div className="col-span-12 md:col-span-4 space-y-2">
                        <Label className="text-[15px] font-medium text-slate-700">
                            Break Included
                        </Label>
                        <div className="relative group">
                            <select
                                {...register("break_included")}
                                className="flex h-11 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 ring-offset-background focus:outline-none focus:ring-1 focus:ring-blue-400 appearance-none cursor-pointer"
                            >
                                <option value="">-</option>
                                <option value="yes">✓ Yes (with duration)</option>
                                <option value="no">✗ No Break</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 opacity-50 pointer-events-none transition-transform group-focus-within:rotate-180 text-slate-400" />
                        </div>
                    </div>

                    {/* Break Duration - Conditional Input */}
                    {isBreakIncluded && (
                        <div className="col-span-12 md:col-span-4 space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
                            <Label className="text-[15px] font-medium text-slate-700">
                                Break Duration
                            </Label>
                            <Input
                                {...register("break_duration")}
                                type="text"
                                placeholder="e.g. 30 minutes"
                                className="h-11 border-slate-200 focus-visible:ring-blue-400 placeholder:text-slate-300"
                            />
                        </div>
                    )}
                </div>

                {/* Error Handling (Optional) */}
                {errors?.break_included && (
                    <p className="text-xs text-red-500 mt-2 italic">
                        {errors.break_included.message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default WorkScheduleSection;