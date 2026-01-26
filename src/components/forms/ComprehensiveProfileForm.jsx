import { API_BASE_URL } from "@config/apiConfig";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ComprehensiveProfileFormSchema } from "@schemas/user/ComprehensiveProfileFormSchema";
import { fetchGeoapifySuggestions } from "../api/geopify";

// Canadian Province mapping with full names
const PROVINCES = [
    { code: 'Alberta', name: 'Alberta' },
    { code: 'British Columbia', name: 'British Columbia' },
    { code: 'Manitoba', name: 'Manitoba' },
    { code: 'New Brunswick', name: 'New Brunswick' },
    { code: 'Newfoundland and Labrador', name: 'Newfoundland and Labrador' },
    { code: 'Nova Scotia', name: 'Nova Scotia' },
    { code: 'Ontario', name: 'Ontario' },
    { code: 'Prince Edward Island', name: 'Prince Edward Island' },
    { code: 'Quebec', name: 'Quebec' },
    { code: 'Saskatchewan', name: 'Saskatchewan' },
    { code: 'Northwest Territories', name: 'Northwest Territories' },
    { code: 'Yukon', name: 'Yukon' },
    { code: 'Nunavut', name: 'Nunavut' }
];

// Province name to code mapping for Geoapify
const PROVINCE_NAME_TO_CODE = {
    'Alberta': 'AB', 'British Columbia': 'BC', 'Manitoba': 'MB',
    'New Brunswick': 'NB', 'Newfoundland and Labrador': 'NL', 'Nova Scotia': 'NS',
    'Ontario': 'ON', 'Prince Edward Island': 'PE', 'Quebec': 'QC', 'Québec': 'QC',
    'Saskatchewan': 'SK', 'Northwest Territories': 'NT', 'Yukon': 'YT', 'Nunavut': 'NU'
};

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

