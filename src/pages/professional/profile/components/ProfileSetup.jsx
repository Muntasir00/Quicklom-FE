import {useEffect, useMemo} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import ProfileSetupTabs from "@pages/professional/profile/components/ProfileSetupTabs.jsx";
import {ComprehensiveProfileFormSchema} from "@schemas/user/ComprehensiveProfileFormSchema.jsx";
import {Info, X} from "lucide-react"

// Software proficiency lists by category
const SOFTWARE_BY_CATEGORY = {
    "Dental Care": [
        "ABELdent", "ADSTRA MANAGEMENT", "AXXIUM X", "AXXIUM R", "AXXIUM R+", "TRACKER",
        "AD2000", "CADI OPTIMUM", "WINDENT", "DEXIS", "EXCELDENT", "X TRAC", "CONSULT PRO",
        "CURVE DMS", "DENTIMAX", "DIALOG", "DOMTRAK", "ENTERDENT", "ORYX DENTAL SOFTWARE",
        "POWER PRACTICE", "AXIUM", "DOVETAIL", "GOLD", "DENTRIX", "OMSVISION", "ORTHONOVO",
        "ENDOVISION", "DENTALVISION ENTREPRISE", "PERIOVISION", "IKLYK", "QUADRA DENTAL SOFTWARE",
        "LIVE DDM", "DENTONOVO", "MAXIMUS", "CLICK", "MAXIDENT", "PARADIGM", "MACPRACTICE DDS",
        "OPEN DENTAL SOFTWARE", "DENTALWARE", "EAGLESOFT", "CLEARDENT", "PROGIDENT", "DENTITEK",
        "SENSE", "TDO", "AUTOPIA", "PROGITEK", "AKITU ONE", "GID", "SIDEXIS", "VISION R"
    ],
    "Pharmacy": [
        "AssystRx", "Mentor", "PrioRx", "RxPro", "Ubik", "ReflexRx (XDRx)", "CGSI/Gesphar",
        "Syphac Option", "L'Ordonnance (Logipharm)", "Kroll", "Aucun", "Synmed (Dispill)",
        "Paratamax (Vial)", "Paratamax2 (Vial)", "Paratamini (Vial)", "CountAssist", "AccuCount",
        "EzCount", "Pacmed (Sachet)", "ScriptPro (Vial)", "Pharmaclik"
    ],
    "Nursing and Home Care": [
        "Meditech", "Epic", "Cerner", "OSCAR EMR", "CHRIS", "MedAccess", "PointClickCare",
        "CareLink", "Health Quest", "Accuro EMR", "PS Suite", "QHR Accuro", "Telus Health EMR",
        "Med Access", "HomeCareMD", "AlayaCare", "WellSky", "MatrixCare", "CareFor",
        "Kinnser Software", "CareVoyant"
    ],
    "General Medicine": [
        "Accuro EMR", "OSCAR EMR", "MedAccess", "PS Suite", "Telus Health EMR", "QHR Technologies",
        "Epic", "Cerner", "Meditech", "CHRIS", "Health Quest", "Med Access RTM",
        "Bell eClinicalWorks", "Clinic Aid", "Wolf EMR", "P&P Data Systems", "Nightingale",
        "ABELMed", "MOIS", "Intrahealth EMR"
    ]
};

