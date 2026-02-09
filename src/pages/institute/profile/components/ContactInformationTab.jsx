// ContactInformationTab.jsx
import React from "react";
import { useFormContext } from "react-hook-form";

import { Card } from "@components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@components/ui/form";
import { Input } from "@components/ui/input";
import {Building2, IdCard, Mail, Phone, User} from "lucide-react";

export default function ContactInformationTab({ isEditing }) {
    const { control } = useFormContext();

    return (
        <div className="space-y-5  rounded-xl border border-[#F3F4F6] bg-white p-6">
            <div className="text-sm font-bold text-[#194185]">Primary Contact Information</div>

            <Card className="!border-none bg-white p-0 shadow-none">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <FormField
                        control={control}
                        name="primary_contact_full_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs text-[#4B5563] !mb-0">
                                    Full Name<span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4B5563]" />
                                        <Input
                                            {...field}
                                            disabled={!isEditing}
                                            className="h-11 rounded-lg border-[#E5E7EB] bg-[#F3F4F6] !pl-10 text-[#6B7280] focus-visible:ring-0 focus-visible:border-blue-400"
                                        />
                                    </div>
                                    {/*<Input {...field} disabled={!isEditing} className="h-10 rounded-xl border-slate-200 bg-white" />*/}
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="primary_contact_position"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs text-[#4B5563] !mb-0">
                                    Position<span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4B5563]" />
                                        <Input
                                            {...field}
                                            disabled={!isEditing}
                                            className="h-11 rounded-lg border-[#E5E7EB] bg-[#F3F4F6] !pl-10 text-[#6B7280] focus-visible:ring-0 focus-visible:border-blue-400"
                                        />
                                    </div>
                                    {/*<Input {...field} disabled={!isEditing} className="h-10 rounded-xl border-slate-200 bg-white" />*/}
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="primary_contact_email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs text-[#4B5563] !mb-0">
                                    Email Address<span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4B5563]" />
                                        <Input
                                            {...field}
                                            disabled={!isEditing}
                                            className="h-11 rounded-lg border-[#E5E7EB] bg-[#F3F4F6] !pl-10 text-[#6B7280] focus-visible:ring-0 focus-visible:border-blue-400"
                                        />
                                    </div>
                                    {/*<Input {...field} disabled={!isEditing} className="h-10 rounded-xl border-slate-200 bg-white" />*/}
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/*<div className="sm:col-span-2" />*/}
                    <FormField
                        control={control}
                        name="primary_contact_phone"
                        render={({ field }) => (
                            <FormItem className="sm:col-span-1">
                                <FormLabel className="text-xs text-slate-600">
                                    Phone Number<span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4B5563]" />
                                        <Input
                                            {...field}
                                            disabled={!isEditing}
                                            className="h-11 rounded-lg border-[#E5E7EB] bg-[#F3F4F6] !pl-10 text-[#6B7280] focus-visible:ring-0 focus-visible:border-blue-400"
                                        />
                                    </div>
                                    {/*<Input {...field} disabled={!isEditing} className="h-10 rounded-xl border-slate-200 bg-white" />*/}
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


// // ContactInformationTab.jsx
// import React from "react";
// import { useFormContext } from "react-hook-form";
//
// import { Card } from "@components/ui/card";
// import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@components/ui/form";
// import { Input } from "@components/ui/input";
//
// export default function ContactInformationTab({ isEditing }) {
//     const { control } = useFormContext();
//
//     return (
//         <div className="space-y-5">
//             <div className="text-sm font-semibold text-slate-900">Primary Contact Information</div>
//
//             <Card className="rounded-2xl border border-slate-200 bg-white p-4 shadow-none sm:p-5">
//                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
//                     <FormField
//                         control={control}
//                         name="contactInfo.fullName"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel className="text-xs text-slate-600">
//                                     Full Name<span className="text-red-500">*</span>
//                                 </FormLabel>
//                                 <FormControl>
//                                     <Input {...field} disabled={!isEditing} className="h-10 rounded-xl border-slate-200 bg-white" />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//
//                     <FormField
//                         control={control}
//                         name="contactInfo.position"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel className="text-xs text-slate-600">
//                                     Position<span className="text-red-500">*</span>
//                                 </FormLabel>
//                                 <FormControl>
//                                     <Input {...field} disabled={!isEditing} className="h-10 rounded-xl border-slate-200 bg-white" />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//
//                     <FormField
//                         control={control}
//                         name="contactInfo.email"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel className="text-xs text-slate-600">
//                                     Email Address<span className="text-red-500">*</span>
//                                 </FormLabel>
//                                 <FormControl>
//                                     <Input {...field} disabled={!isEditing} className="h-10 rounded-xl border-slate-200 bg-white" />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//
//                     <div className="sm:col-span-2" />
//                     <FormField
//                         control={control}
//                         name="contactInfo.phoneNumber"
//                         render={({ field }) => (
//                             <FormItem className="sm:col-span-1">
//                                 <FormLabel className="text-xs text-slate-600">
//                                     Phone Number<span className="text-red-500">*</span>
//                                 </FormLabel>
//                                 <FormControl>
//                                     <Input {...field} disabled={!isEditing} className="h-10 rounded-xl border-slate-200 bg-white" />
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
