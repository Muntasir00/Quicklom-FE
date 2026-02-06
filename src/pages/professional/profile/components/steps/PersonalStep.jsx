import * as React from "react";
import {Button} from "@components/ui/button";
import {Input} from "@components/ui/input";
import {Label} from "@components/ui/label";
import {Separator} from "@components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/ui/select";
import {User, IdCard, Upload} from "lucide-react";
import MultiSelect from "../MultiSelect";
import {useEffect} from "react";

function RequiredAsterisk() {
    return <span className="text-red-500">*</span>;
}

function Field({label, required, children, hint, error}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1">
                <Label className="text-[12px] font-medium text-slate-700 !mb-0">{label}</Label>
                {required ? <RequiredAsterisk/> : null}
                {hint ? <span className="ml-auto text-[11px] text-slate-500">{hint}</span> : null}
            </div>

            {children}

            {error ? <p className="text-[11px] text-red-600">{error}</p> : null}
        </div>
    );
}

// function InputWithIcon({icon: Icon, ...props}) {
//     return (
//         <div className="relative">
//             <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/>
//             <Input className="h-10 !pl-9" {...props} />
//         </div>
//     );
// }

const InputWithIcon = React.forwardRef(function InputWithIcon(
    { icon: Icon, className = "", ...props },
    ref
) {
    return (
        <div className="relative">
            <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input ref={ref} className={`h-10 !pl-9 ${className}`} {...props} />
        </div>
    );
});


/**
 * IMPORTANT:
 * - For schema fields that require FileList (id_upload), we must pass FileList not File.
 * - So UploadInline supports `returnFileList`.
 */
function UploadInline({
                          placeholder = "Upload a file",
                          buttonLabel = "Upload",
                          onPick,
                          accept,
                          returnFileList = false,
                      }) {
    const [fileName, setFileName] = React.useState("");
    const inputId = React.useMemo(() => `file-${Math.random().toString(36).slice(2)}`, []);

    return (
        <div className="relative">
            <Input className="h-10 pr-[88px]" value={fileName} placeholder={placeholder} readOnly/>
            <input
                id={inputId}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                    const files = e.target.files;
                    const f = files?.[0];
                    setFileName(f?.name ?? "");
                    onPick?.(returnFileList ? files : f ?? null);
                }}
            />
            <Button
                type="button"
                size="sm"
                variant="secondary"
                className="absolute right-2 top-1/2 h-7 -translate-y-1/2 rounded-md px-3 text-[12px]"
                onClick={() => document.getElementById(inputId)?.click()}
            >
                <Upload className="mr-1.5 h-3.5 w-3.5"/>
                {buttonLabel}
            </Button>
        </div>
    );
}