// Additional skills by category
const ADDITIONAL_SKILLS_BY_CATEGORY = {
    "Dental Care": [
        "Dental Radiography", "Infection Control", "Patient Education", "Dental Anesthesia",
        "Chairside Assistance", "Sterilization Procedures", "Dental Materials Knowledge",
        "Orthodontic Procedures", "Endodontic Procedures", "Periodontal Procedures",
        "Prosthodontic Procedures", "Oral Surgery Assistance", "Digital Impressions",
        "CAD/CAM Technology", "Dental Laboratory Procedures", "Insurance Processing",
        "Appointment Scheduling", "Inventory Management", "HIPAA Compliance", "CPR Certified"
    ],
    "Pharmacy": [
        "Medication Dispensing", "Prescription Review", "Patient Counseling", "Immunization Administration",
        "Medication Therapy Management", "Compounding", "Inventory Management", "Drug Utilization Review",
        "Prior Authorization", "Insurance Claims Processing", "Blister Packaging", "Medication Synchronization",
        "Clinical Assessments", "Pharmacokinetics", "Drug Information", "Vaccine Storage Management",
        "Sterile Compounding", "Non-Sterile Compounding", "Automated Dispensing Systems", "CPR Certified"
    ],
    "Nursing and Home Care": [
        "Vital Signs Monitoring", "Medication Administration", "Wound Care", "IV Therapy",
        "Patient Assessment", "Care Planning", "Catheter Care", "Tracheostomy Care",
        "Ventilator Management", "Palliative Care", "Geriatric Care", "Pediatric Care",
        "Mental Health Support", "Chronic Disease Management", "Patient Education",
        "Documentation", "Infection Control", "Medical Equipment Operation", "CPR/BLS Certified",
        "ACLS Certified"
    ],
    "General Medicine": [
        "Clinical Assessment", "Diagnostic Procedures", "Treatment Planning", "Medical Documentation",
        "Patient History Taking", "Physical Examination", "Prescription Management", "Preventive Care",
        "Chronic Disease Management", "Acute Care", "Emergency Medicine", "Minor Procedures",
        "Suturing", "Interpretation of Lab Results", "Interpretation of Imaging", "Patient Counseling",
        "Health Promotion", "Vaccination Administration", "CPR/ACLS Certified", "Medical Ethics"
    ]
};

const PROVINCES = [
    {code: 'Alberta', name: 'Alberta'},
    {code: 'British Columbia', name: 'British Columbia'},
    {code: 'Manitoba', name: 'Manitoba'},
    {code: 'New Brunswick', name: 'New Brunswick'},
    {code: 'Newfoundland and Labrador', name: 'Newfoundland and Labrador'},
    {code: 'Nova Scotia', name: 'Nova Scotia'},
    {code: 'Ontario', name: 'Ontario'},
    {code: 'Prince Edward Island', name: 'Prince Edward Island'},
    {code: 'Quebec', name: 'Quebec'},
    {code: 'Saskatchewan', name: 'Saskatchewan'},
    {code: 'Northwest Territories', name: 'Northwest Territories'},
    {code: 'Yukon', name: 'Yukon'},
    {code: 'Nunavut', name: 'Nunavut'}
];

