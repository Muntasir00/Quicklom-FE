// InstituteCategoryDetailsTab.jsx
import React from "react";
import {useFormContext} from "react-hook-form";

import {Card} from "@components/ui/card";
import {Badge} from "@components/ui/badge";
import {Separator} from "@components/ui/separator";
import {FormField, FormItem, FormLabel, FormControl, FormMessage} from "@components/ui/form";
import {Input} from "@components/ui/input";

import {Building2, Chromium, IdCard, Info, Lock, Mail, MapPin, PhoneCall, ShieldCheck} from "lucide-react";
import {Web} from "@mui/icons-material";

export default function InstituteCategoryDetailsTab({isEditing}) {
    const {control} = useFormContext();

    return (
        <div className="space-y-5 rounded-xl border border-[#F3F4F6] bg-white p-6">
            <div>
                <div className="text-sm font-bold text-[#194185]">Institute Category</div>
                <div className="mt-3 rounded-lg bg-[#EEF7FF] p-3">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#FBFBFB] text-[#2D8FE3]">
                                <Lock className="h-5 w-5"/>
                            </div>
                            <div>
                                <div className="text-sm text-[#194185]">Category</div>
                                <div className="text-lg font-medium text-[#194185]">
                                    Recruitment Agency
                                </div>
                            </div>
                        </div>

                        <Badge className="rounded-lg bg-[#34C759] px-3 py-2 text-white hover:bg-[#22c55e]">
                            <ShieldCheck className="mr-1 h-4 w-4"/>
                            Verified
                        </Badge>
                    </div>

                </div>
            </div>

            <div className="mt-3 rounded-lg bg-[#FCF1F1] p-3 text-xs text-[#2A394B] flex gap-3 items-center">
                <Info className="text-[#ED354A] w-3 h-3"/>
                Institute Category cannot be changed once saved. Contact support if you need to modify this.
            </div>


            <div>
                <div className="text-sm font-bold text-[#194185]">Agency Information</div>

                <Card className="mt-3 !border-none bg-white p-0 shadow-none">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <FormField
                            control={control}
                            name="agency_name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-[#4B5563] !mb-0">
                                        Agency Name<span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Building2
                                                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4B5563]"/>
                                            <Input
                                                {...field}
                                                disabled={!isEditing}
                                                className="h-11 rounded-lg border-[#E5E7EB] bg-[#F3F4F6] !pl-10 text-[#6B7280] focus-visible:ring-0 focus-visible:border-blue-400"
                                            />
                                        </div>
                                        {/*<Input {...field} disabled={!isEditing}*/}
                                        {/*       className="h-10 rounded-lg border-[#E5E7EB] bg-[#F3F4F6]"/>*/}
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="business_number"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-[#4B5563] !mb-0">
                                        Business Number<span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <IdCard
                                                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4B5563]"/>
                                            <Input
                                                {...field}
                                                disabled={!isEditing}
                                                className="h-11 rounded-lg border-[#E5E7EB] bg-[#F3F4F6] !pl-10 text-[#6B7280] focus-visible:ring-0 focus-visible:border-blue-400"
                                            />
                                        </div>
                                        {/*<Input {...field} disabled={!isEditing}*/}
                                        {/*       className="h-10 rounded-xl border-slate-200 bg-white"/>*/}
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="head_office_address"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-[#4B5563] !mb-0">
                                        Head Office Address<span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <MapPin
                                                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4B5563]"/>
                                            <Input
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
                            name="city"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-[#4B5563] !mb-0">
                                        City<span className="text-red-500">*</span>
                                    </FormLabel>
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
                            name="province"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-[#4B5563] !mb-0">
                                        Province<span className="text-red-500">*</span>
                                    </FormLabel>
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
                            name="postal_code"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-[#4B5563] !mb-0">
                                        Postal Code<span className="text-red-500">*</span>
                                    </FormLabel>
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
                            name="phone_number"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-[#4B5563] !mb-0">
                                        Phone Number<span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <PhoneCall
                                                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4B5563]"/>
                                            <Input
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
                            name="email_address"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-[#4B5563] !mb-0">
                                        Email Address<span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Mail
                                                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4B5563]"/>
                                            <Input
                                                type="email"
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
                            name="website"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-[#4B5563] !mb-0">Website</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Chromium
                                                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4B5563]"/>
                                            <Input
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
                    </div>
                </Card>
            </div>
        </div>
    );
}


// // InstituteCategoryDetailsTab.jsx
// import React from "react";
// import { useFormContext } from "react-hook-form";
//
// import { Card } from "@components/ui/card";
// import { Badge } from "@components/ui/badge";
// import { Separator } from "@components/ui/separator";
// import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@components/ui/form";
// import { Input } from "@components/ui/input";
//
// import { Lock, ShieldCheck } from "lucide-react";
//
// export default function InstituteCategoryDetailsTab({ isEditing }) {
//     const { control, watch } = useFormContext();
//     const verified = watch("categoryDetails.verified");
//
//     return (
//         <div className="space-y-5">
//             <div>
//                 <div className="text-sm font-semibold text-slate-900">Institute Category</div>
//                 <div className="mt-3 rounded-2xl border border-slate-200 bg-[#f7fbff] px-4 py-4">
//                     <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//                         <div className="flex items-center gap-3">
//                             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
//                                 <Lock className="h-5 w-5" />
//                             </div>
//                             <div>
//                                 <div className="text-xs font-medium text-slate-500">Category</div>
//                                 <div className="mt-0.5 text-sm font-semibold text-[#1f63ff]">
//                                     {watch("categoryDetails.category") || "—"}
//                                 </div>
//                             </div>
//                         </div>
//
//                         {verified ? (
//                             <Badge className="rounded-full bg-[#22c55e] px-3 py-1 text-white hover:bg-[#22c55e]">
//                                 <ShieldCheck className="mr-1 h-4 w-4" />
//                                 Verified
//                             </Badge>
//                         ) : null}
//                     </div>
//
//                     <div className="mt-3 rounded-xl border border-[#ffd6d6] bg-[#fff4f4] px-3 py-2 text-xs text-[#d14b4b]">
//                         Institute Category cannot be changed once saved. Contact support if you need to modify this.
//                     </div>
//                 </div>
//             </div>
//
//             <Separator className="bg-slate-200" />
//
//             <div>
//                 <div className="text-sm font-semibold text-slate-900">Agency Information</div>
//
//                 <Card className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-none sm:p-5">
//                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
//                         <FormField
//                             control={control}
//                             name="categoryDetails.agencyName"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel className="text-xs text-slate-600">
//                                         Agency Name<span className="text-red-500">*</span>
//                                     </FormLabel>
//                                     <FormControl>
//                                         <Input {...field} disabled={!isEditing} className="h-10 rounded-xl border-slate-200 bg-white" />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//
//                         <FormField
//                             control={control}
//                             name="categoryDetails.business_number"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel className="text-xs text-slate-600">
//                                         Business Name<span className="text-red-500">*</span>
//                                     </FormLabel>
//                                     <FormControl>
//                                         <Input {...field} disabled={!isEditing} className="h-10 rounded-xl border-slate-200 bg-white" />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//
//                         <FormField
//                             control={control}
//                             name="categoryDetails.headOfficeAddress"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel className="text-xs text-slate-600">
//                                         Head Office Address<span className="text-red-500">*</span>
//                                     </FormLabel>
//                                     <FormControl>
//                                         <Input {...field} disabled={!isEditing} className="h-10 rounded-xl border-slate-200 bg-white" />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//
//                         <FormField
//                             control={control}
//                             name="categoryDetails.city"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel className="text-xs text-slate-600">
//                                         City<span className="text-red-500">*</span>
//                                     </FormLabel>
//                                     <FormControl>
//                                         <Input {...field} disabled={!isEditing} className="h-10 rounded-xl border-slate-200 bg-white" />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//
//                         <FormField
//                             control={control}
//                             name="categoryDetails.province"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel className="text-xs text-slate-600">
//                                         Province<span className="text-red-500">*</span>
//                                     </FormLabel>
//                                     <FormControl>
//                                         <Input {...field} disabled={!isEditing} className="h-10 rounded-xl border-slate-200 bg-white" />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//
//                         <FormField
//                             control={control}
//                             name="categoryDetails.postalCode"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel className="text-xs text-slate-600">
//                                         Postal Code<span className="text-red-500">*</span>
//                                     </FormLabel>
//                                     <FormControl>
//                                         <Input {...field} disabled={!isEditing} className="h-10 rounded-xl border-slate-200 bg-white" />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//
//                         <FormField
//                             control={control}
//                             name="categoryDetails.phoneNumber"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel className="text-xs text-slate-600">
//                                         Phone Number<span className="text-red-500">*</span>
//                                     </FormLabel>
//                                     <FormControl>
//                                         <Input {...field} disabled={!isEditing} className="h-10 rounded-xl border-slate-200 bg-white" />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//
//                         <FormField
//                             control={control}
//                             name="categoryDetails.email"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel className="text-xs text-slate-600">
//                                         Email Address<span className="text-red-500">*</span>
//                                     </FormLabel>
//                                     <FormControl>
//                                         <Input {...field} disabled={!isEditing} className="h-10 rounded-xl border-slate-200 bg-white" />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//
//                         <FormField
//                             control={control}
//                             name="categoryDetails.website"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel className="text-xs text-slate-600">
//                                         Website<span className="text-red-500">*</span>
//                                     </FormLabel>
//                                     <FormControl>
//                                         <Input {...field} disabled={!isEditing} className="h-10 rounded-xl border-slate-200 bg-white" />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//                     </div>
//                 </Card>
//             </div>
//         </div>
//     );
// }
