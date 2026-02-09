// BillingInformationTab.jsx
import React from "react";
import { useFormContext } from "react-hook-form";

import { Card } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Textarea } from "@components/ui/textarea";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@components/ui/form";

import { BadgeDollarSign, CalendarClock, DollarSign, MoreHorizontal } from "lucide-react";

// API values: ["commission_success","hourly_daily_rate","fixed_fee","other"]
const METHODS = [
    { label: "Commission on Success", value: "commission_success", icon: BadgeDollarSign },
    { label: "Hourly/Daily Rate", value: "hourly_daily_rate", icon: CalendarClock },
    { label: "Fixed fee / Flat Rate", value: "fixed_fee", icon: DollarSign },
    { label: "Other", value: "other", icon: MoreHorizontal },
];

function Chip({ selected, disabled, children, onClick }) {
    return (
        <Button
            type="button"
            variant="outline"
            onClick={onClick}
            disabled={disabled}
            className={[
                "h-10 !rounded-lg border-slate-200 px-3 text-sm font-medium !bg-[#EAF5FE]",
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

export default function BillingInformationTab({ isEditing }) {
    const { control, setValue, watch } = useFormContext();
    const billing_method = watch("billing_method") || [];

    const toggleBilling = (val) => {
        if (!isEditing) return;
        const exists = billing_method.includes(val);
        const next = exists ? billing_method.filter((x) => x !== val) : [...billing_method, val];
        setValue("billing_method", next, { shouldDirty: true, shouldValidate: true });
    };

    return (
        <div className="space-y-5 rounded-xl border border-[#F3F4F6] bg-white p-6">
            <div className="text-sm font-bold text-[#194185]">Billing Method</div>

            <Card className=" !border-none bg-white p-0 shadow-none">
                <div className="flex flex-wrap gap-2">
                    {METHODS.map((m) => {
                        const Icon = m.icon;
                        const selected = billing_method.includes(m.value);

                        return (
                            <Chip
                                key={m.value}
                                selected={selected}
                                disabled={!isEditing}
                                onClick={() => toggleBilling(m.value)}
                            >
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="h-4 w-4" />
                </span>
                                {m.label}
                            </Chip>
                        );
                    })}
                </div>

                <div className="mt-2">
                    <FormField
                        control={control}
                        name="other_billing_method"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs text-slate-600">
                                    Other Billing Method
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        disabled={!isEditing}
                                        className="min-h-[110px] resize-none rounded-lg border-[#E5E7EB] bg-[#F3F4F6]"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </Card>
        </div>
    );
}


// // BillingInformationTab.jsx
// import React from "react";
// import { useFormContext } from "react-hook-form";
//
// import { Card } from "@components/ui/card";
// import { Button } from "@components/ui/button";
// import { Textarea } from "@components/ui/textarea";
// import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@components/ui/form";
//
// import { BadgeDollarSign, CalendarClock, DollarSign, MoreHorizontal } from "lucide-react";
//
// /**
//  * IMPORTANT:
//  * - Billing method chips are disabled unless isEditing
//  * - Textarea disabled unless isEditing
//  */
//
// const METHODS = [
//     { label: "Commission on Success", icon: BadgeDollarSign },
//     { label: "Hourly/Daily Rate", icon: CalendarClock },
//     { label: "Fixed fee / Flat Rate", icon: DollarSign },
//     { label: "Other", icon: MoreHorizontal },
// ];
//
// function Chip({ selected, disabled, children, onClick }) {
//     return (
//         <Button
//             type="button"
//             variant="outline"
//             onClick={onClick}
//             disabled={disabled}
//             className={[
//                 "h-10 rounded-xl border-slate-200 px-3 text-sm font-medium",
//                 selected
//                     ? "border-transparent bg-[#1f63ff] text-white hover:bg-[#1956df]"
//                     : "bg-white text-slate-700 hover:bg-slate-50",
//                 disabled ? "opacity-60 cursor-not-allowed" : "",
//             ].join(" ")}
//         >
//             {children}
//         </Button>
//     );
// }
//
// export default function BillingInformationTab({ isEditing }) {
//     const { control, setValue, watch } = useFormContext();
//     const billingMethod = watch("billingInfo.billingMethod");
//
//     return (
//         <div className="space-y-5">
//             <div className="text-sm font-semibold text-slate-900">Billing Method</div>
//
//             <Card className="rounded-2xl border border-slate-200 bg-white p-4 shadow-none sm:p-5">
//                 <div className="flex flex-wrap gap-2">
//                     {METHODS.map((m) => {
//                         const Icon = m.icon;
//                         const selected = billingMethod === m.label;
//                         return (
//                             <Chip
//                                 key={m.label}
//                                 selected={selected}
//                                 disabled={!isEditing}
//                                 onClick={() => {
//                                     if (!isEditing) return;
//                                     setValue("billingInfo.billingMethod", m.label, {
//                                         shouldDirty: true,
//                                         shouldValidate: true,
//                                     });
//                                 }}
//                             >
//                 <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-white/15">
//                   <Icon className="h-4 w-4" />
//                 </span>
//                                 {m.label}
//                             </Chip>
//                         );
//                     })}
//                 </div>
//
//                 <div className="mt-4">
//                     <FormField
//                         control={control}
//                         name="billingInfo.otherBillingMethods"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel className="text-xs text-slate-600">
//                                     Other Billing Methods<span className="text-red-500">*</span>
//                                 </FormLabel>
//                                 <FormControl>
//                                     <Textarea
//                                         {...field}
//                                         disabled={!isEditing}
//                                         className="min-h-[110px] resize-none rounded-2xl border-slate-200 bg-white"
//                                     />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                 </div>
//             </Card>
//         </div>
//     );
// }
