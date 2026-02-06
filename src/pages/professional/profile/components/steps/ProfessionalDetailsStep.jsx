import * as React from "react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/ui/select";

function RequiredStar() {
    return <span className="text-red-500">*</span>;
}

function Field({ label, required, children, error }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1">
                <Label className="text-[12px] font-medium text-slate-700">{label}</Label>
                {required ? <RequiredStar /> : null}
            </div>
            {children}
            {error ? <p className="text-[11px] text-red-600">{error}</p> : null}
        </div>
    );
}

// eslint-disable-next-line react/prop-types
export default function ProfessionalDetailsStep({
                                                    form,
                                                    provinces = [],
                                                    onNext,
                                                    onCancel,
                                                }) {
    const {
        register,
        setValue,
        watch,
        trigger,
        formState: { errors },
    } = form;

    const professionalStatus = watch("professional_status") || "";
    const provinceReporting = watch("province_reporting") || "";
    const authorizedToPractice = watch("authorized_to_practice") || "";

    const handleContinue = async () => {
        // ✅ only validate this step fields
        const ok = await trigger([
            "professional_status",
            "practicing_since",
            "province_reporting",
            "authorized_to_practice",
            "license_number",
        ]);
        if (!ok) return;
        onNext?.();
    };

    return (
        <div className="rounded-xl border border-slate-100 bg-white p-3 sm:p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div className="space-y-6">
                <div className="text-[13px] font-semibold text-slate-800">
                    Professional Status
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                    <Field
                        label="Professional Status"
                        required
                        error={errors.professional_status?.message}
                    >
                        <Select
                            value={professionalStatus}
                            onValueChange={(v) =>
                                setValue("professional_status", v, { shouldValidate: true })
                            }
                        >
                            <SelectTrigger className="h-10 w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="employed">Employed</SelectItem>
                                <SelectItem value="unemployed">Unemployed</SelectItem>
                                <SelectItem value="self-employed">Self-Employed</SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="retired">Retired</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field
                        label="Practicing Since"
                        required
                        error={errors.practicing_since?.message}
                    >
                        <Input
                            className="h-10"
                            placeholder="2022"
                            type="number"
                            min="1950"
                            max={new Date().getFullYear()}
                            {...register("practicing_since")}
                        />
                    </Field>

                    <Field
                        label="License Number (Optional)"
                        error={errors.license_number?.message}
                    >
                        <Input
                            className="h-10"
                            placeholder="1025834"
                            {...register("license_number")}
                        />
                    </Field>

                    <Field
                        label="Province for Reporting"
                        required
                        error={errors.province_reporting?.message}
                    >
                        <Select
                            // value={provinceReporting}
                            // onValueChange={(v) =>
                            //     setValue("province_reporting", v, { shouldValidate: true })
                            // }
                            value={String(watch("province_reporting") ?? "")}
                            onValueChange={(v) => setValue("province_reporting", v, { shouldValidate: true })}
                        >
                            <SelectTrigger className="h-10 w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                {provinces?.length ? (
                                    provinces.map((p) => (
                                        <SelectItem
                                            key={p.code ?? p.value ?? p.name}
                                            value={String(p.code ?? p.value ?? p.name)}
                                        >
                                            {p.name ?? p.label ?? p.code}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <>
                                        {/* fallback */}
                                        <SelectItem value="Alberta">Alberta</SelectItem>
                                        <SelectItem value="Ontario">Ontario</SelectItem>
                                        <SelectItem value="Quebec">Quebec</SelectItem>
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field
                        label="Authorized to Practice?"
                        required
                        error={errors.authorized_to_practice?.message}
                    >
                        <Select
                            value={authorizedToPractice}
                            onValueChange={(v) =>
                                setValue("authorized_to_practice", v, { shouldValidate: true })
                            }
                        >
                            <SelectTrigger className="h-10 w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="inProgress">In Progress</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                </div>

                <div className="flex items-center justify-between gap-3 pt-5">
                    <Button
                        type="button"
                        variant="ghost"
                        className="h-10 !rounded-lg bg-slate-100 px-6 text-[#2A394B]"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="button"
                        className="h-10 !rounded-lg px-6"
                        onClick={handleContinue}
                    >
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    );
}


// import * as React from "react";
// import { Button } from "@components/ui/button";
// import { Input } from "@components/ui/input";
// import { Label } from "@components/ui/label";
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@components/ui/select";
//
// function RequiredStar() {
//     return <span className="text-red-500">*</span>;
// }
//
// function Field({ label, required, children }) {
//     return (
//         <div className="space-y-2">
//             <div className="flex items-center gap-1">
//                 <Label className="text-[12px] font-medium text-slate-700">{label}</Label>
//                 {required ? <RequiredStar /> : null}
//             </div>
//             {children}
//         </div>
//     );
// }
//
// export default function ProfessionalDetailsStep({ onNext, onCancel }) {
//     return (
//         <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
//             <div className="space-y-6">
//                 <div className="text-[13px] font-semibold text-slate-800">Professional Status</div>
//
//                 <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
//                     <Field label="Professional Status" required>
//                         <Select defaultValue="employed">
//                             <SelectTrigger className="h-10 w-full">
//                                 <SelectValue placeholder="Select" />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 <SelectItem value="employed">Employed</SelectItem>
//                                 <SelectItem value="self">Self-employed</SelectItem>
//                                 <SelectItem value="student">Student</SelectItem>
//                             </SelectContent>
//                         </Select>
//                     </Field>
//
//                     <Field label="Practicing Since" required>
//                         <Input className="h-10" placeholder="2022" />
//                     </Field>
//
//                     <Field label="License Number (Optional)">
//                         <Input className="h-10" placeholder="1025834" />
//                     </Field>
//
//                     <Field label="Province for Reporting" required>
//                         <Select defaultValue="alberta">
//                             <SelectTrigger className="h-10 w-full">
//                                 <SelectValue placeholder="Select" />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 <SelectItem value="alberta">Alberta</SelectItem>
//                                 <SelectItem value="ontario">Ontario</SelectItem>
//                                 <SelectItem value="quebec">Quebec</SelectItem>
//                             </SelectContent>
//                         </Select>
//                     </Field>
//
//                     <Field label="Authorized to Practice?" required>
//                         <Select defaultValue="yes">
//                             <SelectTrigger className="h-10 w-full">
//                                 <SelectValue placeholder="Select" />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 <SelectItem value="yes">Yes</SelectItem>
//                                 <SelectItem value="no">No</SelectItem>
//                             </SelectContent>
//                         </Select>
//                     </Field>
//                 </div>
//
//                 <div className="flex items-center justify-between gap-3 pt-5">
//                     <Button
//                         type="button"
//                         variant="ghost"
//                         className="h-10 !rounded-lg px-6 text-[#2A394B] bg-slate-100"
//                         onClick={onCancel}
//                     >
//                         Cancel
//                     </Button>
//                     <Button type="button" className="h-10 !rounded-lg px-6" onClick={onNext}>
//                         Continue
//                     </Button>
//                 </div>
//             </div>
//         </div>
//     );
// }