// eslint-disable-next-line react/prop-types
export default function ProfileSetup({categories, profileData, handleFormSubmit}) {
    const form = useForm({
        resolver: zodResolver(ComprehensiveProfileFormSchema),
        defaultValues: {
            // Step 1: Professional Category & Role
            professional_category_id: "",
            professional_role_ids: [],
            specialist_dentist_role: "",
            is_specialist_dentist: false,

            // Step 2: Personal Information
            first_name: "",
            last_name: "",
            email: "",
            phone_number: "",
            profile_photo: null,
            dob: "",
            gender: "",
            languages: [],
            province: "",
            city: "",
            address: "",
            postal_code: "",
            id_upload: "",

            // Step 2: Professional Information
            professional_status: "",
            authorized_to_practice: "",
            license_number: "",
            practicing_since: "",
            province_reporting: "",

            // Step 2: Education
            education_level: "",
            educational_institution: "",
            graduation_year: "",
            software_proficiency: [],
            additional_skills: [],

            // Step 2: Contract Preferences
            contract_type: [],

            // Step 3: License Information
            license_required: "",
            license_number_detail: "",
            license_expiry: "",
            issuing_authority: "",
            license_document: "",
            notes: "",
            additional_info: "",
        },
        mode: "onTouched",
    });

    const {reset, watch, setValue, handleSubmit, trigger, formState: {errors}} = form;

    // ✅ profileData load -> reset
    useEffect(() => {
        if (!profileData) return;

        reset({
            professional_category_id: profileData.professional_category_id || "",
            professional_role_ids: profileData.professional_role_ids || [],
            specialist_dentist_role: profileData.specialist_dentist_role || "",
            is_specialist_dentist: profileData.is_specialist_dentist || false,

            first_name: profileData.first_name || "",
            last_name: profileData.last_name || "",
            email: profileData.email || "",
            phone_number: profileData.phone_number || "",
            profile_photo: null, // file always null on load
            dob: profileData.dob || "",
            gender: profileData.gender || "",
            languages: profileData.languages || [],
            province: profileData.province || "",
            city: profileData.city || "",
            address: profileData.address || "",
            postal_code: profileData.postal_code || "",
            id_upload: profileData.id_upload || "",

            professional_status: profileData.professional_status || "",
            authorized_to_practice: profileData.authorized_to_practice || "",
            license_number: profileData.license_number || "",
            practicing_since: profileData.practicing_since || "",
            province_reporting: profileData.province_reporting || "",

            education_level: profileData.education_level || "",
            educational_institution: profileData.educational_institution || "",
            graduation_year: profileData.graduation_year || "",
            software_proficiency: profileData.software_proficiency || [],
            additional_skills: profileData.additional_skills || [],

            contract_type: profileData.contract_type || [], // ⚠️ array/string check নিচে


            license_required: profileData.license_required || "",
            license_number_detail: profileData.license_number_detail || "",
            license_expiry: profileData.license_expiry || "",
            issuing_authority: profileData.issuing_authority || "",
            license_document: profileData.license_document || "",
            notes: profileData.notes || "",
            additional_info: profileData.additional_info || "",
        });
    }, [profileData, reset]);


    const selectedCategoryId = watch("professional_category_id");
    const selectedRoleIds = watch("professional_role_ids") || [];

    const selectedCategory = useMemo(
        () => categories?.find(cat => String(cat.id) === String(selectedCategoryId)),
        [categories, selectedCategoryId]
    );

    // ✅ Dynamic lists
    const availableSoftware = useMemo(() => {
        return selectedCategory?.name ? (SOFTWARE_BY_CATEGORY[selectedCategory.name] || []) : [];
    }, [selectedCategory]);

    const availableAdditionalSkills = useMemo(() => {
        return selectedCategory?.name ? (ADDITIONAL_SKILLS_BY_CATEGORY[selectedCategory.name] || []) : [];
    }, [selectedCategory]);

    // ✅ licenseRequired logic (আপনার আগেরটা 그대로 এখানে রাখবেন)
    const licenseRequired = useMemo(() => {
        if (!selectedRoleIds?.length || !selectedCategory) return "";

        const roleId = selectedRoleIds[0];
        const role = selectedCategory?.professional_roles?.find(
            (r) => r.id === roleId
        );

        if (!role) return "";

        const licenseMap = {
            "Registered Nurse (RN)": "yes",
            "Licensed Practical Nurse (LPN) / Registered Practical Nurse (RPN)": "yes",
            "Nurse Practitioner (NP)": "yes",
            "Home Care Nurse": "yes",
            "Healthcare Aide / Personal Support Worker (PSW)": "no",
            "Family Physician / General Practitioner": "yes",
            "General Dentist": "yes",
            "Specialist Dentist": "yes",
            "Dental Hygienist": "yes",
            "Dental Assistant": "optional",
            "Dental Secretary": "no",
            "Pharmacy Technician (ATP) - Quebec only": "yes",
            "Pharmacist": "yes",
            "Assistant - outside Quebec Only": "no",
            "Technician - outside Quebec Only": "yes",
            "Pharmacy Clerk": "no",
        };

        return licenseMap[role.name] || "";
    }, [selectedRoleIds, selectedCategory]);

    // 1️⃣ sync license_required into RHF (REQUIRED)
    useEffect(() => {
        setValue("license_required", licenseRequired || "", {
            shouldValidate: true,
            shouldDirty: true,
        });
    }, [licenseRequired, setValue]);

// 2️⃣ clear license fields when license not required (RECOMMENDED)
    useEffect(() => {
        if (licenseRequired?.toLowerCase() === "no") {
            setValue("license_number_detail", "");
            setValue("license_expiry", "");
            setValue("issuing_authority", "");
            setValue("license_document", "");
            setValue("notes", "");
            setValue("additional_info", "");
        }
    }, [licenseRequired, setValue]);

    const onSubmit = (data) => handleFormSubmit(data);

    return (
        <div className="">
            <div className="w-full space-y-5">
                {/* Instruction Banner */}
                <div className="rounded-xl  bg-[#FFF6D2] p-2 sm:!p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3">
                            <div
                                className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full  text-[#F0A33A] text-xs font-semibold">
                                <Info/>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900 !mb-0">
                                    Profile Setup Instructions
                                </p>
                                <p className="text-xs text-slate-600 !mb-0">
                                    Complete your professional profile by filling out all
                                    sections below. Fields Marked with{" "}
                                    <span className="font-semibold text-red-600">*</span> are
                                    required.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="rounded-md p-1 text-slate-500 hover:bg-white/60 hover:text-slate-700"
                            aria-label="Close"
                        >
                            <X className="h-4 w-4"/>
                        </button>
                    </div>
                </div>

                {/* MAIN MULTI STEP FORM */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/*<ProfileSetupTabs*/}
                    {/*    form={form}*/}
                    {/*    categories={categories}*/}
                    {/*    selectedCategory={selectedCategory}*/}
                    {/*    availableSoftware={availableSoftware}*/}
                    {/*    availableAdditionalSkills={availableAdditionalSkills}*/}
                    {/*    licenseRequired={licenseRequired}*/}
                    {/*    onFinalSubmit={handleSubmit(onSubmit)}*/}
                    {/*    trigger={trigger}*/}
                    {/*    setValue={setValue}*/}
                    {/*    watch={watch}*/}
                    {/*    errors={errors}*/}
                    {/*/>*/}

                    <ProfileSetupTabs
                        form={form}
                        categories={categories}
                        selectedCategory={selectedCategory}
                        availableSoftware={availableSoftware}
                        availableAdditionalSkills={availableAdditionalSkills}
                        licenseRequired={licenseRequired}
                        onFinalSubmit={handleSubmit(onSubmit)}
                        trigger={trigger}
                        provinces={PROVINCES}
                    />

                </form>
            </div>
        </div>
    );
}


// import React from "react";
// import {
//     Building2,
//     User,
//     Briefcase,
//     GraduationCap,
//     FileText,
//     X, Info,
// } from "lucide-react";
//
// import {Card, CardContent} from "@components/ui/card.jsx";
// import {Button} from "@components/ui/button.jsx";
// import {Separator} from "@components/ui/separator.jsx";
// import {
//     Select,
//     SelectTrigger,
//     SelectValue,
//     SelectContent,
//     SelectItem,
// } from "@components/ui/select.jsx";
//
// export default function ProfileSetup() {
//     const steps = [
//         {key: "category", label: "Professional Category & Role", icon: Building2},
//         {key: "personal", label: "Personal Information", icon: User},
//         {key: "details", label: "Professional Details", icon: Briefcase},
//         {key: "edu", label: "Education & Skills", icon: GraduationCap},
//         {key: "contract", label: "Contract Preferences", icon: FileText},
//     ];
//
//     const activeKey = "category";
//
//     return (
//         <div className="min-h-screen w-full bg-white">
//             <div className="mx-auto w-full max-w-7xl px-0 space-y-5">
//                 {/* Top banner */}
//                 <div className="rounded-xl  bg-[#FFF6D2] p-4">
//                     <div className="flex items-start justify-between gap-3">
//                         <div className="flex gap-3">
//                             <div
//                                 className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full  text-[#F0A33A] text-xs font-semibold">
//                                 <Info/>
//                             </div>
//                             <div>
//                                 <p className="text-sm font-semibold text-slate-900 !mb-0">
//                                     Profile Setup Instructions
//                                 </p>
//                                 <p className="text-xs text-slate-600 !mb-0">
//                                     Complete your professional profile by filling out all
//                                     sections below. Fields Marked with{" "}
//                                     <span className="font-semibold text-red-600">*</span> are
//                                     required.
//                                 </p>
//                             </div>
//                         </div>
//
//                         <button
//                             type="button"
//                             className="rounded-md p-1 text-slate-500 hover:bg-white/60 hover:text-slate-700"
//                             aria-label="Close"
//                         >
//                             <X className="h-4 w-4"/>
//                         </button>
//                     </div>
//                 </div>
//
//                 <Card className="!border-none shadow-none">
//                     <CardContent className="p-0">
//                         {/* Step navigation */}
//                         <div className="pt-4 md:pt-5">
//                             <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
//                                 {steps.map((s) => {
//                                     const Icon = s.icon;
//                                     const isActive = s.key === activeKey;
//
//                                     return (
//                                         <button
//                                             key={s.key}
//                                             type="button"
//                                             className={[
//                                                 "group relative flex items-center gap-2 rounded-md px-1 py-1 text-sm",
//                                                 isActive
//                                                     ? "text-blue-600"
//                                                     : "text-slate-500 hover:text-slate-700",
//                                             ].join(" ")}
//                                         >
//                                             <Icon
//                                                 className={[
//                                                     "h-4 w-4",
//                                                     isActive
//                                                         ? "text-blue-600"
//                                                         : "text-slate-400 group-hover:text-slate-500",
//                                                 ].join(" ")}
//                                             />
//                                             <span className="whitespace-nowrap">{s.label}</span>
//
//                                             {/* underline (active) */}
//                                             {isActive && (
//                                                 <span
//                                                     className="absolute -bottom-2 left-0 h-[2px] w-full rounded bg-blue-600"/>
//                                             )}
//                                         </button>
//                                     );
//                                 })}
//                             </div>
//
//                             <Separator className="mt-4"/>
//                         </div>
//
//                         <Card className="py-0 mt-3 border-[#F3F4F6] rounded-xl">
//                             <CardContent className="p-0">
//                                 {/* Form area */}
//                                 <div className="px-4 py-6 md:px-6 md:py-8">
//                                     <h3 className="text-sm font-semibold text-slate-900">
//                                         Professional Category &amp; Role
//                                     </h3>
//
//                                     <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
//                                         {/* Professional Category */}
//                                         <div className="space-y-2">
//                                             <label className="text-xs font-medium text-slate-700">
//                                                 Professional Category{" "}
//                                                 <span className="text-red-600">*</span>
//                                             </label>
//                                             <Select defaultValue="agency-01">
//                                                 <SelectTrigger
//                                                     className="h-11 rounded-lg border-slate-200 bg-white w-full">
//                                                     <SelectValue placeholder="Select category"/>
//                                                 </SelectTrigger>
//                                                 <SelectContent>
//                                                     <SelectItem value="agency-01"><Building2/> agency 01</SelectItem>
//                                                     <SelectItem value="agency-02"><Building2/> agency 02</SelectItem>
//                                                     <SelectItem value="agency-03"><Building2/> agency 03</SelectItem>
//                                                 </SelectContent>
//                                             </Select>
//                                         </div>
//
//                                         {/* Professional Role */}
//                                         <div className="space-y-2">
//                                             <label className="text-xs font-medium text-slate-700">
//                                                 Professional Role <span className="text-red-600">*</span>
//                                             </label>
//                                             <Select defaultValue="general-dentist">
//                                                 <SelectTrigger
//                                                     className="h-11 rounded-lg border-slate-200 bg-white w-full">
//                                                     <SelectValue placeholder="Select role"/>
//                                                 </SelectTrigger>
//                                                 <SelectContent>
//                                                     <SelectItem value="general-dentist">
//                                                         General Dentist
//                                                     </SelectItem>
//                                                     <SelectItem value="specialist-dentist">
//                                                         Specialist Dentist
//                                                     </SelectItem>
//                                                 </SelectContent>
//                                             </Select>
//                                         </div>
//                                     </div>
//
//                                     {/* Specialist Dentist Selected */}
//                                     <div className="mt-6">
//                                         <p className="text-xs font-semibold text-blue-700">
//                                             Specialist Dentist Selected
//                                         </p>
//
//                                         <div className="mt-3 space-y-2">
//                                             <label className="text-xs font-medium text-slate-700">
//                                                 Dental Specialty <span className="text-red-600">*</span>
//                                             </label>
//                                             <Select defaultValue="endodontics">
//                                                 <SelectTrigger
//                                                     className="h-11 rounded-lg border-slate-200 bg-white w-full">
//                                                     <SelectValue placeholder="Select specialty"/>
//                                                 </SelectTrigger>
//                                                 <SelectContent>
//                                                     <SelectItem
//                                                         value="endodontics"><Building2/> Endodontics</SelectItem>
//                                                     <SelectItem
//                                                         value="orthodontics"><Building2/> Orthodontics</SelectItem>
//                                                     <SelectItem
//                                                         value="periodontics"><Building2/> Periodontics</SelectItem>
//                                                     <SelectItem value="prosthodontics">
//                                                         Prosthodontics
//                                                     </SelectItem>
//                                                 </SelectContent>
//                                             </Select>
//                                         </div>
//                                     </div>
//
//                                     {/* Footer buttons */}
//                                     <div
//                                         className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-start">
//                                         <Button
//                                             variant="ghost"
//                                             className="h-10 rounded-lg px-5 text-[#2A394B] bg-slate-100"
//                                         >
//                                             Cancel
//                                         </Button>
//                                         <Button className="h-10 rounded-lg px-6 bg-blue-600 hover:bg-blue-700">
//                                             Continue
//                                         </Button>
//                                     </div>
//                                 </div>
//                             </CardContent>
//                         </Card>
//
//                     </CardContent>
//                 </Card>
//             </div>
//         </div>
//     );
// }
