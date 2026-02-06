import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@components/ui/tabs";
import { Briefcase, User, IdCard, GraduationCap, FileText } from "lucide-react";

import RoleStep from "./steps/RoleStep";
import PersonalStep from "./steps/PersonalStep";
import ProfessionalDetailsStep from "./steps/ProfessionalDetailsStep.jsx";
import EducationSkillsStep from "./steps/EducationSkillsStep";
import ContractPreferencesStep from "./steps/ContractPreferencesStep";

// eslint-disable-next-line react/prop-types
export default function ProfileSetupTabs({
                                             form,
                                             categories,
                                             selectedCategory,
                                             availableSoftware,
                                             availableAdditionalSkills,
                                             licenseRequired,
                                             trigger,
                                             onFinalSubmit,
                                             provinces,
                                         }) {
    const [tab, setTab] = useState("role");

    // ✅ step-wise validation fields
    const stepFields = {
        role: ["professional_category_id", "professional_role_ids", "specialist_dentist_role"],
        personal: [
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "dob",
            "gender",
            "languages",
            "address",
            "city",
            "province",
            "postal_code",
            "id_upload",
        ],
        details: ["professional_status", "authorized_to_practice", "practicing_since", "province_reporting"],
        education: [
            "education_level",
            "graduation_year",
            "educational_institution",
            "software_proficiency",
            "additional_skills",
        ],
        contract: ["contract_type"], // final submit will validate all anyway
    };

    const next = async () => {
        const ok = await trigger(stepFields[tab] || []);
        if (!ok) return;

        const i = ["role", "personal", "details", "education", "contract"].indexOf(tab);
        if (i < 4) setTab(["role", "personal", "details", "education", "contract"][i + 1]);
    };

    return (
        <Tabs value={tab} onValueChange={setTab}>
            {/* Header Tabs */}
            <TabsList className="mb-6 flex h-auto w-full justify-start gap-5 md:gap-7 rounded-none bg-transparent p-0 overflow-x-auto overflow-y-hidden border-b border-slate-100 flex-nowrap scrollbar-hide">
                {[
                    { key: "role", label: "Role", fullLabel: "Professional Category & Role", icon: Briefcase },
                    { key: "personal", label: "Personal", fullLabel: "Personal Information", icon: User },
                    { key: "details", label: "Details", fullLabel: "Professional Details", icon: IdCard },
                    { key: "education", label: "Education", fullLabel: "Education & Skills", icon: GraduationCap },
                    { key: "contract", label: "Contract", fullLabel: "Contract Preferences", icon: FileText },
                ].map((s) => {
                    const Icon = s.icon;
                    const active = tab === s.key;

                    return (
                        <TabsTrigger
                            key={s.key}
                            value={s.key}
                            className="relative h-12 flex-shrink-0 rounded-none bg-transparent px-1 md:px-0 text-[13px] font-medium text-slate-600 shadow-none data-[state=active]:text-blue-600 whitespace-nowrap"
                        >
                    <span className="flex items-center gap-2">
                        <Icon className={"h-4 w-4 " + (active ? "text-blue-600" : "text-slate-700")} />
                        {/* মোবাইলে ছোট লেবেল এবং বড় স্ক্রিনে বড় লেবেল দেখাতে পারেন */}
                        <span className="hidden md:inline-block">{s.fullLabel}</span>
                        <span className="md:hidden">{s.label}</span>
                    </span>

                            {active && (
                                <span className="absolute bottom-0 left-0 h-[2px] w-full bg-blue-600" />
                            )}
                        </TabsTrigger>
                    );
                })}
            </TabsList>
            {/*<TabsList className="mb-6 flex h-auto w-full justify-start gap-4 md:gap-7 rounded-none bg-transparent p-0 overflow-x-auto overflow-y-hidden border-b border-slate-200 scrollbar-hide flex-nowrap shrink-0">*/}
            {/*    {[*/}
            {/*        { key: "role", label: "Professional Category & Role", icon: Briefcase },*/}
            {/*        { key: "personal", label: "Personal Information", icon: User },*/}
            {/*        { key: "details", label: "Professional Details", icon: IdCard },*/}
            {/*        { key: "education", label: "Education & Skills", icon: GraduationCap },*/}
            {/*        { key: "contract", label: "Contract Preferences", icon: FileText },*/}
            {/*    ].map((s) => {*/}
            {/*        const Icon = s.icon;*/}
            {/*        const active = tab === s.key;*/}

            {/*        return (*/}
            {/*            <TabsTrigger*/}
            {/*                key={s.key}*/}
            {/*                value={s.key}*/}
            {/*                className="relative h-12 rounded-none bg-transparent px-0 text-[13px] font-medium text-slate-600 shadow-none data-[state=active]:text-blue-600"*/}
            {/*            >*/}
            {/*  <span className="flex items-center gap-2">*/}
            {/*    <Icon className={"h-4 w-4 " + (active ? "text-blue-600" : "text-slate-700")} />*/}
            {/*      {s.label}*/}
            {/*  </span>*/}

            {/*                /!* underline *!/*/}
            {/*                <span*/}
            {/*                    className={*/}
            {/*                        "absolute bottom-0 left-0 h-[2px] w-full " +*/}
            {/*                        (active ? "bg-blue-600" : "bg-transparent")*/}
            {/*                    }*/}
            {/*                />*/}
            {/*            </TabsTrigger>*/}
            {/*        );*/}
            {/*    })}*/}
            {/*</TabsList>*/}

            <TabsContent value="role" className="m-0">
                <RoleStep
                    form={form}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onNext={next}
                    onCancel={() => {}}
                />
            </TabsContent>

            <TabsContent value="personal" className="m-0">
                <PersonalStep
                    form={form}
                    onNext={next}
                    onCancel={() => setTab("role")}
                />
            </TabsContent>

            <TabsContent value="details" className="m-0">
                <ProfessionalDetailsStep
                    form={form}
                    provinces={provinces}
                    onNext={next}
                    onCancel={() => setTab("personal")}
                />
            </TabsContent>

            <TabsContent value="education" className="m-0">
                <EducationSkillsStep
                    form={form}
                    availableSoftware={availableSoftware}
                    availableAdditionalSkills={availableAdditionalSkills}
                    onNext={next}
                    onCancel={() => setTab("details")}
                />
            </TabsContent>

            <TabsContent value="contract" className="m-0">
                <ContractPreferencesStep
                    form={form}
                    licenseRequired={licenseRequired}
                    onSave={onFinalSubmit} // ✅ parent handleSubmit(onSubmit)
                    onCancel={() => setTab("education")}
                />
            </TabsContent>
        </Tabs>
    );
}
