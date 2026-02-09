// Edit.jsx
import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";

import {
    getInstituteCategoryService,
    getInstituteSpecialityService,
} from "../../../services/institute/InstituteSpecialityService";
import {
    updateInstituteProfileService,
    editInstituteProfileService,
} from "../../../services/institute/ProfileService";

import { SessionUtil, SESSION_KEYS } from "@utils/SessionUtils";
import InstituteProfile from "@pages/institute/profile/components/InstituteProfile.jsx";

const Edit = () => {
    const menu = "Profile";
    const { id } = useParams();

    const [categories, setCategories] = useState([]);
    const [specialties, setSpecialties] = useState([]);

    // FULL API RESPONSE (as you pasted)
    const [profileResponse, setProfileResponse] = useState(null);

    // this is EXACT object: response.data.data
    const [profileData, setProfileData] = useState({});

    const [categoryName, setCategoryName] = useState("Recruitment Agency");

    // GLOBAL EDIT MODE (ONLY header toggles)
    const [isEditMode, setIsEditMode] = useState(false);

    // pending files: { proof_of_business_registration: File, ... }
    const [pendingFiles, setPendingFiles] = useState({});

    const initializeStateHelper = useCallback(async () => {
        try {
            const categoriesData = await getInstituteCategoryService();
            const specialtiesData = await getInstituteSpecialityService();

            setCategories(categoriesData ?? []);
            setSpecialties(specialtiesData ?? []);

            // Your existing service originally accepts setters:
            // editInstituteProfileService(setProfile, setMainFormData, setSelectedCategory, setUserCategory)
            //
            // We will pass setProfileResponse as first setter.
            // If your service MUST receive 4 args, we pass no-op setters for others.
            await editInstituteProfileService(
                (res) => {
                    // res should be the full response you pasted
                    setProfileResponse(res);
                    console.log(res)
                    setProfileData(res || null);
                    setCategoryName(res?.category?.name || "Recruitment Agency");
                },
                () => {}, // setMainFormData (unused in new approach)
                () => {}, // setSelectedCategory (unused)
                () => {}  // setUserCategory (unused)
            );
        } catch (error) {
            console.error("Error occured: ", error);
        }
    }, []);

    useEffect(() => {
        document.title = `${menu} | Quicklocum`;
        initializeStateHelper();
    }, []);

    const handleSelectFile = (fieldKey, file) => {
        setPendingFiles((prev) => ({ ...prev, [fieldKey]: file }));
    };

    const handleGlobalSave = async (values) => {
        try {
            // Convert numeric fields back to strings (API response uses strings)
            const payload = {
                ...values,
                years_of_experience: String(values.years_of_experience ?? ""),
                number_of_recruiters: String(values.number_of_recruiters ?? ""),
            };

            // Build FormData (multipart)
            const formData = new FormData();

            // Attach files if any selected
            Object.entries(pendingFiles).forEach(([key, file]) => {
                if (file) {
                    // backend expects file under same key name
                    formData.append(key, file);
                    // optional: set payload field null/empty so backend uses uploaded file
                    payload[key] = null;
                }
            });

            formData.append("data", JSON.stringify(payload));

            // Debug
            // eslint-disable-next-line no-console
            console.log("SAVE payload:", payload);

            const response = await updateInstituteProfileService(id, formData);
            if (!response) return;

            Swal.fire({
                icon: "success",
                title: "Success!",
                text: "Profile updated successfully",
                showConfirmButton: false,
                timer: 2000,
            });

            // update session category
            SessionUtil.set(
                SESSION_KEYS.INSTITUTE_CATEGORY_ID,
                Number(payload.institute_category_id)
            );
            SessionUtil.set(
                SESSION_KEYS.INSTITUTE_CATEGORY_NAME,
                categoryName || "Recruitment Agency"
            );

            setPendingFiles({});
            setIsEditMode(false);
            await initializeStateHelper();
        } catch (error) {
            console.error("Error occured: ", error);
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: "Failed to update profile",
            });
        }
    };

    const handleGlobalCancel = () => {
        Swal.fire({
            title: "Cancel Editing?",
            text: "Any unsaved changes will be lost!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#1f63ff",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, cancel editing",
            cancelButtonText: "Continue editing",
        }).then(async (result) => {
            if (result.isConfirmed) {
                setPendingFiles({});
                setIsEditMode(false);
                await initializeStateHelper();
            }
        });
    };

    return (
        <div>
            <InstituteProfile
                initialData={profileData}
                categoryName={categoryName}
                isEditing={isEditMode}
                onEdit={() => setIsEditMode(true)}
                onSave={handleGlobalSave}
                onCancel={handleGlobalCancel}
                onSelectFile={handleSelectFile}
            />
        </div>
    );
};

export default Edit;




