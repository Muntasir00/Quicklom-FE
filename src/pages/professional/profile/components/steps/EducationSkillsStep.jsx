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
import MultiSelect from "@pages/professional/profile/components/MultiSelect.jsx";

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
export default function EducationSkillsStep({
                                                form,
                                                availableSoftware = [],
                                                availableAdditionalSkills = [],
                                                onNext,
                                                onCancel,
                                            }) {
    const {
        register,
        watch,
        setValue,
        trigger,
        formState: { errors },
    } = form;

    // ✅ controlled values (never undefined)
    const educationLevel = String(watch("education_level") ?? "");
    const software = watch("software_proficiency") || [];
    const skills = watch("additional_skills") || [];

    // ✅ transform to MultiSelect options
    const softwareOptions = React.useMemo(
        () => (availableSoftware || []).map((s) => ({ value: s, label: s })),
        [availableSoftware]
    );

    const skillOptions = React.useMemo(
        () => (availableAdditionalSkills || []).map((s) => ({ value: s, label: s })),
        [availableAdditionalSkills]
    );

    const handleContinue = async () => {
        const ok = await trigger([
            "education_level",
            "graduation_year",
            "educational_institution",
            "software_proficiency",
            "additional_skills",
        ]);
        if (!ok) return;
        onNext?.();
    };

    return (
        <div className="rounded-xl border border-slate-100 bg-white p-3 sm:p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div className="space-y-6">
                <div className="text-[13px] font-semibold text-slate-800">
                    Complete your professional Profile
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                    {/* Education Level */}
                    <Field
                        label="Education Level"
                        required
                        error={errors.education_level?.message}
                    >
                        <Select
                            value={educationLevel}
                            onValueChange={(v) =>
                                setValue("education_level", v, { shouldValidate: true })
                            }
                        >
                            <SelectTrigger className="h-10 w-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                {/* আপনি চাইলে এগুলো customize করবেন */}
                                <SelectItem value="IDEC">IDEC</SelectItem>
                                <SelectItem value="DEP">DEP</SelectItem>
                                <SelectItem value="Certificate">Certificate</SelectItem>
                                <SelectItem value="Diploma">Diploma</SelectItem>
                                <SelectItem value="Associate Degree">Associate Degree</SelectItem>
                                <SelectItem value="Bachelor's">Bachelor's</SelectItem>
                                <SelectItem value="Master's">Master's</SelectItem>
                                <SelectItem value="Doctorate">Doctorate</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>

                    {/* Graduation Year */}
                    <Field
                        label="Graduation Year"
                        required
                        error={errors.graduation_year?.message}
                    >
                        <Input
                            className="h-10"
                            placeholder="2022"
                            {...register("graduation_year")}
                        />
                    </Field>

                    {/* Educational Institution */}
                    <Field
                        label="Educational Institution"
                        required
                        error={errors.educational_institution?.message}
                    >
                        {/* schema এ এটা string, তাই Input সবচেয়ে safe */}
                        <Input
                            className="h-10"
                            placeholder="e.g., McGill University"
                            {...register("educational_institution")}
                        />
                    </Field>

                    {/* Software Proficiency */}
                    <Field
                        label="Software Proficiency"
                        required
                        error={errors.software_proficiency?.message}
                    >
                        <MultiSelect
                            value={software}
                            onChange={(vals) =>
                                setValue("software_proficiency", vals, { shouldValidate: true })
                            }
                            placeholder="Select software"
                            options={softwareOptions}
                        />
                    </Field>

                    {/* Additional Skills */}
                    <Field
                        label="Additional Skills"
                        required
                        error={errors.additional_skills?.message}
                    >
                        <MultiSelect
                            value={skills}
                            onChange={(vals) =>
                                setValue("additional_skills", vals, { shouldValidate: true })
                            }
                            placeholder="Select skills"
                            options={skillOptions}
                        />
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