const ComprehensiveProfileForm = ({ profileData, categories, handleFormSubmit }) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    // Address autocomplete states
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [manualEntry, setManualEntry] = useState(false);

    // File name states for displaying selected files
    const [profilePhotoName, setProfilePhotoName] = useState("");
    const [idUploadName, setIdUploadName] = useState("");
    const [licenseDocumentName, setLicenseDocumentName] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
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
            id_upload: null,

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
            contract_type: "",

            // Step 3: License Information
            license_required: "",
            license_number_detail: "",
            license_expiry: "",
            issuing_authority: "",
            license_document: null,
            notes: "",
            additional_info: "",
        },
    });

    const selectedCategoryId = watch("professional_category_id");
    const selectedCategory = categories.find(cat => String(cat.id) === selectedCategoryId);
    const selectedRoleIds = watch("professional_role_ids") || [];

    // Get software list based on selected category
    const availableSoftware = selectedCategory?.name
        ? SOFTWARE_BY_CATEGORY[selectedCategory.name] || []
        : [];

    // Get additional skills based on selected category
    const availableAdditionalSkills = selectedCategory?.name
        ? ADDITIONAL_SKILLS_BY_CATEGORY[selectedCategory.name] || []
        : [];

    // Calculate license requirement
    const licenseRequired = (() => {
        if (!selectedRoleIds.length || !selectedCategory) return "";
        const roleId = selectedRoleIds[0];
        const role = selectedCategory?.professional_roles?.find(r => r.id === roleId);
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
    })();

    // Track if Specialist Dentist is selected
    const isSpecialistDentist = selectedRoleIds.length > 0 && selectedCategory?.professional_roles
        ?.find(r => r.id === selectedRoleIds[0])?.name.toLowerCase() === "specialist dentist";

    useEffect(() => {
        setValue("is_specialist_dentist", isSpecialistDentist);
    }, [isSpecialistDentist, setValue]);

    // Update license_required field when it changes
    useEffect(() => {
        setValue("license_required", licenseRequired);
        if (licenseRequired?.toLowerCase() === "no") {
            setValue("license_number_detail", "");
            setValue("license_expiry", "");
            setValue("issuing_authority", "");
            setValue("license_document", null);
            setValue("notes", "");
            setValue("additional_info", "");
        }
    }, [licenseRequired, setValue]);

    const onSubmit = (data) => {
        console.log("Form submitted:", data);
        handleFormSubmit(data);
    };

    useEffect(() => {
        if (profileData) {
            reset({
                professional_category_id: profileData.professional_category_id || "",
                professional_role_ids: profileData.professional_role_ids || [],
                specialist_dentist_role: profileData.specialist_dentist_role || "",
                is_specialist_dentist: false,
                first_name: profileData.first_name || "",
                last_name: profileData.last_name || "",
                email: profileData.email || "",
                phone_number: profileData.phone_number || "",
                profile_photo: profileData.profile_photo || null,
                dob: profileData.dob || "",
                gender: profileData.gender || "",
                languages: profileData.languages || [],
                province: profileData.province || "",
                city: profileData.city || "",
                address: profileData.address || "",
                postal_code: profileData.postal_code || "",
                id_upload: profileData.id_upload || null,
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
                contract_type: profileData.contract_type || "",
                license_number_detail: profileData.license_number_detail || "",
                license_expiry: profileData.license_expiry || "",
                issuing_authority: profileData.issuing_authority || "",
                license_document: profileData.license_document || null,
                notes: profileData.notes || "",
                additional_info: profileData.additional_info || "",
            });

            if (profileData.address) {
                setSearchQuery(profileData.address);
                setManualEntry(true);
            }
        }
    }, [profileData, reset]);

    // Geoapify address autocomplete
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!searchQuery || searchQuery.length < 3 || manualEntry) {
                setSuggestions([]);
                setShowDropdown(false);
                return;
            }
            try {
                const data = await fetchGeoapifySuggestions(searchQuery);
                setSuggestions(data);
                setShowDropdown(data.length > 0);
            } catch (err) {
                console.error("Error fetching location suggestions:", err);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, manualEntry]);

    const handleSelectSuggestion = (item) => {
        const props = item.properties;
        const fullAddress = props.address_line1 || props.street || props.formatted || "";

        // Set address field
        setValue("address", fullAddress);

        // Set city
        setValue("city", props.city || "");

        // Map province - prefer full province name over code
        let provinceName = "";

        // Try to get the full province name from state or county
        if (props.state) {
            // Check if it's already a full name
            const matchingProvince = PROVINCES.find(p =>
                p.name === props.state || p.code === props.state
            );
            provinceName = matchingProvince ? matchingProvince.name : props.state;
        } else if (props.county) {
            const matchingProvince = PROVINCES.find(p =>
                p.name === props.county || p.code === props.county
            );
            provinceName = matchingProvince ? matchingProvince.name : props.county;
        } else if (props.state_code) {
            // If we only have state_code, try to find the full name
            const matchingProvince = PROVINCES.find(p =>
                p.code === props.state_code
            );
            provinceName = matchingProvince ? matchingProvince.name : props.state_code;
        }

        setValue("province", provinceName);
        setValue("postal_code", props.postcode || "");

        // Clear search bar and hide dropdown
        setSearchQuery("");
        setShowDropdown(false);
        setSuggestions([]);
    };

    const handleManualEntry = () => {
        setManualEntry(true);
        setShowDropdown(false);
        setSuggestions([]);
    };

    const handleUseAutocomplete = () => {
        setManualEntry(false);
        setShowDropdown(false);
        setSuggestions([]);
        // Keep existing address values - don't clear them
        const currentAddress = watch("address");
        if (currentAddress) {
            setSearchQuery(currentAddress);
        }
    };


    // Phone number formatter for Canadian format
    const formatPhoneNumber = (value) => {
        // Remove all non-numeric characters
        const cleaned = value.replace(/\D/g, '');

        // Format as (XXX) XXX-XXXX
        if (cleaned.length <= 3) {
            return cleaned;
        } else if (cleaned.length <= 6) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
        } else {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
        }
    };

    const handlePhoneChange = (e) => {
        const formatted = formatPhoneNumber(e.target.value);
        setValue("phone_number", formatted);
    };

    // File input handlers to update labels
    const handleProfilePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfilePhotoName(file.name);
        }
    };

    const handleIdUploadChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setIdUploadName(file.name);
        }
    };

    const handleLicenseDocumentChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setLicenseDocumentName(file.name);
        }
    };

    const getLicenseStatus = () => {
        switch (licenseRequired?.toLowerCase()) {
            case "yes":
                return { badge: "success", icon: "fa-check-circle", text: "Required", description: "A valid professional license is required for this role" };
            case "optional":
                return { badge: "warning", icon: "fa-exclamation-circle", text: "Optional", description: "License is optional but recommended for this role" };
            case "no":
                return { badge: "secondary", icon: "fa-times-circle", text: "Not Required", description: "No professional license required for this role" };
            default:
                return { badge: "info", icon: "fa-info-circle", text: "Unknown", description: "License requirement status is being determined" };
        }
    };

    const licenseStatus = getLicenseStatus();

    return (
        <form id="comprehensive-profile-form" onSubmit={handleSubmit(onSubmit)}>
            <style>{`
                /* Futuristic Multi-Select Dropdown Styling */
                .futuristic-multiselect {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: 2px solid transparent;
                    border-radius: 12px;
                    padding: 8px;
                    color: white;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                    transition: all 0.3s ease;
                }

                .futuristic-multiselect:hover {
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
                    transform: translateY(-2px);
                }

                .futuristic-multiselect:focus {
                    outline: none;
                    border-color: #fff;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.4);
                }

                .futuristic-multiselect option {
                    background: #2d3748;
                    color: white;
                    padding: 12px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    transition: background 0.2s ease;
                }

                .futuristic-multiselect option:hover {
                    background: #4a5568;
                }

                .futuristic-multiselect option:checked {
                    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
                    color: white;
                    font-weight: bold;
                }

                /* Languages multi-select variant */
                .multiselect-languages {
                    background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
                }

                /* Skills multi-select variant */
                .multiselect-skills {
                    background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
                }

                /* Software multi-select variant */
                .multiselect-software {
                    background: linear-gradient(135deg, #38b2ac 0%, #319795 100%);
                }

                /* Contract type multi-select variant */
                .multiselect-contract {
                    background: linear-gradient(135deg, #805ad5 0%, #6b46c1 100%);
                }
            `}</style>

            {/* Professional Category & Role Section */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-gradient-primary">
                    <h5 className="mb-0 text-white">
                        <i className="fas fa-user-md mr-2"></i>Professional Category & Role
                    </h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="category">
                                    <i className="fas fa-briefcase mr-2 text-primary"></i>
                                    Professional Category <span className="text-danger">*</span>
                                </label>
                                <select
                                    id="category"
                                    className={`form-control form-control-lg ${errors.professional_category_id ? 'is-invalid' : ''}`}
                                    {...register("professional_category_id")}
                                    onChange={(e) => {
                                        setValue("professional_category_id", e.target.value);
                                        setValue("professional_role_ids", []);
                                        setValue("specialist_dentist_role", "");
                                    }}
                                >
                                    <option value="">-- Select Professional Category --</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                {errors.professional_category_id && (
                                    <div className="invalid-feedback">
                                        {errors.professional_category_id.message}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-md-6">
                            {selectedCategory && (
                                <div className="form-group">
                                    <label>
                                        <i className="fas fa-user-tie mr-2 text-primary"></i>
                                        Professional Role <span className="text-danger">*</span>
                                    </label>
                                    <div className="border rounded p-3 bg-light" style={{maxHeight: "250px", overflowY: "auto"}}>
                                        {selectedCategory.professional_roles.map((role, index) => (
                                            <div className="custom-control custom-radio mb-2" key={role.id}>
                                                <input
                                                    type="radio"
                                                    className="custom-control-input"
                                                    id={`role${index}`}
                                                    name="professional_role"
                                                    checked={selectedRoleIds.includes(role.id)}
                                                    onChange={() => {
                                                        setValue("professional_role_ids", [role.id]);
                                                        setValue("specialist_dentist_role", "");
                                                    }}
                                                />
                                                <label className="custom-control-label" htmlFor={`role${index}`}>
                                                    <strong>{role.name}</strong>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.professional_role_ids && (
                                        <small className="text-danger d-block mt-1">
                                            {errors.professional_role_ids.message}
                                        </small>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Specialist Dentist Role */}
                    {selectedRoleIds.length > 0 && selectedCategory?.professional_roles
                        ?.find(r => r.id === selectedRoleIds[0])?.name.toLowerCase() === "specialist dentist" && (
                        <div className="row">
                            <div className="col-md-12">
                                <div className="alert alert-info">
                                    <i className="fas fa-tooth mr-2"></i>
                                    <strong>Specialist Dentist Selected</strong> - Please specify your specialty
                                </div>
                                <div className="form-group">
                                    <label htmlFor="specialty">
                                        <i className="fas fa-stethoscope mr-2 text-info"></i>
                                        Dental Specialty <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        id="specialty"
                                        className={`form-control ${errors.specialist_dentist_role ? 'is-invalid' : ''}`}
                                        {...register("specialist_dentist_role")}
                                    >
                                        <option value="">Select Specialty</option>
                                        <option value="orthodontist">🦷 Orthodontist</option>
                                        <option value="endodontist">🦷 Endodontist</option>
                                        <option value="periodontist">🦷 Periodontist</option>
                                        <option value="pediatric dentist">👶 Pediatric Dentist</option>
                                        <option value="prosthodontist">🦷 Prosthodontist</option>
                                        <option value="oral and maxillofacial surgeon">⚕️ Oral & Maxillofacial Surgeon</option>
                                    </select>
                                    {errors.specialist_dentist_role && (
                                        <div className="invalid-feedback">
                                            {errors.specialist_dentist_role.message}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Personal Information Section */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-gradient-info">
                    <h5 className="mb-0 text-white">
                        <i className="fas fa-user mr-2"></i>Personal Information
                    </h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="firstName">
                                    <i className="fas fa-user-circle mr-2 text-info"></i>
                                    First Name <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                                    placeholder="Enter first name"
                                    {...register("first_name")}
                                />
                                {errors.first_name && (
                                    <div className="invalid-feedback">{errors.first_name.message}</div>
                                )}
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="lastName">
                                    <i className="fas fa-user-circle mr-2 text-info"></i>
                                    Last Name <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                                    placeholder="Enter last name"
                                    {...register("last_name")}
                                />
                                {errors.last_name && (
                                    <div className="invalid-feedback">{errors.last_name.message}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="email">
                                    <i className="fas fa-envelope mr-2 text-info"></i>
                                    Email <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                    placeholder="your.email@example.com"
                                    {...register("email")}
                                />
                                {errors.email && (
                                    <div className="invalid-feedback">{errors.email.message}</div>
                                )}
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="phone">
                                    <i className="fas fa-phone mr-2 text-info"></i>
                                    Phone Number <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="phone"
                                    className={`form-control ${errors.phone_number ? 'is-invalid' : ''}`}
                                    placeholder="(123) 456-7890"
                                    {...register("phone_number")}
                                    onChange={handlePhoneChange}
                                />
                                {errors.phone_number && (
                                    <div className="invalid-feedback">{errors.phone_number.message}</div>
                                )}
                                <small className="form-text text-muted">Canadian format: (XXX) XXX-XXXX</small>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="profilePhoto">
                                    <i className="fas fa-camera mr-2 text-info"></i>
                                    Profile Photo
                                </label>
                                <div className="custom-file">
                                    <input
                                        type="file"
                                        className={`custom-file-input ${errors.profile_photo ? 'is-invalid' : ''}`}
                                        id="profilePhoto"
                                        accept="image/*"
                                        {...register("profile_photo")}
                                        onChange={(e) => {
                                            register("profile_photo").onChange(e);
                                            handleProfilePhotoChange(e);
                                        }}
                                    />
                                    <label className="custom-file-label" htmlFor="profilePhoto">
                                        {profilePhotoName || "Choose photo"}
                                    </label>
                                    {errors.profile_photo && (
                                        <div className="invalid-feedback">{errors.profile_photo.message}</div>
                                    )}
                                </div>
                                {profileData?.profile_photo && (
                                    <div className="mt-2">
                                        <a
                                            href={`${API_BASE_URL}/${profileData.profile_photo}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-outline-info"
                                        >
                                            <i className="fas fa-eye mr-2"></i>View Current Photo
                                        </a>
                                    </div>
                                )}
                                <small className="form-text text-muted">JPG, PNG (Max: 5MB)</small>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="dob">
                                    <i className="fas fa-calendar mr-2 text-info"></i>
                                    Date of Birth <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="date"
                                    className={`form-control ${errors.dob ? 'is-invalid' : ''}`}
                                    id="dob"
                                    {...register("dob")}
                                />
                                {errors.dob && (
                                    <div className="invalid-feedback">{errors.dob.message}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>
                                    <i className="fas fa-venus-mars mr-2 text-info"></i>
                                    Gender <span className="text-danger">*</span>
                                </label>
                                <div className="btn-group-toggle d-flex flex-wrap" data-toggle="buttons">
                                    <label className={`btn btn-outline-info mr-2 mb-2 ${watch("gender") === "male" ? "active" : ""}`}>
                                        <input type="radio" value="male" {...register("gender")} />
                                        <i className="fas fa-mars mr-1"></i>Male
                                    </label>
                                    <label className={`btn btn-outline-danger mr-2 mb-2 ${watch("gender") === "female" ? "active" : ""}`}>
                                        <input type="radio" value="female" {...register("gender")} />
                                        <i className="fas fa-venus mr-1"></i>Female
                                    </label>
                                    <label className={`btn btn-outline-secondary mr-2 mb-2 ${watch("gender") === "other" ? "active" : ""}`}>
                                        <input type="radio" value="other" {...register("gender")} />
                                        Other
                                    </label>
                                    <label className={`btn btn-outline-secondary mb-2 ${watch("gender") === "prefer_not_say" ? "active" : ""}`}>
                                        <input type="radio" value="prefer_not_say" {...register("gender")} />
                                        Prefer not to say
                                    </label>
                                </div>
                                {errors.gender && (
                                    <small className="text-danger d-block">{errors.gender.message}</small>
                                )}
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="languages">
                                    <i className="fas fa-language mr-2 text-info"></i>
                                    Languages Spoken <span className="text-danger">*</span>
                                </label>
                                <div className="border rounded p-3 bg-light" style={{maxHeight: "200px", overflowY: "auto"}}>
                                    <div className="custom-control custom-checkbox mb-2">
                                        <input type="checkbox" className="custom-control-input" id="lang1" value="English" {...register("languages")} />
                                        <label className="custom-control-label" htmlFor="lang1">🇬🇧 English</label>
                                    </div>
                                    <div className="custom-control custom-checkbox mb-2">
                                        <input type="checkbox" className="custom-control-input" id="lang2" value="French" {...register("languages")} />
                                        <label className="custom-control-label" htmlFor="lang2">🇫🇷 French</label>
                                    </div>
                                    <div className="custom-control custom-checkbox mb-2">
                                        <input type="checkbox" className="custom-control-input" id="lang3" value="Spanish" {...register("languages")} />
                                        <label className="custom-control-label" htmlFor="lang3">🇪🇸 Spanish</label>
                                    </div>
                                    <div className="custom-control custom-checkbox mb-2">
                                        <input type="checkbox" className="custom-control-input" id="lang4" value="Mandarin" {...register("languages")} />
                                        <label className="custom-control-label" htmlFor="lang4">🇨🇳 Mandarin</label>
                                    </div>
                                    <div className="custom-control custom-checkbox mb-2">
                                        <input type="checkbox" className="custom-control-input" id="lang5" value="Arabic" {...register("languages")} />
                                        <label className="custom-control-label" htmlFor="lang5">🇸🇦 Arabic</label>
                                    </div>
                                    <div className="custom-control custom-checkbox mb-2">
                                        <input type="checkbox" className="custom-control-input" id="lang6" value="Hindi" {...register("languages")} />
                                        <label className="custom-control-label" htmlFor="lang6">🇮🇳 Hindi</label>
                                    </div>
                                    <div className="custom-control custom-checkbox mb-2">
                                        <input type="checkbox" className="custom-control-input" id="lang7" value="Portuguese" {...register("languages")} />
                                        <label className="custom-control-label" htmlFor="lang7">🇵🇹 Portuguese</label>
                                    </div>
                                    <div className="custom-control custom-checkbox mb-2">
                                        <input type="checkbox" className="custom-control-input" id="lang8" value="Other" {...register("languages")} />
                                        <label className="custom-control-label" htmlFor="lang8">🌐 Other</label>
                                    </div>
                                </div>
                                {errors.languages && (
                                    <small className="text-danger d-block mt-1">{errors.languages.message}</small>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Address Information Section */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-gradient-success">
                    <h5 className="mb-0 text-white">
                        <i className="fas fa-map-marked-alt mr-2"></i>Address Information
                    </h5>
                </div>
                <div className="card-body">
                    {/* Mode Toggle */}
                    <div className="alert alert-light border">
                        <div className="d-flex justify-content-between align-items-center">
                            <span>
                                <i className={`fas ${manualEntry ? 'fa-edit' : 'fa-search-location'} mr-2`}></i>
                                <strong>{manualEntry ? 'Manual Entry Mode' : 'Smart Address Search'}</strong> -
                                {manualEntry ? ' Type your address directly' : ' Find your address quickly'}
                            </span>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-success"
                                onClick={manualEntry ? handleUseAutocomplete : handleManualEntry}
                            >
                                <i className={`fas ${manualEntry ? 'fa-search' : 'fa-edit'} mr-1`}></i>
                                {manualEntry ? 'Use Search' : 'Manual Entry'}
                            </button>
                        </div>
                    </div>

                    {/* Address Search (Autocomplete) */}
                    {!manualEntry && (
                        <div className="row mb-3">
                            <div className="col-md-12">
                                <div className="form-group position-relative">
                                    <label htmlFor="addressSearch">
                                        <i className="fas fa-search-location mr-2 text-success"></i>
                                        Search Address <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group input-group-lg">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text bg-success text-white">
                                                <i className="fas fa-map-marker-alt"></i>
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="addressSearch"
                                            placeholder="Start typing your address (e.g., 123 Main Street, Montreal)..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            autoComplete="off"
                                        />
                                    </div>

                                    {/* Dropdown for suggestions */}
                                    {showDropdown && suggestions.length > 0 && (
                                        <div className="list-group position-absolute w-100 shadow-lg" style={{ zIndex: 1000, maxHeight: "400px", overflowY: "auto" }}>
                                            {suggestions.map((item, index) => (
                                                <button
                                                    type="button"
                                                    key={index}
                                                    className="list-group-item list-group-item-action"
                                                    onClick={() => handleSelectSuggestion(item)}
                                                >
                                                    <div className="d-flex align-items-start">
                                                        <i className="fas fa-map-pin text-success mr-3 mt-1"></i>
                                                        <div>
                                                            <strong className="d-block">
                                                                {item.properties.name || item.properties.address_line1}
                                                            </strong>
                                                            <small className="text-muted">
                                                                {item.properties.formatted}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <small className="form-text text-muted">
                                        <i className="fas fa-lightbulb mr-1"></i>
                                        Type at least 3 characters to see suggestions
                                    </small>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Address Fields */}
                    <div className="row">
                        <div className="col-md-12">
                            <div className="form-group">
                                <label htmlFor="address">
                                    <i className="fas fa-home mr-2 text-success"></i>
                                    Street Address <span className="text-danger">*</span>
                                </label>
                                <input
                                    {...register("address")}
                                    type="text"
                                    className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                                    id="address"
                                    placeholder="123 Main Street, Apt 4B"
                                    readOnly={!manualEntry && watch("address")}
                                />
                                {errors.address && (
                                    <div className="invalid-feedback">{errors.address.message}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="city">
                                    <i className="fas fa-city mr-2 text-success"></i>
                                    City <span className="text-danger">*</span>
                                </label>
                                <input
                                    {...register("city")}
                                    type="text"
                                    className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                                    id="city"
                                    placeholder="Montreal"
                                    readOnly={!manualEntry && watch("city")}
                                />
                                {errors.city && (
                                    <div className="invalid-feedback">{errors.city.message}</div>
                                )}
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="province">
                                    <i className="fas fa-flag mr-2 text-success"></i>
                                    Province <span className="text-danger">*</span>
                                </label>
                                <select
                                    {...register("province")}
                                    className={`form-control ${errors.province ? 'is-invalid' : ''}`}
                                    id="province"
                                    disabled={!manualEntry && watch("province")}
                                >
                                    <option value="">Select Province</option>
                                    {PROVINCES.map((prov) => (
                                        <option key={prov.code} value={prov.code}>
                                            {prov.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.province && (
                                    <div className="invalid-feedback">{errors.province.message}</div>
                                )}
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="postal_code">
                                    <i className="fas fa-mail-bulk mr-2 text-success"></i>
                                    Postal Code <span className="text-danger">*</span>
                                </label>
                                <input
                                    {...register("postal_code")}
                                    type="text"
                                    className={`form-control ${errors.postal_code ? 'is-invalid' : ''}`}
                                    id="postal_code"
                                    placeholder="H1A 0A1"
                                    readOnly={!manualEntry && watch("postal_code")}
                                />
                                {errors.postal_code && (
                                    <div className="invalid-feedback">{errors.postal_code.message}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12">
                            <div className="form-group">
                                <label htmlFor="idUpload">
                                    <i className="fas fa-id-card mr-2 text-success"></i>
                                    ID Upload <span className="text-danger">*</span>
                                </label>
                                <div className="custom-file">
                                    <input
                                        type="file"
                                        className={`custom-file-input ${errors.id_upload ? 'is-invalid' : ''}`}
                                        id="idUpload"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        {...register("id_upload")}
                                        onChange={(e) => {
                                            register("id_upload").onChange(e);
                                            handleIdUploadChange(e);
                                        }}
                                    />
                                    <label className="custom-file-label" htmlFor="idUpload">
                                        {idUploadName || "Choose ID document"}
                                    </label>
                                    {errors.id_upload && (
                                        <div className="invalid-feedback">{errors.id_upload.message}</div>
                                    )}
                                </div>
                                {profileData?.id_upload && (
                                    <div className="mt-2">
                                        <a
                                            href={`${API_BASE_URL}/${profileData.id_upload}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-outline-success"
                                        >
                                            <i className="fas fa-download mr-2"></i>View/Download Current ID
                                        </a>
                                    </div>
                                )}
                                <small className="form-text text-muted">PDF, JPG, PNG (Driver's license, passport, or government ID)</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Professional Details Section */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-gradient-warning">
                    <h5 className="mb-0 text-dark">
                        <i className="fas fa-briefcase mr-2"></i>Professional Details
                    </h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="professionalStatus">
                                    <i className="fas fa-user-tie mr-2 text-warning"></i>
                                    Professional Status <span className="text-danger">*</span>
                                </label>
                                <select
                                    className={`form-control ${errors.professional_status ? 'is-invalid' : ''}`}
                                    id="professionalStatus"
                                    {...register("professional_status")}
                                >
                                    <option value="">Select Status</option>
                                    <option value="employed">💼 Employed</option>
                                    <option value="unemployed">📋 Unemployed</option>
                                    <option value="self-employed">🏢 Self-Employed</option>
                                    <option value="student">🎓 Student</option>
                                    <option value="retired">🏖️ Retired</option>
                                </select>
                                {errors.professional_status && (
                                    <div className="invalid-feedback">{errors.professional_status.message}</div>
                                )}
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="practicingSince">
                                    <i className="fas fa-calendar-check mr-2 text-warning"></i>
                                    Practicing Since <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="practicingSince"
                                    className={`form-control ${errors.practicing_since ? 'is-invalid' : ''}`}
                                    placeholder="2015"
                                    min="1950"
                                    max={new Date().getFullYear()}
                                    {...register("practicing_since")}
                                />
                                {errors.practicing_since && (
                                    <div className="invalid-feedback">{errors.practicing_since.message}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="licenseNumber">
                                    <i className="fas fa-certificate mr-2 text-warning"></i>
                                    License Number <span className="text-muted">(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    id="licenseNumber"
                                    className={`form-control ${errors.license_number ? 'is-invalid' : ''}`}
                                    placeholder="ABC12345"
                                    {...register("license_number")}
                                />
                                {errors.license_number && (
                                    <div className="invalid-feedback">{errors.license_number.message}</div>
                                )}
                                <small className="form-text text-muted">Enter if applicable</small>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="provinceReporting">
                                    <i className="fas fa-map-marked mr-2 text-warning"></i>
                                    Province for Reporting <span className="text-danger">*</span>
                                </label>
                                <select
                                    className={`form-control ${errors.province_reporting ? 'is-invalid' : ''}`}
                                    id="provinceReporting"
                                    {...register("province_reporting")}
                                >
                                    <option value="">Select Province</option>
                                    {PROVINCES.map((prov) => (
                                        <option key={prov.code} value={prov.code}>
                                            {prov.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.province_reporting && (
                                    <div className="invalid-feedback">{errors.province_reporting.message}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12">
                            <div className="form-group">
                                <label>
                                    <i className="fas fa-check-circle mr-2 text-warning"></i>
                                    Authorized to Practice? <span className="text-danger">*</span>
                                </label>
                                <div className="btn-group-toggle d-flex" data-toggle="buttons">
                                    <label className={`btn btn-outline-success flex-fill ${watch("authorized_to_practice") === "yes" ? "active" : ""}`}>
                                        <input type="radio" value="yes" {...register("authorized_to_practice")} />
                                        <i className="fas fa-check-circle mr-2"></i>Yes
                                    </label>
                                    <label className={`btn btn-outline-warning flex-fill ${watch("authorized_to_practice") === "inProgress" ? "active" : ""}`}>
                                        <input type="radio" value="inProgress" {...register("authorized_to_practice")} />
                                        <i className="fas fa-hourglass-half mr-2"></i>In Progress
                                    </label>
                                    <label className={`btn btn-outline-danger flex-fill ${watch("authorized_to_practice") === "no" ? "active" : ""}`}>
                                        <input type="radio" value="no" {...register("authorized_to_practice")} />
                                        <i className="fas fa-times-circle mr-2"></i>No
                                    </label>
                                </div>
                                {errors.authorized_to_practice && (
                                    <small className="text-danger d-block mt-2">{errors.authorized_to_practice.message}</small>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Education & Skills Section */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-gradient-secondary">
                    <h5 className="mb-0 text-white">
                        <i className="fas fa-graduation-cap mr-2"></i>Education & Skills
                    </h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="educationLevel">
                                    <i className="fas fa-book mr-2 text-secondary"></i>
                                    Education Level <span className="text-danger">*</span>
                                </label>
                                <input
                                    {...register("education_level")}
                                    type="text"
                                    className={`form-control ${errors.education_level ? 'is-invalid' : ''}`}
                                    id="educationLevel"
                                    placeholder="e.g., Bachelor's, Master's"
                                    list="educationOptions"
                                />
                                <datalist id="educationOptions">
                                    <option value="IDEC" />
                                    <option value="DEP" />
                                    <option value="Certificate" />
                                    <option value="Diploma" />
                                    <option value="Associate Degree" />
                                    <option value="Bachelor's" />
                                    <option value="Master's" />
                                    <option value="Doctorate" />
                                </datalist>
                                {errors.education_level && (
                                    <div className="invalid-feedback">{errors.education_level.message}</div>
                                )}
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="graduationYear">
                                    <i className="fas fa-calendar-alt mr-2 text-secondary"></i>
                                    Graduation Year <span className="text-danger">*</span>
                                </label>
                                <select
                                    className={`form-control ${errors.graduation_year ? 'is-invalid' : ''}`}
                                    id="graduationYear"
                                    {...register("graduation_year")}
                                >
                                    <option value="">Select Year</option>
                                    {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                {errors.graduation_year && (
                                    <div className="invalid-feedback">{errors.graduation_year.message}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12">
                            <div className="form-group">
                                <label htmlFor="educational_institution">
                                    <i className="fas fa-university mr-2 text-secondary"></i>
                                    Educational Institution <span className="text-danger">*</span>
                                </label>
                                <input
                                    {...register("educational_institution")}
                                    type="text"
                                    className={`form-control ${errors.educational_institution ? 'is-invalid' : ''}`}
                                    id="educational_institution"
                                    placeholder="e.g., Université de Montréal"
                                    list="institutionsList"
                                />
                                <datalist id="institutionsList">
                                    <option value="Université de Montréal" />
                                    <option value="McGill University" />
                                    <option value="University of Toronto" />
                                </datalist>
                                {errors.educational_institution && (
                                    <div className="invalid-feedback">{errors.educational_institution.message}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {availableSoftware.length > 0 && (
                        <div className="row">
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label htmlFor="softwareProficiency">
                                        <i className="fas fa-laptop-medical mr-2 text-secondary"></i>
                                        Software Proficiency <span className="text-danger">*</span>
                                    </label>
                                    <div className="border rounded p-3 bg-light" style={{maxHeight: "300px", overflowY: "auto"}}>
                                        <div className="row">
                                            {availableSoftware.map((software, index) => (
                                                <div className="col-md-6 col-lg-4" key={index}>
                                                    <div className="custom-control custom-checkbox mb-2">
                                                        <input
                                                            type="checkbox"
                                                            className="custom-control-input"
                                                            id={`software${index}`}
                                                            value={software}
                                                            {...register("software_proficiency")}
                                                        />
                                                        <label className="custom-control-label" htmlFor={`software${index}`}>
                                                            {software}
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {errors.software_proficiency && (
                                        <small className="text-danger d-block mt-1">{errors.software_proficiency.message}</small>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {availableAdditionalSkills.length > 0 && (
                        <div className="row">
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label htmlFor="additionalSkills">
                                        <i className="fas fa-star mr-2 text-secondary"></i>
                                        Additional Skills <span className="text-danger">*</span>
                                    </label>
                                    <div className="border rounded p-3 bg-light" style={{maxHeight: "300px", overflowY: "auto"}}>
                                        <div className="row">
                                            {availableAdditionalSkills.map((skill, index) => (
                                                <div className="col-md-6 col-lg-4" key={index}>
                                                    <div className="custom-control custom-checkbox mb-2">
                                                        <input
                                                            type="checkbox"
                                                            className="custom-control-input"
                                                            id={`skill${index}`}
                                                            value={skill}
                                                            {...register("additional_skills")}
                                                        />
                                                        <label className="custom-control-label" htmlFor={`skill${index}`}>
                                                            {skill}
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {errors.additional_skills && (
                                        <small className="text-danger d-block mt-1">{errors.additional_skills.message}</small>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Contract Preferences Section */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-gradient-dark">
                    <h5 className="mb-0 text-white">
                        <i className="fas fa-file-contract mr-2"></i>Contract Preferences
                    </h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="form-group">
                                <label htmlFor="contractType">
                                    <i className="fas fa-clipboard-list mr-2 text-dark"></i>
                                    Type of Contract Sought <span className="text-danger">*</span>
                                </label>
                                <div className="border rounded p-3 bg-light">
                                    <div className="custom-control custom-checkbox mb-2">
                                        <input type="checkbox" className="custom-control-input" id="contract1" value="Temporary Staffing" {...register("contract_type")} />
                                        <label className="custom-control-label" htmlFor="contract1">⏰ Temporary Staffing</label>
                                    </div>
                                    <div className="custom-control custom-checkbox mb-2">
                                        <input type="checkbox" className="custom-control-input" id="contract2" value="Permanent Staffing" {...register("contract_type")} />
                                        <label className="custom-control-label" htmlFor="contract2">📌 Permanent Staffing</label>
                                    </div>
                                </div>
                                {errors.contract_type && (
                                    <small className="text-danger d-block mt-1">{errors.contract_type.message}</small>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* License Information Section */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-gradient-danger">
                    <h5 className="mb-0 text-white">
                        <i className="fas fa-certificate mr-2"></i>License Information
                    </h5>
                </div>
                <div className="card-body">
                    {/* License Requirement Status */}
                    <div className="row mb-3">
                        <div className="col-md-12">
                            <div className={`alert alert-${licenseStatus.badge} d-flex align-items-center`}>
                                <i className={`fas ${licenseStatus.icon} fa-2x mr-3`}></i>
                                <div className="flex-grow-1">
                                    <h6 className="alert-heading mb-1">
                                        License Requirement: <strong>{licenseStatus.text}</strong>
                                    </h6>
                                    <p className="mb-0"><small>{licenseStatus.description}</small></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* License fields when required */}
                    {licenseRequired?.toLowerCase() === "yes" && (
                        <>
                            <div className="alert alert-info mb-4">
                                <i className="fas fa-info-circle mr-2"></i>
                                <strong>Important:</strong> All license information fields are required for this role.
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="licenseNumberDetail">
                                            <i className="fas fa-hashtag mr-2 text-danger"></i>
                                            License Number <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="licenseNumberDetail"
                                            className={`form-control ${errors.license_number_detail ? 'is-invalid' : ''}`}
                                            placeholder="Enter your license number"
                                            {...register("license_number_detail")}
                                        />
                                        {errors.license_number_detail && (
                                            <div className="invalid-feedback">{errors.license_number_detail.message}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="licenseExpiry">
                                            <i className="fas fa-calendar-times mr-2 text-danger"></i>
                                            License Expiry Date <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            id="licenseExpiry"
                                            className={`form-control ${errors.license_expiry ? 'is-invalid' : ''}`}
                                            min={new Date().toISOString().split('T')[0]}
                                            {...register("license_expiry")}
                                        />
                                        {errors.license_expiry && (
                                            <div className="invalid-feedback">{errors.license_expiry.message}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="issuingAuthority">
                                            <i className="fas fa-building mr-2 text-danger"></i>
                                            Issuing Authority <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="issuingAuthority"
                                            className={`form-control ${errors.issuing_authority ? 'is-invalid' : ''}`}
                                            placeholder="e.g., College of Nurses of Ontario"
                                            {...register("issuing_authority")}
                                        />
                                        {errors.issuing_authority && (
                                            <div className="invalid-feedback">{errors.issuing_authority.message}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="licenseDocument">
                                            <i className="fas fa-file-upload mr-2 text-danger"></i>
                                            License Document <span className="text-danger">*</span>
                                        </label>
                                        <div className="custom-file">
                                            <input
                                                type="file"
                                                id="licenseDocument"
                                                className={`custom-file-input ${errors.license_document ? 'is-invalid' : ''}`}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                {...register("license_document")}
                                                onChange={(e) => {
                                                    register("license_document").onChange(e);
                                                    handleLicenseDocumentChange(e);
                                                }}
                                            />
                                            <label className="custom-file-label" htmlFor="licenseDocument">
                                                {licenseDocumentName || "Choose license document"}
                                            </label>
                                            {errors.license_document && (
                                                <div className="invalid-feedback">{errors.license_document.message}</div>
                                            )}
                                        </div>
                                        {profileData?.license_document && (
                                            <div className="mt-2">
                                                <a
                                                    href={`${API_BASE_URL}/${profileData.license_document}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-sm btn-outline-success"
                                                >
                                                    <i className="fas fa-download mr-2"></i>View Current Document
                                                </a>
                                            </div>
                                        )}
                                        <small className="form-text text-muted">PDF, JPG, PNG (Max: 10MB)</small>
                                    </div>
                                </div>
                            </div>

                            <hr className="my-4" />

                            <h6 className="text-danger mb-3">
                                <i className="fas fa-sticky-note mr-2"></i>Additional Information
                            </h6>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="notes">
                                            <i className="fas fa-pen mr-2 text-danger"></i>
                                            Notes <span className="text-danger">*</span>
                                        </label>
                                        <textarea
                                            id="notes"
                                            className={`form-control ${errors.notes ? 'is-invalid' : ''}`}
                                            placeholder="Any relevant notes about your license..."
                                            rows="4"
                                            {...register("notes")}
                                        />
                                        {errors.notes && (
                                            <div className="invalid-feedback">{errors.notes.message}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="additionalInfo">
                                            <i className="fas fa-info mr-2 text-danger"></i>
                                            Additional Info <span className="text-danger">*</span>
                                        </label>
                                        <textarea
                                            id="additionalInfo"
                                            className={`form-control ${errors.additional_info ? 'is-invalid' : ''}`}
                                            placeholder="Any other information we should know..."
                                            rows="4"
                                            {...register("additional_info")}
                                        />
                                        {errors.additional_info && (
                                            <div className="invalid-feedback">{errors.additional_info.message}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* No License Required */}
                    {licenseRequired?.toLowerCase() === "no" && (
                        <div className="text-center py-5">
                            <i className="fas fa-check-circle text-success fa-4x mb-3"></i>
                            <h4 className="text-success">No License Required</h4>
                            <p className="text-muted mb-0">
                                Your selected role does not require professional licensing.
                            </p>
                        </div>
                    )}

                    {/* Optional License */}
                    {licenseRequired?.toLowerCase() === "optional" && (
                        <div className="alert alert-warning">
                            <i className="fas fa-info-circle mr-2"></i>
                            While a license is not mandatory for this role, providing license information may improve your opportunities.
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
};

export default ComprehensiveProfileForm;