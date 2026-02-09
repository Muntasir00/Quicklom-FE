// ServiceDetailsTab.jsx
import React from "react";
import {useFormContext} from "react-hook-form";

import {Card} from "@components/ui/card";
import {FormItem, FormLabel, FormMessage, FormField, FormControl} from "@components/ui/form";
import {Input} from "@components/ui/input";
import {Textarea} from "@components/ui/textarea";
import {Separator} from "@components/ui/separator";
import {Button} from "@components/ui/button";

import {Stethoscope, Bluetooth, Pill, HeartHandshake, Building2, Calendar1} from "lucide-react";

// Specialties are already names in API: ["Dental Care","Pharmacy"]
const SPECIALTIES = [
    {label: "General Medicine", icon: Stethoscope, value: "General Medicine"},
    {label: "Dental Care", icon: Bluetooth, value: "Dental Care"},
    {label: "Pharmacy", icon: Pill, value: "Pharmacy"},
    {label: "Nursing & Home Care", icon: HeartHandshake, value: "Nursing & Home Care"},
];

// Regions are names in API
const REGIONS = [
    "Alberta",
    "British Columbia",
    "Manitoba",
    "New Brunswick",
    "Newfoundland and Labrador",
    "Nova Scotia",
    "Ontario",
    "Prince Edward Island",
    "Quebec",
    "Saskatchewan",
];

// Contracts in API are lower-case strings: ["temporary staffing","permanent staffing"]
const CONTRACTS = [
    {label: "Temporary Staffing", value: "temporary staffing"},
    {label: "Permanent Staffing", value: "permanent staffing"},
];

function Chip({selected, disabled, children, onClick}) {
    return (
        <Button
            type="button"
            variant="outline"
            onClick={onClick}
            disabled={disabled}
            className={[
                "h-10 !rounded-lg border-slate-200 px-3 py-3 text-sm font-medium !bg-[#EAF5FE]",
                selected
                    ? "border-transparent !bg-[#1f63ff] text-white hover:bg-[#1956df]"
                    : "bg-white text-slate-700 hover:bg-slate-50",
                disabled ? "opacity-60 cursor-not-allowed" : "",
            ].join(" ")}
        >
            {children}
        </Button>
    );
}

export default function ServiceDetailsTab({isEditing}) {
    const {control, setValue, watch} = useFormContext();

    const specialties_covered = watch("specialties_covered") || [];
    const regions_served = watch("regions_served") || [];
    const types_of_contracts_managed = watch("types_of_contracts_managed") || [];

    const toggle = (path, arr, value) => {
        if (!isEditing) return;
        const exists = arr.includes(value);
        const next = exists ? arr.filter((x) => x !== value) : [...arr, value];
        setValue(path, next, {shouldValidate: true, shouldDirty: true});
    };

    return (
        <div className="space-y-5 rounded-xl border border-[#F3F4F6] bg-white p-6">
            <div className="space-y-4">
                <FormItem>
                    <FormLabel className="text-xs text-[#4B5563] !mb-0">
                        Specialties Covered<span className="text-red-500">*</span>
                    </FormLabel>
                    <div className="flex flex-wrap gap-2">
                        {SPECIALTIES.map((s) => {
                            const Icon = s.icon;
                            const selected = specialties_covered.includes(s.value);
                            return (
                                <Chip
                                    key={s.value}
                                    selected={selected}
                                    disabled={!isEditing}
                                    onClick={() => toggle("specialties_covered", specialties_covered, s.value)}
                                >
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-white/15">
                    <Icon className="h-4 w-4"/>
                  </span>
                                    {s.label}
                                </Chip>
                            );
                        })}
                    </div>
                    <FormMessage/>
                </FormItem>

                <FormItem>
                    <FormLabel className="text-xs text-[#4B5563] !mb-0">
                        Region Served<span className="text-red-500">*</span>
                    </FormLabel>
                    <div className="flex flex-wrap gap-2">
                        {REGIONS.map((r) => (
                            <Chip
                                key={r}
                                selected={regions_served.includes(r)}
                                disabled={!isEditing}
                                onClick={() => toggle("regions_served", regions_served, r)}
                            >
                                {r}
                            </Chip>
                        ))}
                    </div>
                    <FormMessage/>
                </FormItem>

                <FormItem>
                    <FormLabel className="text-xs text-[#4B5563] !mb-0">
                        Types of Contracts Managed<span className="text-red-500">*</span>
                    </FormLabel>
                    <div className="flex flex-wrap gap-2">
                        {CONTRACTS.map((c) => (
                            <Chip
                                key={c.value}
                                selected={types_of_contracts_managed.includes(c.value)}
                                disabled={!isEditing}
                                onClick={() =>
                                    toggle("types_of_contracts_managed", types_of_contracts_managed, c.value)
                                }
                            >
                                {c.label}
                            </Chip>
                        ))}
                    </div>
                    <FormMessage/>
                </FormItem>
            </div>


            <Card className="mt-3 !border-none bg-white p-0 shadow-none">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <FormField
                        control={control}
                        name="years_of_experience"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="text-xs text-[#4B5563] !mb-0">
                                    Years of Experience<span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Calendar1
                                            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4B5563]"/>
                                        <Input
                                            type="number"
                                            {...field}
                                            disabled={!isEditing}
                                            className="h-11 rounded-lg border-[#E5E7EB] bg-[#F3F4F6] !pl-10 text-[#6B7280] focus-visible:ring-0 focus-visible:border-blue-400"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="number_of_recruiters"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="text-xs text-[#4B5563] !mb-0">
                                    Number of Recruiters<span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        disabled={!isEditing}
                                        className="h-11 rounded-lg border-[#E5E7EB] bg-[#F3F4F6] text-[#6B7280] focus-visible:ring-0 focus-visible:border-blue-400"
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="licensing_accreditation"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="text-xs text-[#4B5563] !mb-0">Licensing /
                                    Accreditation</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        disabled={!isEditing}
                                        className="h-11 rounded-lg border-[#E5E7EB] bg-[#F3F4F6] text-[#6B7280] focus-visible:ring-0 focus-visible:border-blue-400"
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="recruitment_process_description"
                        render={({field}) => (
                            <FormItem className="sm:col-span-3">
                                <FormLabel className="text-xs text-[#4B5563] !mb-0">
                                    Recruitment Process Description<span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        disabled={!isEditing}
                                        className="min-h-[96px] resize-none rounded-lg border-[#E5E7EB] bg-[#F3F4F6]"
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                </div>
            </Card>
        </div>
    );
}