import * as React from "react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea.jsx"; // নিশ্চিত করুন এটি forwardRef ব্যবহার করে
import MultiSelect from "@pages/professional/profile/components/MultiSelect.jsx";

function RequiredStar() {
    return <span className="text-red-500">*</span>;
}

function Field({ label, required, children, error, hint }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1">
                <Label className="text-[12px] font-medium text-slate-700">{label}</Label>
                {required ? <RequiredStar /> : null}
                {hint ? <span className="ml-auto text-[11px] text-slate-500">{hint}</span> : null}
            </div>
            {children}
            {error ? <p className="text-[11px] text-red-600">{error}</p> : null}
        </div>
    );
}

export default function ContractPreferencesStep({
                                                    form,
                                                    licenseRequired = "",
                                                    onSave,
                                                    onCancel,
                                                }) {
    const {
        register,
        watch,
        setValue,
        trigger,
        formState: { errors },
    } = form;

    const contractTypes = watch("contract_type") || [];

    // normalizedLicenseRequired কে মেমোইজ করা ভালো যাতে বারবার ক্যালকুলেশন না হয়
    const normalizedLicenseRequired = React.useMemo(() =>
            String(licenseRequired ?? "").toLowerCase().trim()
        , [licenseRequired]);

    const contractOptions = React.useMemo(
        () => [
            { value: "Temporary Staffing", label: "Temporary Staffing" },
            { value: "Permanent Staffing", label: "Permanent Staffing" },
        ],
        []
    );

    // ✅ লাইসেন্স প্রয়োজন না হলে ডাটা ক্লিয়ার করার লজিক (সতর্কতার সাথে)
    React.useEffect(() => {
        if (normalizedLicenseRequired === "no") {
            // শুধুমাত্র তখনই ক্লিয়ার করবেন যখন নিশ্চিতভাবে এটি "no"
            setValue("license_number_detail", "");
            setValue("license_expiry", "");
            setValue("issuing_authority", "");
            setValue("license_document", null);
            setValue("notes", "");
            setValue("additional_info", "");
        }
    }, [normalizedLicenseRequired, setValue]);

    const handleSave = async () => {
        // validation fields list
        let fieldsToValidate = ["contract_type"];

        if (normalizedLicenseRequired === "yes") {
            fieldsToValidate = [
                ...fieldsToValidate,
                "license_number_detail",
                "license_expiry",
                "issuing_authority",
                "license_document",
                "notes",
                "additional_info",
            ];
        }

        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            onSave?.();
        }
    };

    return (
        <div className="rounded-xl border border-slate-100 bg-white p-3 sm:p-5 shadow-[0_10px_30_rgba(15,23,42,0.06)]">
            <div className="space-y-6">
                <div className="text-[13px] font-semibold text-slate-800">
                    Contract Preferences
                </div>

                <div className="grid grid-cols-1">
                    <Field label="Type of Contract Sought" required error={errors.contract_type?.message}>
                        <MultiSelect
                            value={contractTypes}
                            onChange={(vals) => setValue("contract_type", vals, { shouldValidate: true })}
                            placeholder="Select"
                            options={contractOptions}
                            maxLabelCount={0}
                        />
                    </Field>
                </div>

                <div className="pt-1">
                    <div className="text-[13px] font-semibold text-slate-800">
                        License Information
                        <span className="ml-2 text-[11px] font-normal text-slate-500">
              ({normalizedLicenseRequired || "not specified"})
            </span>
                    </div>
                </div>

                {normalizedLicenseRequired === "yes" ? (
                    <>
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                            <Field label="License Number" required error={errors.license_number_detail?.message}>
                                <Input className="h-10" placeholder="Enter license number" {...register("license_number_detail")} />
                            </Field>

                            <Field label="License Expiry Date" required error={errors.license_expiry?.message}>
                                <Input className="h-10" type="date" {...register("license_expiry")} />
                            </Field>

                            <Field label="Issuing Authority" required error={errors.issuing_authority?.message}>
                                <Input className="h-10" placeholder="e.g., College of Nurses" {...register("issuing_authority")} />
                            </Field>

                            <Field label="License Document" required error={errors.license_document?.message} hint="PDF/JPG/PNG">
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="block w-full text-sm"
                                    onChange={(e) => setValue("license_document", e.target.files, { shouldValidate: true })}
                                />
                            </Field>
                        </div>

                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            <Field label="Additional License Information" required error={errors.notes?.message}>
                                <Textarea
                                    className="h-24"
                                    placeholder="Any relevant notes..."
                                    {...register("notes")} // নিশ্চিত করুন register ঠিকমত হচ্ছে
                                />
                            </Field>

                            <Field label="Additional Info" required error={errors.additional_info?.message}>
                                <Textarea
                                    className="h-24"
                                    placeholder="Any other information..."
                                    {...register("additional_info")} // নিশ্চিত করুন register ঠিকমত হচ্ছে
                                />
                            </Field>
                        </div>
                    </>
                ) : (
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                        {normalizedLicenseRequired === "no"
                            ? "No license information is required for your selected role."
                            : "License is optional or information is loading..."}
                    </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-5">
                    <Button type="button" variant="ghost" className="!rounded-md bg-slate-100 px-6 py-2 text-slate-800" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="button" className="!rounded-md bg-blue-600 px-6 py-2 text-white" onClick={handleSave}>
                        Save Profile
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
// import MultiSelect from "@pages/professional/profile/components/MultiSelect.jsx";
// import {Textarea} from "@components/ui/textarea.jsx";
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
// export default function ContractPreferencesStep({ onSave, onCancel }) {
//     const contractOptions = React.useMemo(
//         () => [
//             { value: "temporary", label: "Temporary Staffing" },
//             { value: "permanent", label: "Permanent Staffing" },
//         ],
//         []
//     );
//
//     const [contractTypes, setContractTypes] = React.useState(["temporary", "permanent"]);
//
//     return (
//         <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
//             <div className="space-y-6">
//                 <div className="text-[13px] font-semibold text-slate-800">Contract Preferences</div>
//
//                 <div className="grid grid-cols-1">
//                     <Field label="Type of Contract Sought" required>
//                         <MultiSelect
//                             value={contractTypes}
//                             onChange={setContractTypes}
//                             placeholder="Select"
//                             options={contractOptions}
//                             maxLabelCount={0}
//                         />
//                     </Field>
//                 </div>
//
//                 <div className="pt-1">
//                     <div className="text-[13px] font-semibold text-slate-800">License Information</div>
//                 </div>
//
//                 <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
//                     <Field label="License Number" required>
//                         <Input className="h-10" placeholder="????" />
//                     </Field>
//                     <Field label="License Expired Date" required>
//                         <Input className="h-10" placeholder="01/22/2024" />
//                     </Field>
//                     <Field label="Issuing Authority" required>
//                         <Input className="h-10" placeholder="????" />
//                     </Field>
//
//                     <Field label="License Number" required>
//                         <Input className="h-10" placeholder="????" />
//                     </Field>
//                     <Field label="Date of Birth" required>
//                         <Input className="h-10" placeholder="01/22/2024" />
//                     </Field>
//                     <Field label="Issuing Authority" required>
//                         <Input className="h-10" placeholder="????" />
//                     </Field>
//                 </div>
//
//                 <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
//                     <Field label="Additional License Information">
//                         <Textarea className="h-24" placeholder="????" />
//                     </Field>
//                     <Field label="Additional Info">
//                         <Textarea className="h-24" placeholder="????" />
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
//                     <Button
//                         type="button"
//                         className="h-10 !rounded-lg px-6"
//                         onClick={onSave}
//                     >
//                         Save Profile
//                     </Button>
//                 </div>
//             </div>
//         </div>
//     );
// }
