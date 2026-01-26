// PrivateClinicsAndPracticesForm.jsx
import { API_BASE_URL } from "@config/apiConfig";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { privateClinicsFormSchema } from "../../../../schemas/user/PrivateClinicsFormSchema";
import { getInsuranceCompaniesService } from "../../../../services/institute/InsuranceCompanyService";
import { fetchGeoapifySuggestions } from "../../../../components/api/geopify";

const PrivateClinicsAndPracticesForm = ({
    profile,
    userCategory,
    handleFormSubmit,
    selectedSpecialties
}) => {
    const formId = "Private Clinics and Practices";
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    const [insuranceCompanies, setInsuranceCompanies] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [useManualAddress, setUseManualAddress] = useState(false);
    const [addressFieldsStatus, setAddressFieldsStatus] = useState({
        city: false,
        province: false,
        postal_code: false
    });

    const [fileNames, setFileNames] = useState({
        proof_of_license_or_registration: "",
        proof_of_liability_insurance: "",
        signed_nda: ""
    });

    const dentalSoftwareOptions = [
        "ABELdent", "ADSTR A MANAGEMENT", "AXXIUM X", "AXXIUM R", "AXXIUM R+", "TRACKER",
        "AD2000", "CADI OPTIMUM", "WINDENT", "DEXIS", "EXCELDENT", "X TRAC", "CONSULT PRO",
        "CURVE DMS", "DENTIMAX", "DIALOG", "DOMTRAK", "ENTERDENT", "ORYX DENTAL SOFTWARE",
        "POWER PRACTICE", "AXIUM", "DOVETAIL", "GOLD", "DENTRIX", "OMSVISION", "ORTHONOVO",
        "ENDOVISION", "DENTALVISION ENTREPRISE", "PERIOVISION", "IKLYK", "QUADRA DENTAL SOFTWARE",
        "LIVE DDM", "DENTONOVO", "MAXIMUS", "CLICK", "MAXIDENT", "PARADIGM", "MACPRACTICE DDS",
        "OPEN DENTAL SOFTWARE", "DENTALWARE", "EAGLESOFT", "CLEARDENT", "PROGIDENT", "DENTITEK",
        "SENSE", "TDO", "AUTOPIA", "PROGITEK", "AKITU ONE", "GID", "SIDEXIS", "VISION R"
    ];

    const regionsOptions = [
        { value: "Alberta", label: "Alberta" },
        { value: "British Columbia", label: "British Columbia" },
        { value: "Manitoba", label: "Manitoba" },
        { value: "New Brunswick", label: "New Brunswick" },
        { value: "Newfoundland and Labrador", label: "Newfoundland and Labrador" },
        { value: "Nova Scotia", label: "Nova Scotia" },
        { value: "Ontario", label: "Ontario" },
        { value: "Prince Edward Island", label: "Prince Edward Island" },
        { value: "Quebec", label: "Quebec" },
        { value: "Saskatchewan", label: "Saskatchewan" }
    ];

    const contractTypesOptions = [
        { value: "Permanent Staffing", label: "Permanent Staffing", icon: "fa-user-check" },
        { value: "Temporary Staffing", label: "Temporary Staffing", icon: "fa-clock" }
    ];

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(privateClinicsFormSchema),
        defaultValues: {
            medical_specialties_covered: [],
            name_of_facility: "",
            business_number: "",
            full_address: "",
            city: "",
            postal_code: "",
            province: "",
            phone_number: "",
            website: "",
            primary_contact_full_name: "",
            primary_contact_position: "",
            work_email: "",
            direct_phone: "",
            other_specialties: "",
            proof_of_license_or_registration: null,
            proof_of_liability_insurance: null,
            signed_nda: null,
            type_of_contracts_you_will_publish: [],
            enrolled_in_public_healthcare_system: "",
            billing_number: "",
            general_practitioners_number: "",
            nurses_number: "",
            other_professionals_number: "",
            specialists_number: "",
            software: [],
        },
    });

    const fullAddress = watch("full_address", "");
    const province = watch("province");
    const enrolledInPublicHealthcare = watch("enrolled_in_public_healthcare_system");
    const selectedContractTypes = watch("type_of_contracts_you_will_publish", []);
    const selectedSoftware = watch("software", []);

    const selectedCompany = insuranceCompanies?.find(
        (item) => province && item?.province_territory?.toLowerCase() === province?.toLowerCase()
    );

    const formatPhoneNumber = (value) => {
        const phone = value.replace(/\D/g, '');
        if (phone.length <= 3) return phone;
        if (phone.length <= 6) return `(${phone.slice(0, 3)}) ${phone.slice(3)}`;
        return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
    };

    const handlePhoneChange = (e, fieldName) => {
        const formatted = formatPhoneNumber(e.target.value);
        setValue(fieldName, formatted);
    };

    const handleFileChange = (e, fieldName) => {
        const file = e.target.files[0];
        if (file) {
            setFileNames(prev => ({
                ...prev,
                [fieldName]: file.name
            }));
        }
    };

    const getFileDisplayName = (fieldName) => {
        if (fileNames[fieldName]) {
            return fileNames[fieldName];
        }

        if (profile && profile[fieldName]) {
            const filePath = profile[fieldName];
            const extractedFileName = filePath.split('/').pop();
            return extractedFileName;
        }

        return "Choose file";
    };

    const handleCheckboxChange = (fieldName, value) => {
        const currentValues = watch(fieldName) || [];
        let updatedValues;

        if (currentValues.includes(value)) {
            updatedValues = currentValues.filter(item => item !== value);
        } else {
            updatedValues = [...currentValues, value];
        }

        setValue(fieldName, updatedValues, { shouldValidate: true });
    };

    const handleAddressChange = async (value) => {
        setValue("full_address", value);
        if (!useManualAddress && value.length > 2) {
            try {
                const results = await fetchGeoapifySuggestions(value);
                setSuggestions(results);
                setShowSuggestions(true);
            } catch (error) {
                console.error("Address search error:", error);
            }
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        const city = suggestion.properties.city || "";
        const province = suggestion.properties.state || "";
        const postalCode = suggestion.properties.postcode || "";

        setValue("full_address", suggestion.properties.formatted, { shouldValidate: true });
        setValue("city", city, { shouldValidate: true });
        setValue("province", province, { shouldValidate: true });
        setValue("postal_code", postalCode, { shouldValidate: true });

        setAddressFieldsStatus({
            city: !city,
            province: !province,
            postal_code: !postalCode
        });

        setSuggestions([]);
        setShowSuggestions(false);
    };

    const toggleManualAddress = () => {
        const newManualState = !useManualAddress;
        setUseManualAddress(newManualState);
        setSuggestions([]);
        setShowSuggestions(false);

        if (newManualState) {
            setAddressFieldsStatus({
                city: true,
                province: true,
                postal_code: true
            });
        } else {
            setAddressFieldsStatus({
                city: false,
                province: false,
                postal_code: false
            });
        }
    };

    const hasSpeciality = (arr, value) => {
        try {
            if (!arr || !Array.isArray(arr) || arr.length === 0) return false;
            if (!value) return false;

            return arr.some(item => {
                if (!item) return false;
                return item.toLowerCase() === value.toLowerCase();
            });
        } catch (error) {
            return false;
        }
    };

    const hasDentalSpecialty = () => {
        return (selectedSpecialties || []).some(specialty =>
            specialty.toLowerCase() === "dental care"
        );
    };

    const onSubmit = async (data) => {
        const dataFiles = ["proof_of_license_or_registration", "proof_of_liability_insurance", "signed_nda"];
        await handleFormSubmit(data, dataFiles);
    };

    const initializeStateHelper = async () => {
        try {
            const insuranceCompaniesData = await getInsuranceCompaniesService();
            setInsuranceCompanies(insuranceCompaniesData);
        } catch (error) {
            console.log("Error occurred", error);
        }
    };

    useEffect(() => {
        initializeStateHelper();
    }, []);

    useEffect(() => {
        try {
            if (selectedSpecialties && Array.isArray(selectedSpecialties) && selectedSpecialties.length > 0) {
                setValue("medical_specialties_covered", selectedSpecialties ?? []);
            }
        } catch (error) {
            console.log("Error occurred", error);
        }
    }, [selectedSpecialties, setValue]);

    useEffect(() => {
        if (profile && userCategory === formId) {
            reset({
                medical_specialties_covered: profile.medical_specialties_covered || [],
                name_of_facility: profile.name_of_facility || "",
                business_number: profile.business_number || "",
                full_address: profile.full_address || "",
                city: profile.city || "",
                postal_code: profile.postal_code || "",
                province: profile.province || "",
                phone_number: profile.phone_number || "",
                website: profile.website || "",
                primary_contact_full_name: profile.primary_contact_full_name || "",
                primary_contact_position: profile.primary_contact_position || "",
                work_email: profile.work_email || "",
                direct_phone: profile.direct_phone || "",
                other_specialties: profile.other_specialties || "",
                proof_of_license_or_registration: profile.proof_of_license_or_registration || null,
                proof_of_liability_insurance: profile.proof_of_liability_insurance || null,
                signed_nda: profile.signed_nda || null,
                type_of_contracts_you_will_publish: profile.type_of_contracts_you_will_publish || [],
                enrolled_in_public_healthcare_system: profile.enrolled_in_public_healthcare_system || "",
                billing_number: profile.billing_number || "",
                general_practitioners_number: profile.general_practitioners_number || "",
                nurses_number: profile.nurses_number || "",
                other_professionals_number: profile.other_professionals_number || "",
                specialists_number: profile.specialists_number || "",
                software: profile.software || [],
            });

            setUseManualAddress(false);

            if (profile.full_address) {
                setAddressFieldsStatus({
                    city: !profile.city,
                    province: !profile.province,
                    postal_code: !profile.postal_code
                });
            }

            setFileNames({
                proof_of_license_or_registration: "",
                proof_of_liability_insurance: "",
                signed_nda: ""
            });
        }
    }, [profile, userCategory, reset]);

    return (
        <form id="private-clinics-and-practices-form" onSubmit={handleSubmit(onSubmit)} className="healthcare-form">
            {/* Facility Information Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon primary">
                        <i className="fas fa-hospital"></i>
                    </div>
                    <div className="section-title-wrapper">
                        <h3 className="section-title">Facility Information</h3>
                        <p className="section-description">Basic details about your clinic or practice</p>
                    </div>
                </div>

                <div className="form-content">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                Name of Facility <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-building"></i>
                                </div>
                                <input
                                    type="text"
                                    className={`form-input ${errors.name_of_facility ? 'is-invalid' : ''}`}
                                    placeholder="Enter facility name"
                                    {...register("name_of_facility")}
                                />
                            </div>
                            {errors.name_of_facility && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.name_of_facility.message}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Business Number <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-id-card"></i>
                                </div>
                                <input
                                    type="text"
                                    className={`form-input ${errors.business_number ? 'is-invalid' : ''}`}
                                    placeholder="NEQ or BN"
                                    {...register("business_number")}
                                />
                            </div>
                            {errors.business_number && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.business_number.message}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <div className="label-row">
                            <label className="form-label">
                                Full Address <span className="required">*</span>
                            </label>
                            <button
                                type="button"
                                className="toggle-btn"
                                onClick={toggleManualAddress}
                            >
                                <i className={`fas fa-${useManualAddress ? 'search' : 'keyboard'}`}></i>
                                {useManualAddress ? 'Use Address Search' : 'Enter Manually'}
                            </button>
                        </div>
                        <div className="input-wrapper position-relative">
                            <div className="input-icon">
                                <i className="fas fa-map-marker-alt"></i>
                            </div>
                            {!useManualAddress ? (
                                <input
                                    type="text"
                                    className={`form-input ${errors.full_address ? 'is-invalid' : ''}`}
                                    placeholder="Start typing address..."
                                    value={fullAddress}
                                    onChange={(e) => handleAddressChange(e.target.value)}
                                    autoComplete="off"
                                />
                            ) : (
                                <input
                                    type="text"
                                    className={`form-input ${errors.full_address ? 'is-invalid' : ''}`}
                                    placeholder="Enter complete address manually"
                                    {...register("full_address")}
                                />
                            )}
                            {showSuggestions && suggestions.length > 0 && (
                                <ul className="suggestions-list">
                                    {suggestions.map((suggestion, index) => (
                                        <li
                                            key={index}
                                            className="suggestion-item"
                                            onClick={() => handleSuggestionClick(suggestion)}
                                        >
                                            <i className="fas fa-map-pin"></i>
                                            {suggestion.properties.formatted}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        {errors.full_address && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-circle"></i>
                                {errors.full_address.message}
                            </div>
                        )}
                    </div>

                    <div className="form-row three-col">
                        <div className="form-group">
                            <label className="form-label">
                                City <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                className={`form-input ${errors.city ? 'is-invalid' : ''}`}
                                placeholder="Enter city"
                                {...register("city")}
                                disabled={!useManualAddress && !addressFieldsStatus.city}
                            />
                            {errors.city && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.city.message}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Province <span className="required">*</span>
                            </label>
                            <div className="select-wrapper">
                                <select
                                    className={`form-select ${errors.province ? 'is-invalid' : ''}`}
                                    {...register("province")}
                                    disabled={!useManualAddress && !addressFieldsStatus.province}
                                >
                                    <option value="">Select Province</option>
                                    {regionsOptions.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                <div className="select-icon">
                                    <i className="fas fa-chevron-down"></i>
                                </div>
                            </div>
                            {errors.province && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.province.message}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Postal Code <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                className={`form-input ${errors.postal_code ? 'is-invalid' : ''}`}
                                placeholder="A1A 1A1"
                                {...register("postal_code")}
                                disabled={!useManualAddress && !addressFieldsStatus.postal_code}
                            />
                            {errors.postal_code && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.postal_code.message}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                Phone Number <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-phone"></i>
                                </div>
                                <input
                                    type="text"
                                    className={`form-input ${errors.phone_number ? 'is-invalid' : ''}`}
                                    placeholder="(123) 456-7890"
                                    value={watch("phone_number") || ""}
                                    onChange={(e) => handlePhoneChange(e, "phone_number")}
                                    maxLength="14"
                                />
                            </div>
                            {errors.phone_number && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.phone_number.message}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Website</label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-globe"></i>
                                </div>
                                <input
                                    type="url"
                                    className={`form-input ${errors.website ? 'is-invalid' : ''}`}
                                    placeholder="https://www.example.com"
                                    {...register("website")}
                                />
                            </div>
                            {errors.website && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.website.message}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Primary Contact Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon success">
                        <i className="fas fa-user-tie"></i>
                    </div>
                    <div className="section-title-wrapper">
                        <h3 className="section-title">Primary Contact Information</h3>
                        <p className="section-description">Contact details for the main point of contact</p>
                    </div>
                </div>

                <div className="form-content">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                Full Name <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-user"></i>
                                </div>
                                <input
                                    type="text"
                                    className={`form-input ${errors.primary_contact_full_name ? 'is-invalid' : ''}`}
                                    placeholder="Enter full name"
                                    {...register("primary_contact_full_name")}
                                />
                            </div>
                            {errors.primary_contact_full_name && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.primary_contact_full_name.message}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Position <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-briefcase"></i>
                                </div>
                                <input
                                    type="text"
                                    className={`form-input ${errors.primary_contact_position ? 'is-invalid' : ''}`}
                                    placeholder="Enter position"
                                    {...register("primary_contact_position")}
                                />
                            </div>
                            {errors.primary_contact_position && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.primary_contact_position.message}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                Work Email <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-envelope"></i>
                                </div>
                                <input
                                    type="email"
                                    className={`form-input ${errors.work_email ? 'is-invalid' : ''}`}
                                    placeholder="Enter work email"
                                    {...register("work_email")}
                                />
                            </div>
                            {errors.work_email && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.work_email.message}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Direct Phone <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-phone"></i>
                                </div>
                                <input
                                    type="text"
                                    className={`form-input ${errors.direct_phone ? 'is-invalid' : ''}`}
                                    placeholder="(123) 456-7890"
                                    value={watch("direct_phone") || ""}
                                    onChange={(e) => handlePhoneChange(e, "direct_phone")}
                                    maxLength="14"
                                />
                            </div>
                            {errors.direct_phone && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.direct_phone.message}
                                </div>
                            )}
                        </div>
                    </div>

                    {selectedSpecialties && selectedSpecialties.length > 0 && (
                        <div className="form-group full-width">
                            <label className="form-label">Other Specialties (if selected)</label>
                            <textarea
                                className={`form-textarea ${errors.other_specialties ? 'is-invalid' : ''}`}
                                rows="3"
                                placeholder="Describe other specialties..."
                                {...register("other_specialties")}
                            ></textarea>
                            {errors.other_specialties && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.other_specialties.message}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Dental Software Section (Conditional) */}
            {hasDentalSpecialty() && (
                <div className="form-section">
                    <div className="section-header">
                        <div className="section-icon secondary">
                            <i className="fas fa-tooth"></i>
                        </div>
                        <div className="section-title-wrapper">
                            <h3 className="section-title">Dental Software</h3>
                            <p className="section-description">Software used for dental care management</p>
                        </div>
                    </div>

                    <div className="form-content">
                        <div className="form-group full-width">
                            <label className="form-label">Software Used</label>
                            <div className="checkbox-grid compact scrollable">
                                {dentalSoftwareOptions.map((software, index) => (
                                    <div
                                        key={index}
                                        className={`checkbox-card compact ${selectedSoftware.includes(software) ? 'selected' : ''}`}
                                        onClick={() => handleCheckboxChange("software", software)}
                                    >
                                        <div className="checkbox-indicator small">
                                            {selectedSoftware.includes(software) && <i className="fas fa-check"></i>}
                                        </div>
                                        <span className="checkbox-label">{software}</span>
                                    </div>
                                ))}
                            </div>
                            {errors.software && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.software.message}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Contract Information Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon info">
                        <i className="fas fa-file-contract"></i>
                    </div>
                    <div className="section-title-wrapper">
                        <h3 className="section-title">Contract Information</h3>
                        <p className="section-description">Types of contracts you will publish</p>
                    </div>
                </div>

                <div className="form-content">
                    <div className="form-group full-width">
                        <label className="form-label">
                            Types of Contracts You Will Publish <span className="required">*</span>
                        </label>
                        <div className="checkbox-grid">
                            {contractTypesOptions.map((option, index) => (
                                <div
                                    key={index}
                                    className={`checkbox-card ${selectedContractTypes.includes(option.value) ? 'selected' : ''}`}
                                    onClick={() => handleCheckboxChange("type_of_contracts_you_will_publish", option.value)}
                                >
                                    <div className="checkbox-indicator">
                                        {selectedContractTypes.includes(option.value) && <i className="fas fa-check"></i>}
                                    </div>
                                    <div className="checkbox-icon">
                                        <i className={`fas ${option.icon}`}></i>
                                    </div>
                                    <span className="checkbox-label">{option.label}</span>
                                </div>
                            ))}
                        </div>
                        {errors.type_of_contracts_you_will_publish && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-circle"></i>
                                {errors.type_of_contracts_you_will_publish.message}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Staff Information Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon warning">
                        <i className="fas fa-users"></i>
                    </div>
                    <div className="section-title-wrapper">
                        <h3 className="section-title">Staff Information</h3>
                        <p className="section-description">Current staffing details at your facility</p>
                    </div>
                </div>

                <div className="form-content">
                    {hasSpeciality(selectedSpecialties, "General Medicine") && (
                        <div className="form-group full-width">
                            <label className="form-label">General Practitioners - Number</label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-user-md"></i>
                                </div>
                                <input
                                    type="text"
                                    className={`form-input ${errors.general_practitioners_number ? 'is-invalid' : ''}`}
                                    placeholder="Enter number"
                                    {...register("general_practitioners_number")}
                                />
                            </div>
                            {errors.general_practitioners_number && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.general_practitioners_number.message}
                                </div>
                            )}
                        </div>
                    )}

                    {hasSpeciality(selectedSpecialties, "Nursing and Home Care") && (
                        <div className="form-group full-width">
                            <label className="form-label">Nurses - Number</label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-user-nurse"></i>
                                </div>
                                <input
                                    type="text"
                                    className={`form-input ${errors.nurses_number ? 'is-invalid' : ''}`}
                                    placeholder="Enter number"
                                    {...register("nurses_number")}
                                />
                            </div>
                            {errors.nurses_number && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.nurses_number.message}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Specialists - Number</label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-user-md"></i>
                                </div>
                                <input
                                    type="text"
                                    className={`form-input ${errors.specialists_number ? 'is-invalid' : ''}`}
                                    placeholder="Enter number"
                                    {...register("specialists_number")}
                                />
                            </div>
                            {errors.specialists_number && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.specialists_number.message}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Other Professionals - Number</label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-users"></i>
                                </div>
                                <input
                                    type="text"
                                    className={`form-input ${errors.other_professionals_number ? 'is-invalid' : ''}`}
                                    placeholder="Enter number"
                                    {...register("other_professionals_number")}
                                />
                            </div>
                            {errors.other_professionals_number && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.other_professionals_number.message}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Healthcare System Information Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon danger">
                        <i className="fas fa-heartbeat"></i>
                    </div>
                    <div className="section-title-wrapper">
                        <h3 className="section-title">Healthcare System Information</h3>
                        <p className="section-description">Public healthcare enrollment and billing details</p>
                    </div>
                </div>

                <div className="form-content">
                    <div className="form-row three-col">
                        <div className="form-group">
                            <label className="form-label">
                                Enrolled in Public Healthcare System <span className="required">*</span>
                            </label>
                            <div className="select-wrapper">
                                <select
                                    className={`form-select ${errors.enrolled_in_public_healthcare_system ? 'is-invalid' : ''}`}
                                    {...register("enrolled_in_public_healthcare_system")}
                                    disabled={!province}
                                >
                                    <option value="">Select Option</option>
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>
                                <div className="select-icon">
                                    <i className="fas fa-chevron-down"></i>
                                </div>
                            </div>
                            {errors.enrolled_in_public_healthcare_system && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.enrolled_in_public_healthcare_system.message}
                                </div>
                            )}
                        </div>

                        {province && enrolledInPublicHealthcare === "yes" && insuranceCompanies && insuranceCompanies.length > 0 && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Insurance Company Name</label>
                                    <input
                                        readOnly
                                        type="text"
                                        className="form-input readonly"
                                        placeholder="Insurance Company Name"
                                        value={selectedCompany?.official_name || ""}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Billing Number</label>
                                    <div className="input-wrapper">
                                        <div className="input-icon">
                                            <i className="fas fa-hashtag"></i>
                                        </div>
                                        <input
                                            type="text"
                                            className={`form-input ${errors.billing_number ? 'is-invalid' : ''}`}
                                            placeholder="Enter billing number"
                                            {...register("billing_number")}
                                        />
                                    </div>
                                    {errors.billing_number && (
                                        <div className="error-message">
                                            <i className="fas fa-exclamation-circle"></i>
                                            {errors.billing_number.message}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Required Documents Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon dark">
                        <i className="fas fa-file-upload"></i>
                    </div>
                    <div className="section-title-wrapper">
                        <h3 className="section-title">Required Documents</h3>
                        <p className="section-description">Upload the necessary documentation for verification</p>
                    </div>
                </div>

                <div className="form-content">
                    <div className="form-row three-col">
                        <div className="form-group">
                            <label className="form-label">
                                Proof of License/Registration <span className="required">*</span>
                            </label>
                            <div className="file-upload-wrapper">
                                <input
                                    type="file"
                                    id="proofOfLicense"
                                    className="file-input"
                                    {...register("proof_of_license_or_registration")}
                                    onChange={(e) => handleFileChange(e, "proof_of_license_or_registration")}
                                />
                                <label htmlFor="proofOfLicense" className="file-label">
                                    <i className="fas fa-cloud-upload-alt"></i>
                                    <span>{getFileDisplayName("proof_of_license_or_registration")}</span>
                                </label>
                            </div>
                            {errors.proof_of_license_or_registration && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.proof_of_license_or_registration.message}
                                </div>
                            )}
                            {profile?.proof_of_license_or_registration && !fileNames.proof_of_license_or_registration && (
                                <a
                                    href={`${API_BASE_URL}/${profile.proof_of_license_or_registration}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="file-link"
                                >
                                    <i className="fas fa-download"></i> View current file
                                </a>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Proof of Liability Insurance <span className="required">*</span>
                            </label>
                            <div className="file-upload-wrapper">
                                <input
                                    type="file"
                                    id="proofOfInsurance"
                                    className="file-input"
                                    {...register("proof_of_liability_insurance")}
                                    onChange={(e) => handleFileChange(e, "proof_of_liability_insurance")}
                                />
                                <label htmlFor="proofOfInsurance" className="file-label">
                                    <i className="fas fa-cloud-upload-alt"></i>
                                    <span>{getFileDisplayName("proof_of_liability_insurance")}</span>
                                </label>
                            </div>
                            {errors.proof_of_liability_insurance && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.proof_of_liability_insurance.message}
                                </div>
                            )}
                            {profile?.proof_of_liability_insurance && !fileNames.proof_of_liability_insurance && (
                                <a
                                    href={`${API_BASE_URL}/${profile.proof_of_liability_insurance}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="file-link"
                                >
                                    <i className="fas fa-download"></i> View current file
                                </a>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Signed NDA</label>
                            <div className="file-upload-wrapper">
                                <input
                                    type="file"
                                    id="signedNda"
                                    className="file-input"
                                    {...register("signed_nda")}
                                    onChange={(e) => handleFileChange(e, "signed_nda")}
                                />
                                <label htmlFor="signedNda" className="file-label">
                                    <i className="fas fa-cloud-upload-alt"></i>
                                    <span>{getFileDisplayName("signed_nda")}</span>
                                </label>
                            </div>
                            {errors.signed_nda && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.signed_nda.message}
                                </div>
                            )}
                            {profile?.signed_nda && !fileNames.signed_nda && (
                                <a
                                    href={`${API_BASE_URL}/${profile.signed_nda}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="file-link"
                                >
                                    <i className="fas fa-download"></i> View current file
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .healthcare-form {
                    --primary: #0d9488;
                    --primary-dark: #0f766e;
                    --primary-light: #14b8a6;
                    --accent: #f0fdfa;
                    --success: #10b981;
                    --info: #0ea5e9;
                    --warning: #f59e0b;
                    --danger: #ef4444;
                    --secondary: #6366f1;
                    --dark: #1e293b;
                    --gray-50: #f8fafc;
                    --gray-100: #f1f5f9;
                    --gray-200: #e2e8f0;
                    --gray-300: #cbd5e1;
                    --gray-400: #94a3b8;
                    --gray-500: #64748b;
                    --gray-600: #475569;
                    --gray-700: #334155;
                    --gray-800: #1e293b;
                }

                .form-section {
                    background: white;
                    border-radius: 16px;
                    padding: 1.75rem;
                    margin-bottom: 1.5rem;
                    border: 1px solid var(--gray-100);
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                }

                .section-header {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    margin-bottom: 1.75rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid var(--gray-100);
                }

                .section-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    color: white;
                    flex-shrink: 0;
                }

                .section-icon.primary {
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                    box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
                }

                .section-icon.success {
                    background: linear-gradient(135deg, var(--success) 0%, #059669 100%);
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
                }

                .section-icon.info {
                    background: linear-gradient(135deg, var(--info) 0%, #0284c7 100%);
                    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
                }

                .section-icon.warning {
                    background: linear-gradient(135deg, var(--warning) 0%, #d97706 100%);
                    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
                }

                .section-icon.danger {
                    background: linear-gradient(135deg, var(--danger) 0%, #dc2626 100%);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
                }

                .section-icon.secondary {
                    background: linear-gradient(135deg, var(--secondary) 0%, #4f46e5 100%);
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
                }

                .section-icon.dark {
                    background: linear-gradient(135deg, var(--dark) 0%, #0f172a 100%);
                    box-shadow: 0 4px 12px rgba(30, 41, 59, 0.25);
                }

                .section-title-wrapper { flex: 1; }
                .section-title {
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: var(--gray-800);
                    margin: 0 0 0.25rem 0;
                }
                .section-description {
                    font-size: 0.875rem;
                    color: var(--gray-400);
                    margin: 0;
                }

                .form-content {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1.25rem;
                }

                .form-row.three-col {
                    grid-template-columns: repeat(3, 1fr);
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .form-group.full-width {
                    grid-column: 1 / -1;
                }

                .label-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .form-label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--gray-600);
                }

                .required { color: var(--danger); }

                .input-wrapper { position: relative; }

                .input-icon {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--gray-400);
                    font-size: 0.9rem;
                    z-index: 1;
                }

                .form-input {
                    width: 100%;
                    padding: 0.875rem 1rem 0.875rem 2.75rem;
                    font-size: 0.95rem;
                    font-weight: 500;
                    color: var(--gray-700);
                    background: var(--gray-50);
                    border: 2px solid var(--gray-200);
                    border-radius: 10px;
                    transition: all 0.25s ease;
                }

                .form-input:not(.input-wrapper .form-input) {
                    padding-left: 1rem;
                }

                .form-input:hover { border-color: var(--gray-300); }
                .form-input:focus {
                    outline: none;
                    border-color: var(--primary);
                    background: white;
                    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
                }
                .form-input:disabled {
                    background: var(--gray-100);
                    cursor: not-allowed;
                    opacity: 0.7;
                }
                .form-input.readonly {
                    background: var(--gray-100);
                    cursor: default;
                }
                .form-input.is-invalid { border-color: var(--danger); }

                .form-textarea {
                    width: 100%;
                    padding: 1rem;
                    font-size: 0.95rem;
                    font-weight: 500;
                    color: var(--gray-700);
                    background: var(--gray-50);
                    border: 2px solid var(--gray-200);
                    border-radius: 10px;
                    resize: vertical;
                    min-height: 100px;
                    transition: all 0.25s ease;
                }

                .form-textarea:focus {
                    outline: none;
                    border-color: var(--primary);
                    background: white;
                    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
                }
                .form-textarea.is-invalid { border-color: var(--danger); }

                .select-wrapper { position: relative; }

                .form-select {
                    width: 100%;
                    padding: 0.875rem 2.5rem 0.875rem 1rem;
                    font-size: 0.95rem;
                    font-weight: 500;
                    color: var(--gray-700);
                    background: var(--gray-50);
                    border: 2px solid var(--gray-200);
                    border-radius: 10px;
                    appearance: none;
                    cursor: pointer;
                    transition: all 0.25s ease;
                }

                .form-select:focus {
                    outline: none;
                    border-color: var(--primary);
                    background: white;
                    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
                }
                .form-select:disabled {
                    background: var(--gray-100);
                    cursor: not-allowed;
                    opacity: 0.7;
                }
                .form-select.is-invalid { border-color: var(--danger); }

                .select-icon {
                    position: absolute;
                    right: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--gray-400);
                    pointer-events: none;
                }

                .toggle-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 0.75rem;
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: var(--gray-600);
                    background: var(--gray-100);
                    border: 1px solid var(--gray-200);
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .toggle-btn:hover {
                    background: var(--gray-200);
                    color: var(--gray-700);
                }

                .suggestions-list {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    border: 1px solid var(--gray-200);
                    border-radius: 10px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    max-height: 200px;
                    overflow-y: auto;
                    z-index: 1000;
                    list-style: none;
                    padding: 0.5rem;
                    margin: 0.25rem 0 0 0;
                }

                .suggestion-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1rem;
                    cursor: pointer;
                    border-radius: 8px;
                    transition: background 0.2s ease;
                    color: var(--gray-600);
                    font-size: 0.9rem;
                }

                .suggestion-item:hover {
                    background: var(--accent);
                    color: var(--primary-dark);
                }

                .suggestion-item i { color: var(--gray-400); }

                .checkbox-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 0.75rem;
                }

                .checkbox-grid.compact {
                    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                }

                .checkbox-grid.scrollable {
                    max-height: 300px;
                    overflow-y: auto;
                    padding: 0.25rem;
                }

                .checkbox-card {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem;
                    background: var(--gray-50);
                    border: 2px solid var(--gray-200);
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.25s ease;
                }

                .checkbox-card.compact { padding: 0.75rem; }

                .checkbox-card:hover {
                    border-color: var(--gray-300);
                    transform: translateY(-1px);
                }

                .checkbox-card.selected {
                    border-color: var(--primary);
                    background: var(--accent);
                }

                .checkbox-indicator {
                    width: 22px;
                    height: 22px;
                    border: 2px solid var(--gray-300);
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                }

                .checkbox-indicator.small {
                    width: 18px;
                    height: 18px;
                    font-size: 0.65rem;
                }

                .checkbox-card.selected .checkbox-indicator {
                    background: var(--primary);
                    border-color: var(--primary);
                    color: white;
                }

                .checkbox-icon {
                    width: 36px;
                    height: 36px;
                    background: white;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--gray-400);
                    font-size: 1rem;
                }

                .checkbox-card.selected .checkbox-icon { color: var(--primary); }

                .checkbox-label {
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: var(--gray-600);
                }

                .checkbox-card.selected .checkbox-label { color: var(--gray-800); }

                .file-upload-wrapper { position: relative; }

                .file-input {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    opacity: 0;
                    cursor: pointer;
                }

                .file-label {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 1.5rem 1rem;
                    background: var(--gray-50);
                    border: 2px dashed var(--gray-300);
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    text-align: center;
                }

                .file-label:hover {
                    border-color: var(--primary);
                    background: var(--accent);
                }

                .file-label i {
                    font-size: 1.5rem;
                    color: var(--gray-400);
                }

                .file-label span {
                    font-size: 0.85rem;
                    color: var(--gray-500);
                    word-break: break-all;
                }

                .file-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.375rem;
                    font-size: 0.85rem;
                    color: var(--primary);
                    font-weight: 500;
                    text-decoration: none;
                    margin-top: 0.5rem;
                }

                .file-link:hover { text-decoration: underline; }

                .error-message {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--danger);
                    font-size: 0.85rem;
                    font-weight: 500;
                }

                @media (max-width: 992px) {
                    .form-row.three-col {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 768px) {
                    .form-section { padding: 1.25rem; }

                    .section-header {
                        flex-direction: column;
                        gap: 0.75rem;
                    }

                    .form-row,
                    .form-row.three-col {
                        grid-template-columns: 1fr;
                    }

                    .checkbox-grid,
                    .checkbox-grid.compact {
                        grid-template-columns: 1fr;
                    }

                    .label-row {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }
                }
            `}</style>
        </form>
    );
};

export default PrivateClinicsAndPracticesForm;