// eslint-disable-next-line react/prop-types
export default function PersonalStep({form, onNext, onCancel}) {
    const {
        register,
        setValue,
        watch,
        formState: {errors},
    } = form;

    // language options
    const languageOptions = [
        {value: "English", label: "English"},
        {value: "French", label: "French"},
        {value: "Spanish", label: "Spanish"},
        {value: "Mandarin", label: "Mandarin"},
        {value: "Arabic", label: "Arabic"},
        {value: "Hindi", label: "Hindi"},
        {value: "Bangla", label: "Bangla"},
    ];

    const languages = watch("languages") || [];

    useEffect(() => {
        console.log("AFTER RESET first_name:", form.getValues("first_name"));
    }, []);

    return (
        <div className="rounded-xl border border-slate-100 bg-white p-3 sm:p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div className="space-y-6">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="text-[13px] font-semibold text-slate-800">
                            Primary Contact Information
                        </div>
                    </div>
                </div>

                {/* Primary info grid */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                    <Field label="First Name" required error={errors.first_name?.message}>
                        <InputWithIcon
                            icon={User}
                            placeholder="First name"
                            {...register("first_name")}
                        />
                    </Field>

                    <Field label="Last Name" required error={errors.last_name?.message}>
                        <InputWithIcon
                            icon={User}
                            placeholder="Last name"
                            {...register("last_name")}
                        />
                    </Field>

                    <Field label="Email Address" required error={errors.email?.message}>
                        <InputWithIcon
                            icon={IdCard}
                            placeholder="your.email@example.com"
                            type="email"
                            {...register("email")}
                        />
                    </Field>

                    <Field label="Phone Number" required error={errors.phone_number?.message}>
                        <InputWithIcon
                            icon={IdCard}
                            placeholder="(123) 456-7890"
                            {...register("phone_number")}
                        />
                    </Field>

                    <Field label="Date of Birth" required error={errors.dob?.message}>
                        <Input className="h-10" type="date" {...register("dob")} />
                    </Field>

                    <Field
                        label="Profile Photo"
                        error={errors.profile_photo?.message}
                        hint={<div className="hidden text-[12px] text-slate-500 sm:block">
                            <span className="underline">View Current Photo</span>
                        </div>}
                    >
                        <UploadInline
                            placeholder="Upload a photo"
                            buttonLabel="Upload"
                            accept="image/*"
                            onPick={(file) => {
                                // profile_photo: z.any().optional() => File is fine
                                setValue("profile_photo", file, {shouldValidate: true});
                            }}
                        />

                    </Field>

                    <Field label="Gender" required error={errors.gender?.message}>
                        <Select
                            value={watch("gender") || ""}
                            onValueChange={(v) => setValue("gender", v, {shouldValidate: true})}
                        >
                            <SelectTrigger className="h-10 w-full">
                                <SelectValue placeholder="Select"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                                <SelectItem value="prefer_not_say">Prefer not to say</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field label="Language Spoken" required error={errors.languages?.message}>
                        <MultiSelect
                            value={languages}
                            onChange={(vals) => setValue("languages", vals, {shouldValidate: true})}
                            placeholder="Select languages"
                            options={languageOptions}
                        />
                    </Field>
                </div>

                <Separator className="my-2"/>

                <div className="space-y-1">
                    <div className="text-[13px] font-semibold text-slate-800">Address Information</div>
                </div>

                {/* Address grid */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                    <Field label="Street Address" required error={errors.address?.message}>
                        <Input className="h-10" placeholder="Street address" {...register("address")} />
                    </Field>

                    <Field label="City" required error={errors.city?.message}>
                        <Input className="h-10" placeholder="City" {...register("city")} />
                    </Field>

                    <Field label="Province" required error={errors.province?.message}>
                        <Input className="h-10" placeholder="Province" {...register("province")} />
                    </Field>

                    <Field label="Postal Code" required error={errors.postal_code?.message}>
                        <Input className="h-10" placeholder="Postal code" {...register("postal_code")} />
                    </Field>

                    <Field
                        label="ID Upload"
                        required
                        hint={<span className="underline">View/Download Current ID</span>}
                        error={errors.id_upload?.message}
                    >
                        <UploadInline
                            placeholder="Choose ID Document"
                            buttonLabel="Upload"
                            accept=".pdf,.jpg,.jpeg,.png"
                            returnFileList // ✅ IMPORTANT: schema requires FileList
                            onPick={(files) => {
                                setValue("id_upload", files, {shouldValidate: true});
                            }}
                        />
                    </Field>
                </div>

                {/* Footer buttons */}
                <div className="flex items-center justify-between gap-3 pt-5">
                    <Button
                        type="button"
                        variant="ghost"
                        className="h-10 !rounded-lg px-6 text-[#2A394B] bg-slate-100"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>

                    <Button type="button" className="h-10 !rounded-lg px-6" onClick={onNext}>
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
// import { Separator } from "@components/ui/separator";
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@components/ui/select";
// // import { Upload, User } from "lucide-react";
// import {
//     Briefcase,
//     User,
//     IdCard,
//     GraduationCap,
//     FileText,
//     ChevronDown,
//     X,
//     Search,
//     Upload,
// } from "lucide-react";
// import MultiSelect from "../MultiSelect";
//
// function RequiredStar() {
//     return <span className="text-red-500">*</span>;
// }
//
// // function Field({ label, required, hint, children }) {
// //     return (
// //         <div className="space-y-2">
// //             <div className="flex items-center gap-1">
// //                 <Label className="text-[12px] font-medium text-slate-700">{label}</Label>
// //                 {required ? <RequiredStar /> : null}
// //                 {hint ? <span className="ml-auto text-[11px] text-slate-500">{hint}</span> : null}
// //             </div>
// //             {children}
// //         </div>
// //     );
// // }
//
// function RequiredAsterisk() {
//     return <span className="text-red-500">*</span>;
// }
//
// function Field({ label, required, children, hint }) {
//     return (
//         <div className="space-y-2">
//             <div className="flex items-center gap-1">
//                 <Label className="text-[12px] font-medium text-slate-700">
//                     {label}
//                 </Label>
//                 {required ? <RequiredAsterisk /> : null}
//                 {hint ? (
//                     <span className="ml-auto text-[11px] text-slate-500">{hint}</span>
//                 ) : null}
//             </div>
//             {children}
//         </div>
//     );
// }
//
// function InputWithIcon({ icon: Icon, ...props }) {
//     return (
//         <div className="relative">
//             <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
//             <Input className="h-10 !pl-9" {...props} />
//         </div>
//     );
// }
//
// function UploadInline({ placeholder = "Upload a photo", buttonLabel = "Upload", onPick }) {
//     const [fileName, setFileName] = React.useState("");
//     const inputId = React.useMemo(() => `file-${Math.random().toString(36).slice(2)}`, []);
//
//     return (
//         <div className="relative">
//             <Input
//                 className="h-10 pr-[88px]"
//                 value={fileName}
//                 placeholder={placeholder}
//                 readOnly
//             />
//             <input
//                 id={inputId}
//                 type="file"
//                 className="hidden"
//                 onChange={(e) => {
//                     const f = e.target.files?.[0];
//                     setFileName(f?.name ?? "");
//                     onPick?.(f ?? null);
//                 }}
//             />
//             <Button
//                 type="button"
//                 size="sm"
//                 variant="secondary"
//                 className="absolute right-2 top-1/2 h-7 -translate-y-1/2 rounded-md px-3 text-[12px]"
//                 onClick={() => document.getElementById(inputId)?.click()}
//             >
//                 <Upload className="mr-1.5 h-3.5 w-3.5" />
//                 {buttonLabel}
//             </Button>
//         </div>
//     );
// }
//
// export default function PersonalStep({ onNext, onCancel }) {
//     const [languages, setLanguages] = React.useState(["en", "bn"]);
//
//     const languageOptions = [
//         { value: "en", label: "English" },
//         { value: "fr", label: "French" },
//         { value: "es", label: "Spanish" },
//         { value: "cn", label: "Mandarin" },
//         { value: "ar", label: "Arabic" },
//         { value: "hi", label: "Hindi" },
//         { value: "bn", label: "Bangla" },
//     ];
//
//     return (
//         <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
//             <div className="space-y-6">
//                 <div className="flex items-start justify-between gap-3">
//                     <div>
//                         <div className="text-[13px] font-semibold text-slate-800">
//                             Primary Contact Information
//                         </div>
//                     </div>
//                     <div className="hidden text-[12px] text-slate-500 sm:block">
//                         <span className="underline">View Current Photo</span>
//                     </div>
//                 </div>
//
//                 {/* Primary info grid */}
//                 <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
//                     <Field label="First Name" required>
//                         {/*<Input className="h-10" placeholder="Hamza El Mazouzi" />*/}
//                         <InputWithIcon icon={User} placeholder="Hamza El Mazouzi" />
//                     </Field>
//                     <Field label="Last Name" required>
//                         {/*<Input className="h-10" placeholder="Hamza El Mazouzi" />*/}
//                         <InputWithIcon icon={User} placeholder="Hamza El Mazouzi" />
//                     </Field>
//                     <Field label="Email Address" required>
//                         {/*<Input className="h-10" placeholder="hamzaelmazouzi@gmail.com" />*/}
//                         <InputWithIcon icon={IdCard} placeholder="hamzaelmazouzi@gmail.com" />
//                     </Field>
//
//                     <Field label="Phone Number" required>
//                         {/*<Input className="h-10" placeholder="(+880) 151684?864" />*/}
//                         <InputWithIcon icon={IdCard} placeholder="(+880) 151684?864" />
//                     </Field>
//                     <Field label="Date of Birth" required>
//                         {/*<Input className="h-10" placeholder="mm/dd/yyyy" />*/}
//                         <InputWithIcon icon={IdCard} placeholder="mm/dd/yyyy" />
//                     </Field>
//                     <Field label="Profile Photo" required>
//                         <UploadInline placeholder="Upload a photo" buttonLabel="Upload" />
//                     </Field>
//
//                     <Field label="Gender" required>
//                         <Select defaultValue="female">
//                             <SelectTrigger className="h-10 w-full">
//                                 <SelectValue placeholder="Select" />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 <SelectItem value="female">Female</SelectItem>
//                                 <SelectItem value="male">Male</SelectItem>
//                                 <SelectItem value="other">Other</SelectItem>
//                             </SelectContent>
//                         </Select>
//                     </Field>
//
//                     {/*<Field label="Date of Birth" required>*/}
//                     {/*    <Input className="h-10" placeholder="mm/dd/yyyy" />*/}
//                     {/*</Field>*/}
//
//                     <Field label="Language Spoken" required>
//                         <MultiSelect
//                             value={languages}
//                             onChange={setLanguages}
//                             placeholder="English, Bangla"
//                             options={languageOptions}
//                         />
//                     </Field>
//                 </div>
//
//                 <Separator className="my-2" />
//
//                 <div className="space-y-1">
//                     <div className="text-[13px] font-semibold text-slate-800">Address Information</div>
//                 </div>
//
//                 {/* Address grid */}
//                 <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
//                     <Field label="Street Address" required>
//                         <Input className="h-10" placeholder="Baker Book Parish, NB" />
//                     </Field>
//                     <Field label="City" required>
//                         <Input className="h-10" placeholder="Baker Book Parish" />
//                     </Field>
//                     <Field label="Province" required>
//                         <Input className="h-10" placeholder="Nova Scotia" />
//                     </Field>
//
//                     <Field label="Postal Code" required>
//                         <Input className="h-10" placeholder="T5C1256" />
//                     </Field>
//
//                     <Field label="ID Upload" required hint={<span className="underline">View/Download Current ID</span>}>
//                         <UploadInline placeholder="Choose ID Document" buttonLabel="Upload" />
//                     </Field>
//                 </div>
//
//                 {/* Footer buttons */}
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
