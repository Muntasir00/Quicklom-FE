import React, {useEffect} from "react";
import {z} from "zod";
import {FormProvider, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

import {Card, CardContent, CardHeader} from "@components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@components/ui/tabs";
import {Button} from "@components/ui/button";

import {
    Building2,
    ClipboardList,
    CreditCard,
    FileText,
    Pencil,
    Save,
    X,
    Eye, User2, Settings,
} from "lucide-react";

import InstituteCategoryDetailsTab from "./InstituteCategoryDetailsTab";
import ContactInformationTab from "./ContactInformationTab";
import ServiceDetailsTab from "./ServiceDetailsTab";
import BillingInformationTab from "./BillingInformationTab";
import RequiredDocumentTab from "./RequiredDocumentTab";

// ---------- Zod Schema (EXACT BACKEND KEYS) ----------
export const instituteProfileSchema = z.object({
    institute_category_id: z.string().min(1, "Category is required"),
    institute_specialty_ids: z.array(z.any()).optional().default([]),

    agency_name: z.string().min(1, "Agency name is required"),
    business_number: z.string().min(1, "Business number is required"),
    province: z.string().min(1, "Province is required"),
    city: z.string().min(1, "City is required"),
    postal_code: z.string().min(1, "Postal code is required"),
    head_office_address: z.string().min(1, "Head office address is required"),
    phone_number: z.string().min(1, "Phone number is required"),
    email_address: z.string().email("Enter a valid email"),
    website: z.string().optional().default(""),

    primary_contact_full_name: z.string().min(1, "Full name is required"),
    primary_contact_position: z.string().min(1, "Position is required"),
    primary_contact_email: z.string().email("Enter a valid email"),
    primary_contact_phone: z.string().min(1, "Phone number is required"),

    specialties_covered: z.array(z.string()).min(1, "Pick at least one specialty"),
    regions_served: z.array(z.string()).min(1, "Pick at least one region"),
    types_of_contracts_managed: z.array(z.string()).min(1, "Pick at least one contract type"),

    years_of_experience: z.coerce.number().min(0),
    number_of_recruiters: z.coerce.number().min(0),

    recruitment_process_description: z.string().optional().default(""),
    licensing_accreditation: z.string().optional().default(""),

    proof_of_business_registration: z.any().optional(),
    proof_of_liability_insurance: z.any().optional(),
    confidentiality_agreement: z.any().optional(),

    billing_method: z.array(z.string()).min(1, "Pick at least one billing method"),
    other_billing_method: z.string().optional().default(""),
});

const emptyDefaults = {
    institute_category_id: "",
    institute_specialty_ids: [],

    agency_name: "",
    business_number: "",
    province: "",
    city: "",
    postal_code: "",
    head_office_address: "",
    phone_number: "",
    email_address: "",
    website: "",

    primary_contact_full_name: "",
    primary_contact_position: "",
    primary_contact_email: "",
    primary_contact_phone: "",

    specialties_covered: [],
    regions_served: [],
    types_of_contracts_managed: [],

    years_of_experience: 0,
    number_of_recruiters: 0,

    recruitment_process_description: "",
    licensing_accreditation: "",

    proof_of_business_registration: "",
    proof_of_liability_insurance: "",
    confidentiality_agreement: "",

    billing_method: [],
    other_billing_method: "",
};

export default function InstituteProfile({
                                             initialData, // <-- backend response.data.data object
                                             categoryName,
                                             isEditing,
                                             onEdit,
                                             onSave,
                                             onCancel,
                                             onSelectFile, // (fieldKey, file)
                                         }) {
    const form = useForm({
        resolver: zodResolver(instituteProfileSchema),
        defaultValues: emptyDefaults,
        mode: "onSubmit",
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                ...emptyDefaults,
                ...initialData,
                // Convert server strings -> numbers for number inputs
                years_of_experience: Number(initialData.years_of_experience ?? 0),
                number_of_recruiters: Number(initialData.number_of_recruiters ?? 0),
            });
        }
    }, [initialData]);

    const handleSave = form.handleSubmit((values) => {
        // eslint-disable-next-line no-console
        console.log("ALL VALUES:", values);
        onSave(values);
    });

    return (
        <div className="">
            <div className="">
                {/* Header Card */}
                <Card className="overflow-hidden py-0 bg-[#F3F9FE] gap-5">
                    <CardHeader
                        className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div className="flex items-start gap-3">
                            <div
                                className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#FBFBFB] text-[#2D8FE3] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.07)]">
                                <Building2 className="h-6 w-6"/>
                            </div>
                            <div>
                                <div className="text-base font-semibold text-[#18202A]">
                                    Institute Profile
                                </div>
                                <div className="text-sm text-[#2A394B]">
                                    Manage your institute details and settings
                                </div>
                            </div>
                        </div>

                        {!isEditing ? (
                            <Button
                                className="h-10 rounded-lg bg-[#1f63ff] px-4 text-white hover:bg-[#1956df]"
                                onClick={onEdit}
                            >
                                <Pencil className="mr-2 h-4 w-4"/>
                                Edit Profile
                            </Button>
                        ) : (
                            <div className="flex w-full gap-2 sm:w-auto">
                                <Button
                                    className="h-10 flex-1 rounded-lg bg-[#1f63ff] px-4 text-white hover:bg-[#1956df] sm:flex-none"
                                    onClick={handleSave}
                                >
                                    <Save className="mr-2 h-4 w-4"/>
                                    Save
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-10 flex-1 rounded-lg border-slate-200 bg-white px-4 text-slate-700 hover:bg-slate-50 sm:flex-none"
                                    onClick={onCancel}
                                >
                                    <X className="mr-2 h-4 w-4"/>
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </CardHeader>

                    <CardContent className="pb-6">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <SummaryMiniCard
                                label="Category"
                                value={categoryName || "Recruitment Agency"}
                                icon={<Building2 className="h-6 w-6"/>}
                            />
                            <SummaryMiniCard
                                label="Specialties"
                                value={
                                    (initialData?.specialties_covered?.length || 0) > 0
                                        ? initialData.specialties_covered.join(", ")
                                        : "Not Set"
                                }
                                icon={<ClipboardList className="h-6 w-6"/>}
                            />
                            <SummaryMiniCard
                                label="Mode"
                                value={isEditing ? "Editing" : "Viewing"}
                                icon={<Eye className="h-6 w-6"/>}
                                valueTone={isEditing ? "editing" : "viewing"}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <FormProvider {...form}>
                    <Tabs defaultValue="category" className="mt-6 w-full">
                        <div className=" bg-white overflow-hidden">

                            {/* বর্ডার অংশ: এখানে border-b-2 এবং slate-100/200 ব্যবহার করুন */}
                            <div className="">
                                <TabsList
                                    className="
                                                   w-full !justify-start h-auto p-0 bg-transparent gap-3
                                                  /* পুরো লাইনের নিচে হালকা ধূসর বর্ডার (#E5E7EB) */
                                                  border-b border-[#E5E7EB]
                                                  rounded-none mb-8 overflow-x-auto flex-nowrap
                                                "
                                >
                                    <CustomTabTrigger value="category" icon={<Building2/>}
                                                      label="Institute Category & Details"/>
                                    <CustomTabTrigger value="contact" icon={<User2/>} label="Contact Information"/>
                                    <CustomTabTrigger value="service" icon={<Settings/>} label="Service Details"/>
                                    <CustomTabTrigger value="billing" icon={<CreditCard/>} label="Billing Information"/>
                                    <CustomTabTrigger value="docs" icon={<FileText/>} label="Required Document"/>
                                </TabsList>
                            </div>

                            <div className="">
                                <TabsContent value="category" className="m-0">
                                    <InstituteCategoryDetailsTab isEditing={isEditing}/>
                                </TabsContent>
                                <TabsContent value="contact" className="m-0">
                                    <ContactInformationTab isEditing={isEditing}/>
                                </TabsContent>
                                <TabsContent value="service" className="m-0">
                                    <ServiceDetailsTab isEditing={isEditing}/>
                                </TabsContent>
                                <TabsContent value="billing" className="m-0">
                                    <BillingInformationTab isEditing={isEditing}/>
                                </TabsContent>
                                <TabsContent value="docs" className="m-0">
                                    <RequiredDocumentTab
                                        isEditing={isEditing}
                                        onSelectFile={onSelectFile}
                                    />
                                </TabsContent>
                            </div>
                        </div>
                    </Tabs>
                </FormProvider>

                <div className="h-6"/>
            </div>
        </div>
    );
}

const CustomTabTrigger = ({value, icon, label}) => (
    <TabsTrigger
        value={value}
        className="
      group relative flex items-center gap-3 px-1 pt-1 pb-3
      text-[#64748B] font-medium text-[15px]
      bg-transparent rounded-none shadow-none transition-all
      data-[state=active]:text-[#3B82F6]
      data-[state=active]:bg-transparent
      data-[state=active]:shadow-none
    "
    >
        {/* Icon Container */}
        <div className="
      flex items-center justify-center w-8 h-8 rounded-lg transition-all
      group-data-[state=active]:bg-[#3B82F6] group-data-[state=active]:text-white
      text-[#94A3B8]
    ">
            {React.cloneElement(icon, {size: 18})}
        </div>

        {/* Label Text */}
        <span className="whitespace-nowrap">{label}</span>
        <div className="
      absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#3B82F6]
      scale-x-0 group-data-[state=active]:scale-x-100 transition-transform
    "/>
    </TabsTrigger>
);

function SummaryMiniCard({label, value, icon, valueTone}) {
    const tone = valueTone === "editing" ? "text-[#1f63ff]" : "text-slate-900";
    return (
        <div className="flex items-center justify-between rounded-lg bg-[#FFFFFF] p-3 gap-4">
            <div>
                <div className="text-xs font-medium text-slate-500">{label}</div>
                <div className={`mt-0.5 text-sm font-semibold ${tone}`}>{value}</div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#EAF5FE] text-[#2D8FE3]">
                {icon}
            </div>
        </div>
    );
}


// // InstituteProfilePage.jsx
// import React, { useEffect } from "react";
// import { z } from "zod";
// import { FormProvider, useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
//
// import { Card, CardContent, CardHeader } from "@components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
// import { Button } from "@components/ui/button";
// import { Separator } from "@components/ui/separator";
//
// import {
//     Building2,
//     ClipboardList,
//     CreditCard,
//     FileText,
//     Pencil,
//     Phone,
//     Save,
//     X,
//     Eye,
// } from "lucide-react";
//
// import InstituteCategoryDetailsTab from "./InstituteCategoryDetailsTab";
// import ContactInformationTab from "./ContactInformationTab";
// import ServiceDetailsTab from "./ServiceDetailsTab";
// import BillingInformationTab from "./BillingInformationTab";
// import RequiredDocumentTab from "./RequiredDocumentTab";
//
// // ---------------- Schema ----------------
// export const instituteProfileSchema = z.object({
//     categoryDetails: z.object({
//         category: z.string().min(1),
//         verified: z.boolean().default(true),
//
//         agencyName: z.string().min(1, "Agency name is required"),
//         business_number: z.string().min(1, "Business name is required"),
//         headOfficeAddress: z.string().min(1, "Head office address is required"),
//
//         city: z.string().min(1, "City is required"),
//         province: z.string().min(1, "Province is required"),
//         postalCode: z.string().min(1, "Postal code is required"),
//
//         phoneNumber: z.string().min(1, "Phone number is required"),
//         email: z.string().email("Enter a valid email"),
//         website: z.string().min(1, "Website is required"),
//     }),
//
//     contactInfo: z.object({
//         fullName: z.string().min(1, "Full name is required"),
//         position: z.string().min(1, "Position is required"),
//         email: z.string().email("Enter a valid email"),
//         phoneNumber: z.string().min(1, "Phone number is required"),
//     }),
//
//     serviceDetails: z.object({
//         specialties: z.array(z.string()).min(1, "Pick at least one specialty"),
//         regions: z.array(z.string()).min(1, "Pick at least one region"),
//         contractTypes: z.array(z.string()).min(1, "Pick at least one contract type"),
//
//         yearsExperience: z.coerce.number().min(0),
//         numberOfRecruiters: z.coerce.number().min(0),
//         licensingAccreditation: z.string().optional().default(""),
//         recruitmentProcessDescription: z.string().optional().default(""),
//     }),
//
//     billingInfo: z.object({
//         billingMethod: z.string().min(1, "Pick a billing method"),
//         otherBillingMethods: z.string().optional().default(""),
//     }),
//
//     requiredDocuments: z.object({
//         documents: z.array(
//             z.object({
//                 id: z.string(),
//                 name: z.string(),
//                 sizeMb: z.number(),
//             })
//         ),
//     }),
// });
//
// export default function InstituteProfile({
//                                                  initialValues,
//                                                  isEditing,
//                                                  onEdit,
//                                                  onSave,
//                                                  onCancel,
//                                              }) {
//     const form = useForm({
//         resolver: zodResolver(instituteProfileSchema),
//         defaultValues: initialValues,
//         mode: "onSubmit",
//     });
//
//     useEffect(() => {
//         form.reset(initialValues);
//     }, [initialValues]);
//
//     const modeLabel = isEditing ? "Editing" : "Viewing";
//
//     const handleSave = form.handleSubmit((values) => {
//         console.log("ALL VALUES:", values);
//         onSave(values);
//     });
//
//     const handleCancel = () => {
//         form.reset(initialValues);
//         onCancel();
//     };
//
//     return (
//         <div className="min-h-screen bg-[#f5f7fb]">
//             <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
//                 {/* Header + Summary */}
//                 <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)]">
//                     <CardHeader className="flex flex-col gap-4 bg-gradient-to-b from-[#f7fbff] to-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
//                         <div className="flex items-start gap-3">
//                             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf3ff] text-[#1f63ff]">
//                                 <Building2 className="h-5 w-5" />
//                             </div>
//                             <div>
//                                 <div className="text-lg font-semibold text-slate-900">
//                                     Institute Profile
//                                 </div>
//                                 <div className="text-sm text-slate-500">
//                                     Manage your institute details and settings
//                                 </div>
//                             </div>
//                         </div>
//
//                         {!isEditing ? (
//                             <Button
//                                 className="h-10 rounded-xl bg-[#1f63ff] px-4 text-white hover:bg-[#1956df]"
//                                 onClick={onEdit}
//                             >
//                                 <Pencil className="mr-2 h-4 w-4" />
//                                 Edit Profile
//                             </Button>
//                         ) : (
//                             <div className="flex w-full gap-2 sm:w-auto">
//                                 <Button
//                                     className="h-10 flex-1 rounded-xl bg-[#1f63ff] px-4 text-white hover:bg-[#1956df] sm:flex-none"
//                                     onClick={handleSave}
//                                 >
//                                     <Save className="mr-2 h-4 w-4" />
//                                     Save
//                                 </Button>
//                                 <Button
//                                     variant="outline"
//                                     className="h-10 flex-1 rounded-xl border-slate-200 bg-white px-4 text-slate-700 hover:bg-slate-50 sm:flex-none"
//                                     onClick={handleCancel}
//                                 >
//                                     <X className="mr-2 h-4 w-4" />
//                                     Cancel
//                                 </Button>
//                             </div>
//                         )}
//                     </CardHeader>
//
//                     <CardContent className="px-5 pb-6 pt-2 sm:px-6">
//                         <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
//                             <SummaryMiniCard
//                                 label="Category"
//                                 value={initialValues?.categoryDetails?.category || "—"}
//                                 icon={<Building2 className="h-4 w-4" />}
//                             />
//                             <SummaryMiniCard
//                                 label="Specialties"
//                                 value={
//                                     (initialValues?.serviceDetails?.specialties?.length || 0) > 0
//                                         ? initialValues.serviceDetails.specialties.join(", ")
//                                         : "Not Set"
//                                 }
//                                 icon={<ClipboardList className="h-4 w-4" />}
//                             />
//                             <SummaryMiniCard
//                                 label="Mode"
//                                 value={modeLabel}
//                                 icon={<Eye className="h-4 w-4" />}
//                                 valueTone={isEditing ? "editing" : "viewing"}
//                             />
//                         </div>
//                     </CardContent>
//                 </Card>
//
//                 <FormProvider {...form}>
//                     <Tabs defaultValue="category" className="mt-6">
//                         <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)]">
//                             <div className="px-3 pt-2 sm:px-4">
//                                 <TabsList className="h-auto w-full justify-start gap-1 rounded-xl bg-white p-1">
//                                     <TabBtn value="category" icon={Building2} label="Institute Category & Details" />
//                                     <TabBtn value="contact" icon={Phone} label="Contact Information" />
//                                     <TabBtn value="service" icon={ClipboardList} label="Service Details" />
//                                     <TabBtn value="billing" icon={CreditCard} label="Billing Information" />
//                                     <TabBtn value="docs" icon={FileText} label="Required Document" />
//                                 </TabsList>
//                                 <Separator className="mt-2 bg-slate-200" />
//                             </div>
//
//                             <div className="p-4 sm:p-6">
//                                 <TabsContent value="category" className="m-0">
//                                     <InstituteCategoryDetailsTab isEditing={isEditing} />
//                                 </TabsContent>
//                                 <TabsContent value="contact" className="m-0">
//                                     <ContactInformationTab isEditing={isEditing} />
//                                 </TabsContent>
//                                 <TabsContent value="service" className="m-0">
//                                     <ServiceDetailsTab isEditing={isEditing} />
//                                 </TabsContent>
//                                 <TabsContent value="billing" className="m-0">
//                                     <BillingInformationTab isEditing={isEditing} />
//                                 </TabsContent>
//                                 <TabsContent value="docs" className="m-0">
//                                     <RequiredDocumentTab isEditing={isEditing} />
//                                 </TabsContent>
//                             </div>
//                         </div>
//                     </Tabs>
//                 </FormProvider>
//
//                 <div className="h-6" />
//             </div>
//         </div>
//     );
// }
//
// function TabBtn({ value, icon: Icon, label }) {
//     return (
//         <TabsTrigger
//             value={value}
//             className={[
//                 "group relative flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium",
//                 "text-slate-600 data-[state=active]:text-[#1f63ff]",
//                 "data-[state=active]:bg-[#eef6ff] hover:bg-slate-50",
//                 "transition-colors",
//             ].join(" ")}
//         >
//             <Icon className="h-4 w-4" />
//             <span className="hidden sm:inline">{label}</span>
//             <span className="sm:hidden">{label.split(" ")[0]}</span>
//             <span className="absolute -bottom-[9px] left-3 right-3 hidden h-[2px] rounded-full bg-[#1f63ff] data-[state=active]:block sm:block" />
//         </TabsTrigger>
//     );
// }
//
// function SummaryMiniCard({ label, value, icon, valueTone }) {
//     const tone =
//         valueTone === "editing"
//             ? "text-[#1f63ff]"
//             : valueTone === "viewing"
//                 ? "text-slate-900"
//                 : "text-slate-900";
//
//     return (
//         <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-[#f7fbff] px-4 py-3">
//             <div>
//                 <div className="text-xs font-medium text-slate-500">{label}</div>
//                 <div className={`mt-0.5 text-sm font-semibold ${tone}`}>{value}</div>
//             </div>
//             <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
//                 {icon}
//             </div>
//         </div>
//     );
// }