// import React, { useState, useEffect, useCallback } from "react";
// import Swal from "sweetalert2";
// import { useNavigate, useParams } from "react-router-dom";
//
// import {
//     getInstituteCategoryService,
//     getInstituteSpecialityService,
// } from "../../../services/institute/InstituteSpecialityService";
// import {
//     updateInstituteProfileService,
//     editInstituteProfileService,
// } from "../../../services/institute/ProfileService";
//
// import { SessionUtil, SESSION_KEYS } from "@utils/SessionUtils";
//
// // NEW UI PAGE
// import InstituteProfile from "@pages/institute/profile/components/InstituteProfile.jsx";
//
// // ---------- helpers ----------
// const safeArr = (v) => (Array.isArray(v) ? v : v ? [v] : []);
//
// const mapProfileToFormDefaults = (profile, mainFormData, categories, specialties) => {
//     const cat = categories.find((c) => c.id === Number(mainFormData?.institute_category_id));
//     const categoryName = cat?.name || "Recruitment Agency";
//
//     const specialtiesCovered = safeArr(profile?.specialties_covered);
//
//     // NOTE: এখানে backend keys আপনার project অনুযায়ী adjust লাগতে পারে।
//     return {
//         categoryDetails: {
//             category: categoryName,
//             verified: Boolean(profile?.is_verified ?? true),
//
//             agencyName: profile?.agency_name ?? profile?.name ?? "",
//             business_number: profile?.business_number ?? "",
//             headOfficeAddress: profile?.head_office_address ?? "",
//
//             city: profile?.city ?? "",
//             province: profile?.province ?? "",
//             postalCode: profile?.postal_code ?? "",
//
//             phoneNumber: profile?.phone ?? profile?.phone_number ?? "",
//             email: profile?.email_address ?? "",
//             website: profile?.website ?? "https://www.example.com",
//         },
//
//         contactInfo: {
//             fullName: profile?.primary_contact_name ?? profile?.primary_contact_full_name ?? "",
//             position: profile?.primary_contact_position ?? profile?.primary_contact_position ?? "",
//             email: profile?.primary_contact_email ?? profile?.primary_contact_email ?? "",
//             phoneNumber: profile?.primary_contact_phone ?? profile?.primary_contact_phone ?? "",
//         },
//
//         serviceDetails: {
//             specialties: specialtiesCovered,
//             regions: safeArr(profile?.regions_served ?? profile?.regions_served ?? []),
//             contractTypes: safeArr(profile?.types_of_contracts_managed ?? profile?.types_of_contracts_managed ?? []),
//
//             yearsExperience: Number(profile?.years_of_experience ?? 0),
//             numberOfRecruiters: Number(profile?.number_of_recruiters ?? 0),
//             licensingAccreditation: String(profile?.licensing_accreditation ?? ""),
//             recruitmentProcessDescription: profile?.recruitment_process_description ?? "",
//         },
//
//         billingInfo: {
//             billingMethod: profile?.billing_method ?? "Commission on Success",
//             otherBillingMethods: profile?.other_billing_method ?? "",
//         },
//
//         requiredDocuments: {
//             documents: safeArr(profile?.documents ?? []).map((d, idx) => ({
//                 id: String(d?.id ?? `doc-${idx + 1}`),
//                 name: d?.name ?? "Sample Document 01",
//                 sizeMb: Number(d?.size_mb ?? 12),
//             })),
//         },
//     };
// };
//
// const mapFormValuesToPayload = (values, mainFormData, specialties) => {
//     const specIds = safeArr(values?.serviceDetails?.specialties)
//         .map((name) => specialties.find((s) => s.name === name)?.id)
//         .filter(Boolean);
//
//     // NOTE: backend keys adjust লাগতে পারে।
//     return {
//         ...mainFormData,
//         institute_specialty_ids: specIds,
//
//         agency_name: values.categoryDetails.agencyName,
//         business_number: values.categoryDetails.business_number,
//         head_office_address: values.categoryDetails.headOfficeAddress,
//         city: values.categoryDetails.city,
//         province: values.categoryDetails.province,
//         postal_code: values.categoryDetails.postalCode,
//         phone: values.categoryDetails.phoneNumber,
//         email: values.categoryDetails.email,
//         website: values.categoryDetails.website,
//
//         primary_contact_name: values.contactInfo.fullName,
//         primary_contact_position: values.contactInfo.position,
//         primary_contact_email: values.contactInfo.email,
//         primary_contact_phone: values.contactInfo.phoneNumber,
//
//         regions_served: values.serviceDetails.regions,
//         contract_types: values.serviceDetails.contractTypes,
//         years_experience: values.serviceDetails.yearsExperience,
//         number_of_recruiters: values.serviceDetails.numberOfRecruiters,
//         licensing_accreditation: values.serviceDetails.licensingAccreditation,
//         recruitment_process_description: values.serviceDetails.recruitmentProcessDescription,
//
//         billing_method: values.billingInfo.billingMethod,
//         other_billing_methods: values.billingInfo.otherBillingMethods,
//     };
// };
//
// const Edit = () => {
//     const menu = "Profile";
//     const { id } = useParams();
//     const navigate = useNavigate();
//
//     const [categories, setCategories] = useState([]);
//     const [specialties, setSpecialties] = useState([]);
//     const [selectedCategory, setSelectedCategory] = useState({});
//     const [profile, setProfile] = useState({});
//     const [userCategory, setUserCategory] = useState("");
//
//     const [isEditMode, setIsEditMode] = useState(false);
//
//     const [mainFormData, setMainFormData] = useState({
//         institute_category_id: "",
//         institute_specialty_ids: [],
//     });
//
//     // master UI default values (RHF will reset on this)
//     const [formDefaults, setFormDefaults] = useState({
//         categoryDetails: {
//             category: "Recruitment Agency",
//             verified: true,
//             agencyName: "",
//             business_number: "",
//             headOfficeAddress: "",
//             city: "",
//             province: "",
//             postalCode: "",
//             phoneNumber: "",
//             email: "",
//             website: "https://www.example.com",
//         },
//         contactInfo: {
//             fullName: "",
//             position: "",
//             email: "",
//             phoneNumber: "",
//         },
//         serviceDetails: {
//             specialties: [],
//             regions: [],
//             contractTypes: [],
//             yearsExperience: 0,
//             numberOfRecruiters: 0,
//             licensingAccreditation: "",
//             recruitmentProcessDescription: "",
//         },
//         billingInfo: {
//             billingMethod: "",
//             otherBillingMethods: "",
//         },
//         requiredDocuments: {
//             documents: [],
//         },
//     });
//
//     const initializeStateHelper = useCallback(async () => {
//         try {
//             const categoriesData = await getInstituteCategoryService();
//             const specialtiesData = await getInstituteSpecialityService();
//
//             setCategories(categoriesData ?? []);
//             setSpecialties(specialtiesData ?? []);
//
//             await editInstituteProfileService(
//                 setProfile,
//                 setMainFormData,
//                 setSelectedCategory,
//                 setUserCategory
//             );
//         } catch (error) {
//             console.error("Error occured: ", error);
//         }
//     }, []);
//
//     // build RHF defaults when data ready
//     useEffect(() => {
//         if (!categories.length || !specialties.length) return;
//         const defaults = mapProfileToFormDefaults(profile, mainFormData, categories, specialties);
//         setFormDefaults(defaults);
//     }, [profile, mainFormData, categories, specialties]);
//
//     // page init
//     useEffect(() => {
//         document.title = `${menu} | Quicklocum`;
//         initializeStateHelper();
//     }, []);
//
//     // Save handler (called from InstituteProfilePage)
//     const handleGlobalSave = async (values) => {
//         try {
//             console.log("ALL FORM VALUES:", values);
//
//             const payload = mapFormValuesToPayload(values, mainFormData, specialties);
//
//             const formData = new FormData();
//             formData.append("data", JSON.stringify(payload));
//
//             const response = await updateInstituteProfileService(id, formData);
//             if (!response) return;
//
//             Swal.fire({
//                 icon: "success",
//                 title: "Success!",
//                 text: "Profile updated successfully",
//                 showConfirmButton: false,
//                 timer: 2000,
//             });
//
//             const category = categories.find((row) => row.id === Number(mainFormData.institute_category_id));
//             const categoryName = category ? category?.name : null;
//             SessionUtil.set(SESSION_KEYS.INSTITUTE_CATEGORY_ID, Number(mainFormData.institute_category_id));
//             SessionUtil.set(SESSION_KEYS.INSTITUTE_CATEGORY_NAME, categoryName);
//
//             setIsEditMode(false);
//             await initializeStateHelper();
//         } catch (error) {
//             console.error("Error occured: ", error);
//             Swal.fire({
//                 icon: "error",
//                 title: "Error!",
//                 text: "Failed to update profile",
//             });
//         }
//     };
//
//     // Cancel handler with confirm
//     const handleGlobalCancel = () => {
//         Swal.fire({
//             title: "Cancel Editing?",
//             text: "Any unsaved changes will be lost!",
//             icon: "warning",
//             showCancelButton: true,
//             confirmButtonColor: "#1f63ff",
//             cancelButtonColor: "#6c757d",
//             confirmButtonText: "Yes, cancel editing",
//             cancelButtonText: "Continue editing",
//         }).then((result) => {
//             if (result.isConfirmed) {
//                 setIsEditMode(false);
//                 initializeStateHelper();
//             }
//         });
//     };
//
//     return (
//         <div className="">
//             <InstituteProfile
//                 initialValues={formDefaults}
//                 isEditing={isEditMode}
//                 onEdit={() => setIsEditMode(true)}
//                 onSave={handleGlobalSave}
//                 onCancel={handleGlobalCancel}
//             />
//         </div>
//     );
// };
//
// export default Edit;
