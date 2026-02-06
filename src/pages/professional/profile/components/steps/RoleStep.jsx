import React, { useMemo, useEffect } from "react";
import { Card, CardContent } from "@components/ui/card.jsx";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@components/ui/select.jsx";
import { Building2 } from "lucide-react";

export default function RoleStep({ form, categories = [], selectedCategory, onNext, onCancel }) {
    const {
        watch,
        setValue,
        formState: { errors },
    } = form;

    // Watch fields
    const categoryId = watch("professional_category_id");
    const selectedRoleIds = watch("professional_role_ids") || [];
    const selectedRoleId = selectedRoleIds.length > 0 ? String(selectedRoleIds[0]) : "";
    const specialistDentistRole = watch("specialist_dentist_role");

    // Memoized selected role object
    const selectedRole = useMemo(() => {
        if (!selectedCategory?.professional_roles || !selectedRoleId) return null;
        return selectedCategory.professional_roles.find(
            (r) => String(r.id) === String(selectedRoleId)
        );
    }, [selectedCategory, selectedRoleId]);

    // Check if it's a specialist dentist
    const isSpecialistDentist = useMemo(() => {
        return (selectedRole?.name || "").trim().toLowerCase() === "specialist dentist";
    }, [selectedRole]);

    // Sync is_specialist_dentist field with state
    useEffect(() => {
        setValue("is_specialist_dentist", isSpecialistDentist);
        if (!isSpecialistDentist) {
            setValue("specialist_dentist_role", "");
        }
    }, [isSpecialistDentist, setValue]);

    return (
        <div>
            <Card className="py-0 border-[#F3F4F6] rounded-xl">
                <CardContent className="p-0">
                    <div className="px-4 py-6 md:px-6 md:py-8">
                        <h3 className="text-sm font-semibold text-slate-900">
                            Professional Category &amp; Role
                        </h3>

                        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
                            {/* Professional Category */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-700">
                                    Professional Category <span className="text-red-600">*</span>
                                </label>

                                <Select
                                    value={categoryId ? String(categoryId) : ""}
                                    onValueChange={(v) => {
                                        setValue("professional_category_id", v, { shouldValidate: true });
                                        // Reset dependent fields
                                        setValue("professional_role_ids", [], { shouldValidate: true });
                                        setValue("specialist_dentist_role", "");
                                    }}
                                >
                                    <SelectTrigger className="h-11 w-full rounded-lg border-slate-200 bg-white">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories?.map((cat) => (
                                            <SelectItem key={cat.id} value={String(cat.id)}>
                                                <span className="inline-flex items-center gap-2">
                                                    <Building2 className="h-4 w-4" /> {cat.name}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.professional_category_id && (
                                    <p className="text-xs text-red-600">{errors.professional_category_id.message}</p>
                                )}
                            </div>

                            {/* Professional Role */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-700">
                                    Professional Role <span className="text-red-600">*</span>
                                </label>

                                <Select
                                    value={selectedRoleId}
                                    disabled={!selectedCategory}
                                    onValueChange={(v) => {
                                        if (!v) return;
                                        // Store as number array if your schema needs numbers
                                        setValue("professional_role_ids", [Number(v)], { shouldValidate: true });
                                    }}
                                >
                                    <SelectTrigger className="h-11 w-full rounded-lg border-slate-200 bg-white">
                                        <SelectValue placeholder={selectedCategory ? "Select role" : "Select category first"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedCategory?.professional_roles?.map((role) => (
                                            <SelectItem key={role.id} value={String(role.id)}>
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.professional_role_ids && (
                                    <p className="text-xs text-red-600">{errors.professional_role_ids.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Specialist Dentist Specialty Selection */}
                        {isSpecialistDentist && (
                            <div className="mt-6">
                                <p className="text-xs font-semibold text-blue-700">Specialist Dentist Selected</p>
                                <div className="mt-3 space-y-2">
                                    <label className="text-xs font-medium text-slate-700">
                                        Dental Specialty <span className="text-red-600">*</span>
                                    </label>
                                    <Select
                                        value={specialistDentistRole || ""}
                                        onValueChange={(v) => setValue("specialist_dentist_role", v, { shouldValidate: true })}
                                    >
                                        <SelectTrigger className="h-11 w-full rounded-lg border-slate-200 bg-white">
                                            <SelectValue placeholder="Select specialty" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="orthodontist">Orthodontist</SelectItem>
                                            <SelectItem value="endodontist">Endodontist</SelectItem>
                                            <SelectItem value="periodontist">Periodontist</SelectItem>
                                            <SelectItem value="pediatric dentist">Pediatric Dentist</SelectItem>
                                            <SelectItem value="prosthodontist">Prosthodontist</SelectItem>
                                            <SelectItem value="oral and maxillofacial surgeon">Oral & Maxillofacial Surgeon</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.specialist_dentist_role && (
                                        <p className="text-xs text-red-600">{errors.specialist_dentist_role.message}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="mt-6 flex justify-start gap-3">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="!rounded-md bg-slate-100 px-6 py-2 text-slate-800">
                        Back
                    </button>
                )}
                <button type="button" onClick={onNext} className="!rounded-md bg-blue-600 px-6 py-2 text-white">
                    Continue
                </button>
            </div>
        </div>
    );
}



// import React from "react";
// import {Card, CardContent} from "@components/ui/card.jsx";
// import {
//     Select,
//     SelectTrigger,
//     SelectValue,
//     SelectContent,
//     SelectItem,
// } from "@components/ui/select.jsx";
// import {Building2} from "lucide-react";
//
// export default function RoleStep({ onNext }) {
//     return (
//         <div className="">
//             <Card className="py-0 mt-3 border-[#F3F4F6] rounded-xl">
//                 <CardContent className="p-0">
//                     {/* Form area */}
//                     <div className="px-4 py-6 md:px-6 md:py-8">
//                         <h3 className="text-sm font-semibold text-slate-900">
//                             Professional Category &amp; Role
//                         </h3>
//
//                         <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
//                             {/* Professional Category */}
//                             <div className="space-y-2">
//                                 <label className="text-xs font-medium text-slate-700">
//                                     Professional Category{" "}
//                                     <span className="text-red-600">*</span>
//                                 </label>
//                                 <Select defaultValue="agency-01">
//                                     <SelectTrigger
//                                         className="h-11 rounded-lg border-slate-200 bg-white w-full">
//                                         <SelectValue placeholder="Select category"/>
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value="agency-01"><Building2/> agency 01</SelectItem>
//                                         <SelectItem value="agency-02"><Building2/> agency 02</SelectItem>
//                                         <SelectItem value="agency-03"><Building2/> agency 03</SelectItem>
//                                     </SelectContent>
//                                 </Select>
//                             </div>
//
//                             {/* Professional Role */}
//                             <div className="space-y-2">
//                                 <label className="text-xs font-medium text-slate-700">
//                                     Professional Role <span className="text-red-600">*</span>
//                                 </label>
//                                 <Select defaultValue="general-dentist">
//                                     <SelectTrigger
//                                         className="h-11 rounded-lg border-slate-200 bg-white w-full">
//                                         <SelectValue placeholder="Select role"/>
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value="general-dentist">
//                                             General Dentist
//                                         </SelectItem>
//                                         <SelectItem value="specialist-dentist">
//                                             Specialist Dentist
//                                         </SelectItem>
//                                     </SelectContent>
//                                 </Select>
//                             </div>
//                         </div>
//
//                         {/* Specialist Dentist Selected */}
//                         <div className="mt-6">
//                             <p className="text-xs font-semibold text-blue-700">
//                                 Specialist Dentist Selected
//                             </p>
//
//                             <div className="mt-3 space-y-2">
//                                 <label className="text-xs font-medium text-slate-700">
//                                     Dental Specialty <span className="text-red-600">*</span>
//                                 </label>
//                                 <Select defaultValue="endodontics">
//                                     <SelectTrigger
//                                         className="h-11 rounded-lg border-slate-200 bg-white w-full">
//                                         <SelectValue placeholder="Select specialty"/>
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem
//                                             value="endodontics"><Building2/> Endodontics</SelectItem>
//                                         <SelectItem
//                                             value="orthodontics"><Building2/> Orthodontics</SelectItem>
//                                         <SelectItem
//                                             value="periodontics"><Building2/> Periodontics</SelectItem>
//                                         <SelectItem value="prosthodontics">
//                                             Prosthodontics
//                                         </SelectItem>
//                                     </SelectContent>
//                                 </Select>
//                             </div>
//                         </div>
//
//                         {/* Footer buttons */}
//                         {/*<div*/}
//                         {/*    className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-start">*/}
//                         {/*    <Button*/}
//                         {/*        variant="ghost"*/}
//                         {/*        className="h-10 rounded-lg px-5 text-slate-700 bg-slate-100"*/}
//                         {/*    >*/}
//                         {/*        Cancel*/}
//                         {/*    </Button>*/}
//                         {/*    <Button className="h-10 rounded-lg px-6 bg-blue-600 hover:bg-blue-700">*/}
//                         {/*        Continue*/}
//                         {/*    </Button>*/}
//                         {/*</div>*/}
//                     </div>
//                 </CardContent>
//             </Card>
//
//             <div className="mt-6 flex justify-end">
//                 <button
//                     onClick={onNext}
//                     className="!rounded-md bg-blue-600 px-6 py-2 text-white"
//                 >
//                     Continue
//                 </button>
//             </div>
//         </div>
//     );
// }
