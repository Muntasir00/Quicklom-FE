import React from 'react';
import { Label } from "@components/ui/label";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import {ChevronDown} from "lucide-react";

const CompensationSection = ({ register, errors, watch, setValue }) => {
    const compMode = watch("compensation_mode");

    return (
        <div className="w-full mt-8 mb-6">
            {/* Legend style wrapper */}
            <div className="relative border border-slate-200 rounded-lg p-5 md:p-8 pt-8 bg-white shadow-sm">
                {/* Top Title (Legend) */}
                <span className="absolute -top-3 left-4 bg-white px-2 text-[15px] text-slate-400 font-normal">
          Compensation & Requirements
        </span>

                {/* First Row: Experience & Compensation Mode */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-10">

                    {/* Required Experience Level */}
                    <div className="space-y-2">
                        <Label className="text-[15px] font-medium text-slate-700">
                            Required Experience Level <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative group">
                            <select
                                {...register("required_experience")}
                                className={`flex h-11 w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer ${
                                    errors?.required_experience ? 'border-red-500 ring-red-200' : 'border-slate-200 focus:ring-blue-400/20 focus:border-blue-400'
                                }`}
                            >
                                <option value="" className="text-slate-400">- Select Experience -</option>
                                <option value="less1">⭐ Less than 1 year</option>
                                <option value="1-3">⭐⭐ 1-3 years</option>
                                <option value="3-5">⭐⭐⭐ 3-5 years</option>
                                <option value="5-10">⭐⭐⭐⭐ 5-10 years</option>
                                <option value="10plus">⭐⭐⭐⭐⭐ More than 10 years</option>
                                <option value="noPreference">✓ No preference</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none transition-transform group-focus-within:rotate-180" />
                        </div>
                        {errors?.required_experience && (
                            <p className="text-xs text-red-500 italic">{errors.required_experience.message}</p>
                        )}
                    </div>

                    {/* Compensation Mode */}
                    <div className="space-y-2">
                        <Label className="text-[15px] font-medium text-slate-700">
                            Compensation Mode <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative group">
                            <select
                                {...register("compensation_mode")}
                                className={`flex h-11 w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer ${
                                    errors?.compensation_mode ? 'border-red-500 ring-red-200' : 'border-slate-200 focus:ring-blue-400/20 focus:border-blue-400'
                                }`}
                            >
                                <option value="" className="text-slate-400">- Select Mode -</option>
                                <option value="Per Day">📅 Per Day</option>
                                <option value="Per Hour">⏰ Per Hour</option>
                                <option value="Fixed Contract Value">💰 Fixed Contract Value</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none transition-transform group-focus-within:rotate-180" />
                        </div>
                        {errors?.compensation_mode && (
                            <p className="text-xs text-red-500 italic">{errors.compensation_mode.message}</p>
                        )}
                    </div>
                </div>

                {/* Dynamic Rate Row: Only shown based on compensation_mode */}
                {compMode && (
                    <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="max-w-md space-y-2">
                            <Label className="text-[15px] font-medium text-slate-700 capitalize">
                                {compMode.replace(/([A-Z])/g, ' $1').trim()} Rate <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative flex items-center">
                                <span className="absolute left-3 text-slate-400">$</span>
                                <Input
                                    type="text"
                                    placeholder="0.00"
                                    {...register(
                                        compMode === "Per Day" ? "daily_rate" :
                                            compMode === "Per Hour" ? "hourly_rate" : "contract_value"
                                    )}
                                    className="!pl-7 pr-12 h-11 border-slate-200 focus-visible:ring-blue-400"
                                />
                                <span className="absolute right-3 text-[12px] font-bold text-slate-400">CAD</span>
                            </div>
                            {compMode === "Fixed Contract Value" && (
                                <p className="text-[11px] text-blue-500 font-medium">
                                    Total value for the entire contract
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Mission Description for Fixed Contract Value */}
                {compMode === "Fixed Contract Value" && (
                    <div className="mt-6 space-y-2 animate-in fade-in duration-300">
                        <Label className="text-[15px] font-medium text-slate-700">
                            Mission Description <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            {...register("mission_description")}
                            placeholder="Describe the mission..."
                            className="min-h-[100px] border-slate-200 focus-visible:ring-blue-400"
                        />
                    </div>
                )}

                {/* Second Row: Bonus & Fees */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-10 mt-6 pt-6 border-t border-slate-50">

                    {/* Bonus/Incentives */}
                    <div className="space-y-2">
                        <Label className="text-[15px] font-medium text-slate-700">
                            Bonus/Incentives
                        </Label>
                        <div className="relative group">
                            <select
                                {...register("bonus_incentives")}
                                className="flex h-11 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 appearance-none cursor-pointer"
                            >
                                <option value="" className="text-slate-400">- Select Option -</option>
                                <option value="yes">✓ Yes - Bonuses Available</option>
                                <option value="no">✗ No Bonuses</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none transition-transform group-focus-within:rotate-180" />
                        </div>
                    </div>

                    {/* Fees */}
                    <div className="space-y-2">
                        <Label className="text-[15px] font-medium text-slate-700">
                            Fees
                        </Label>
                        <Input
                            {...register("fees")}
                            placeholder="-"
                            className="h-11 border-slate-200 focus-visible:ring-blue-400 placeholder:text-slate-300"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CompensationSection;