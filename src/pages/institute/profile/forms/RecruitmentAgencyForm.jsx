import { API_BASE_URL } from "@config/apiConfig";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { recruitmentAgencyFormSchema } from "../../../../schemas/user/RecruitmentAgencyFormSchema";
import { fetchGeoapifySuggestions } from "../../../../components/api/geopify";

const RecruitmentAgencyForm = ({
    profile,
    userCategory,
    handleFormSubmit
}) => {
    const formId = "Recruitment Agency";
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [useManualAddress, setUseManualAddress] = useState(false);
    const [addressFieldsStatus, setAddressFieldsStatus] = useState({
        city: false,
        province: false,
        postal_code: false
    });
    const [fileNames, setFileNames] = useState({
        proof_of_business_registration: "",
        proof_of_liability_insurance: "",
        confidentiality_agreement: ""
    });

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(recruitmentAgencyFormSchema),
        defaultValues: {
            agency_name: "",
            business_number: "",
            province: "",
            city: "",
            postal_code: "",
            head_office_address: "",
            phone_number: "",
            email_address: "",
            website: "",
            primary_contact_full_name: "",
            primary_contact_position: "",
            primary_contact_email: "",
            primary_contact_phone: "",
            specialties_covered: [],
            regions_served: [],
            years_of_experience: "",
            number_of_recruiters: "",
            types_of_contracts_managed: [],
            recruitment_process_description: "",
            licensing_accreditation: "",
            proof_of_business_registration: null,
            proof_of_liability_insurance: null,
            confidentiality_agreement: null,
            billing_method: [],
            other_billing_method: "",
        },
    });

    const selectedBillingMethods = watch("billing_method", []);
    const headOfficeAddress = watch("head_office_address", "");
    const selectedSpecialties = watch("specialties_covered", []);
    const selectedRegions = watch("regions_served", []);
    const selectedContractTypes = watch("types_of_contracts_managed", []);

    const specialtiesOptions = [
        { value: "General Medicine", label: "General Medicine", icon: "fa-stethoscope" },
        { value: "Dental Care", label: "Dental Care", icon: "fa-tooth" },
        { value: "Nursing and Home Care", label: "Nursing and Home Care", icon: "fa-user-nurse" },
        { value: "Pharmacy", label: "Pharmacy", icon: "fa-pills" }
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
        { value: "temporary staffing", label: "Temporary Staffing", icon: "fa-clock" },
        { value: "permanent staffing", label: "Permanent Staffing", icon: "fa-user-check" }
    ];

    const billingMethodOptions = [
        { value: "commission_success", label: "Commission on Success", icon: "fa-percentage" },
        { value: "hourly_daily_rate", label: "Hourly / Daily Rate", icon: "fa-hourglass-half" },
        { value: "fixed_fee", label: "Fixed Fee / Flat Rate", icon: "fa-hand-holding-usd" },
        { value: "other", label: "Other", icon: "fa-ellipsis-h" }
    ];

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
            const fileName = filePath.split('/').pop();
            return fileName;
        }

        return "Choose file";
    };

    const onSubmit = async (data) => {
        const dataFiles = ["proof_of_business_registration", "proof_of_liability_insurance", "confidentiality_agreement"];
        await handleFormSubmit(data, dataFiles);
    };

    const handleAddressChange = async (value) => {
        setValue("head_office_address", value);
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

        setValue("head_office_address", suggestion.properties.formatted, { shouldValidate: true });
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

    useEffect(() => {
        if (profile && userCategory === formId) {
            reset({
                agency_name: profile.agency_name || "",
                business_number: profile.business_number || "",
                province: profile.province || "",
                city: profile.city || "",
                postal_code: profile.postal_code || "",
                head_office_address: profile.head_office_address || "",
                phone_number: profile.phone_number || "",
                email_address: profile.email_address || "",
                website: profile.website || "",
                primary_contact_full_name: profile.primary_contact_full_name || "",
                primary_contact_position: profile.primary_contact_position || "",
                primary_contact_email: profile.primary_contact_email || "",
                primary_contact_phone: profile.primary_contact_phone || "",
                specialties_covered: profile.specialties_covered || [],
                regions_served: profile.regions_served || [],
                years_of_experience: profile.years_of_experience || "",
                number_of_recruiters: profile.number_of_recruiters || "",
                types_of_contracts_managed: profile.types_of_contracts_managed || [],
                recruitment_process_description: profile.recruitment_process_description || "",
                licensing_accreditation: profile.licensing_accreditation || "",
                proof_of_business_registration: profile.proof_of_business_registration || null,
                proof_of_liability_insurance: profile.proof_of_liability_insurance || null,
                confidentiality_agreement: profile.confidentiality_agreement || null,
                billing_method: profile.billing_method || [],
                other_billing_method: profile.other_billing_method || "",
            });

            setUseManualAddress(false);

            if (profile.head_office_address) {
                setAddressFieldsStatus({
                    city: !profile.city,
                    province: !profile.province,
                    postal_code: !profile.postal_code
                });
            }

            setFileNames({
                proof_of_business_registration: "",
                proof_of_liability_insurance: "",
                confidentiality_agreement: ""
            });
        }
    }, [profile, userCategory, reset]);

    return (
        <form id="recruitment-agency-form" onSubmit={handleSubmit(onSubmit)} className="healthcare-form">
            {/* Agency Information Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon primary">
                        <i className="fas fa-building"></i>
                    </div>
                    <div className="section-title-wrapper">
                        <h3 className="section-title">Agency Information</h3>
                        <p className="section-description">Basic details about your recruitment agency</p>
                    </div>
                </div>

                <div className="form-content">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                Agency Name <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-briefcase"></i>
                                </div>
                                <input
                                    type="text"
                                    className={`form-input ${errors.agency_name ? 'is-invalid' : ''}`}
                                    placeholder="Enter agency name"
                                    {...register("agency_name")}
                                />
                            </div>
                            {errors.agency_name && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.agency_name.message}
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
                                    placeholder="Enter business number"
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
                                Head Office Address <span className="required">*</span>
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
                                    className={`form-input ${errors.head_office_address ? 'is-invalid' : ''}`}
                                    placeholder="Start typing address..."
                                    value={headOfficeAddress}
                                    onChange={(e) => handleAddressChange(e.target.value)}
                                    autoComplete="off"
                                />
                            ) : (
                                <input
                                    type="text"
                                    className={`form-input ${errors.head_office_address ? 'is-invalid' : ''}`}
                                    placeholder="Enter complete address manually"
                                    {...register("head_office_address")}
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
                        {errors.head_office_address && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-circle"></i>
                                {errors.head_office_address.message}
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
                            <label className="form-label">
                                Email Address <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-envelope"></i>
                                </div>
                                <input
                                    type="email"
                                    className={`form-input ${errors.email_address ? 'is-invalid' : ''}`}
                                    placeholder="Enter email address"
                                    {...register("email_address")}
                                />
                            </div>
                            {errors.email_address && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.email_address.message}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group full-width">
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

            {/* Primary Contact Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon info">
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
                                    <i className="fas fa-id-badge"></i>
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
                                Email <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-envelope"></i>
                                </div>
                                <input
                                    type="email"
                                    className={`form-input ${errors.primary_contact_email ? 'is-invalid' : ''}`}
                                    placeholder="Enter email address"
                                    {...register("primary_contact_email")}
                                />
                            </div>
                            {errors.primary_contact_email && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.primary_contact_email.message}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Phone <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-phone"></i>
                                </div>
                                <input
                                    type="text"
                                    className={`form-input ${errors.primary_contact_phone ? 'is-invalid' : ''}`}
                                    placeholder="(123) 456-7890"
                                    value={watch("primary_contact_phone") || ""}
                                    onChange={(e) => handlePhoneChange(e, "primary_contact_phone")}
                                    maxLength="14"
                                />
                            </div>
                            {errors.primary_contact_phone && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.primary_contact_phone.message}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Details Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon success">
                        <i className="fas fa-clipboard-list"></i>
                    </div>
                    <div className="section-title-wrapper">
                        <h3 className="section-title">Service Details</h3>
                        <p className="section-description">Information about the services you provide</p>
                    </div>
                </div>

                <div className="form-content">
                    <div className="form-group full-width">
                        <label className="form-label">
                            Specialties Covered <span className="required">*</span>
                        </label>
                        <div className="checkbox-grid">
                            {specialtiesOptions.map((option, index) => (
                                <div
                                    key={index}
                                    className={`checkbox-card ${selectedSpecialties.includes(option.value) ? 'selected' : ''}`}
                                    onClick={() => handleCheckboxChange("specialties_covered", option.value)}
                                >
                                    <div className="checkbox-indicator">
                                        {selectedSpecialties.includes(option.value) && <i className="fas fa-check"></i>}
                                    </div>
                                    <div className="checkbox-icon">
                                        <i className={`fas ${option.icon}`}></i>
                                    </div>
                                    <span className="checkbox-label">{option.label}</span>
                                </div>
                            ))}
                        </div>
                        {errors.specialties_covered && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-circle"></i>
                                {errors.specialties_covered.message}
                            </div>
                        )}
                    </div>

                    <div className="form-group full-width">
                        <label className="form-label">
                            Regions Served <span className="required">*</span>
                        </label>
                        <div className="checkbox-grid compact">
                            {regionsOptions.map((option, index) => (
                                <div
                                    key={index}
                                    className={`checkbox-card compact ${selectedRegions.includes(option.value) ? 'selected' : ''}`}
                                    onClick={() => handleCheckboxChange("regions_served", option.value)}
                                >
                                    <div className="checkbox-indicator small">
                                        {selectedRegions.includes(option.value) && <i className="fas fa-check"></i>}
                                    </div>
                                    <span className="checkbox-label">{option.label}</span>
                                </div>
                            ))}
                        </div>
                        {errors.regions_served && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-circle"></i>
                                {errors.regions_served.message}
                            </div>
                        )}
                    </div>

                    <div className="form-group full-width">
                        <label className="form-label">
                            Types of Contracts Managed <span className="required">*</span>
                        </label>
                        <div className="checkbox-grid">
                            {contractTypesOptions.map((option, index) => (
                                <div
                                    key={index}
                                    className={`checkbox-card ${selectedContractTypes.includes(option.value) ? 'selected' : ''}`}
                                    onClick={() => handleCheckboxChange("types_of_contracts_managed", option.value)}
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
                        {errors.types_of_contracts_managed && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-circle"></i>
                                {errors.types_of_contracts_managed.message}
                            </div>
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                Years of Experience <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-calendar-alt"></i>
                                </div>
                                <input
                                    type="number"
                                    className={`form-input ${errors.years_of_experience ? 'is-invalid' : ''}`}
                                    placeholder="Enter years of experience"
                                    {...register("years_of_experience")}
                                />
                            </div>
                            {errors.years_of_experience && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.years_of_experience.message}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Number of Recruiters <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-users"></i>
                                </div>
                                <input
                                    type="number"
                                    className={`form-input ${errors.number_of_recruiters ? 'is-invalid' : ''}`}
                                    placeholder="Enter number of recruiters"
                                    {...register("number_of_recruiters")}
                                />
                            </div>
                            {errors.number_of_recruiters && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.number_of_recruiters.message}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label className="form-label">Licensing / Accreditation</label>
                        <input
                            type="text"
                            className={`form-input ${errors.licensing_accreditation ? 'is-invalid' : ''}`}
                            placeholder="Enter licensing information"
                            {...register("licensing_accreditation")}
                        />
                        {errors.licensing_accreditation && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-circle"></i>
                                {errors.licensing_accreditation.message}
                            </div>
                        )}
                    </div>

                    <div className="form-group full-width">
                        <label className="form-label">
                            Recruitment Process Description <span className="required">*</span>
                        </label>
                        <textarea
                            className={`form-textarea ${errors.recruitment_process_description ? 'is-invalid' : ''}`}
                            rows="4"
                            placeholder="Describe your recruitment process..."
                            {...register("recruitment_process_description")}
                        ></textarea>
                        {errors.recruitment_process_description && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-circle"></i>
                                {errors.recruitment_process_description.message}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Billing Information Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon warning">
                        <i className="fas fa-dollar-sign"></i>
                    </div>
                    <div className="section-title-wrapper">
                        <h3 className="section-title">Billing Information</h3>
                        <p className="section-description">How you prefer to bill for your services</p>
                    </div>
                </div>

                <div className="form-content">
                    <div className="form-group full-width">
                        <label className="form-label">
                            Billing Method <span className="required">*</span>
                        </label>
                        <div className="checkbox-grid">
                            {billingMethodOptions.map((option, index) => (
                                <div
                                    key={index}
                                    className={`checkbox-card ${selectedBillingMethods.includes(option.value) ? 'selected' : ''}`}
                                    onClick={() => handleCheckboxChange("billing_method", option.value)}
                                >
                                    <div className="checkbox-indicator">
                                        {selectedBillingMethods.includes(option.value) && <i className="fas fa-check"></i>}
                                    </div>
                                    <div className="checkbox-icon">
                                        <i className={`fas ${option.icon}`}></i>
                                    </div>
                                    <span className="checkbox-label">{option.label}</span>
                                </div>
                            ))}
                        </div>
                        {errors.billing_method && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-circle"></i>
                                {errors.billing_method.message}
                            </div>
                        )}
                    </div>

                    {selectedBillingMethods.includes("other") && (
                        <div className="form-group full-width">
                            <label className="form-label">
                                Other Billing Methods <span className="required">*</span>
                            </label>
                            <textarea
                                className={`form-textarea ${errors.other_billing_method ? 'is-invalid' : ''}`}
                                rows="3"
                                placeholder="Describe other billing methods..."
                                {...register("other_billing_method")}
                            ></textarea>
                            {errors.other_billing_method && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.other_billing_method.message}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Required Documents Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon danger">
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
                                Proof of Business Registration <span className="required">*</span>
                            </label>
                            <div className="file-upload-wrapper">
                                <input
                                    type="file"
                                    id="businessRegistration"
                                    className="file-input"
                                    {...register("proof_of_business_registration")}
                                    accept=".pdf"
                                    onChange={(e) => handleFileChange(e, "proof_of_business_registration")}
                                />
                                <label htmlFor="businessRegistration" className="file-label">
                                    <i className="fas fa-cloud-upload-alt"></i>
                                    <span>{getFileDisplayName("proof_of_business_registration")}</span>
                                </label>
                            </div>
                            {errors.proof_of_business_registration && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.proof_of_business_registration.message}
                                </div>
                            )}
                            {profile?.proof_of_business_registration && !fileNames.proof_of_business_registration && (
                                <a
                                    href={`${API_BASE_URL}/${profile.proof_of_business_registration}`}
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
                                    id="liabilityInsurance"
                                    className="file-input"
                                    {...register("proof_of_liability_insurance")}
                                    accept=".pdf"
                                    onChange={(e) => handleFileChange(e, "proof_of_liability_insurance")}
                                />
                                <label htmlFor="liabilityInsurance" className="file-label">
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
                            <label className="form-label">
                                Confidentiality Agreement (NDA) <span className="required">*</span>
                            </label>
                            <div className="file-upload-wrapper">
                                <input
                                    type="file"
                                    id="nda"
                                    className="file-input"
                                    {...register("confidentiality_agreement")}
                                    accept=".pdf"
                                    onChange={(e) => handleFileChange(e, "confidentiality_agreement")}
                                />
                                <label htmlFor="nda" className="file-label">
                                    <i className="fas fa-cloud-upload-alt"></i>
                                    <span>{getFileDisplayName("confidentiality_agreement")}</span>
                                </label>
                            </div>
                            {errors.confidentiality_agreement && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.confidentiality_agreement.message}
                                </div>
                            )}
                            {profile?.confidentiality_agreement && !fileNames.confidentiality_agreement && (
                                <a
                                    href={`${API_BASE_URL}/${profile.confidentiality_agreement}`}
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
                    --success-light: #d1fae5;
                    --info: #0ea5e9;
                    --info-light: #e0f2fe;
                    --warning: #f59e0b;
                    --warning-light: #fef3c7;
                    --danger: #ef4444;
                    --danger-light: #fee2e2;
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

                /* Form Section */
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

                .section-icon.info {
                    background: linear-gradient(135deg, var(--info) 0%, #0284c7 100%);
                    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
                }

                .section-icon.success {
                    background: linear-gradient(135deg, var(--success) 0%, #059669 100%);
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
                }

                .section-icon.warning {
                    background: linear-gradient(135deg, var(--warning) 0%, #d97706 100%);
                    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
                }

                .section-icon.danger {
                    background: linear-gradient(135deg, var(--danger) 0%, #dc2626 100%);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
                }

                .section-title-wrapper {
                    flex: 1;
                }

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

                /* Form Layout */
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

                .required {
                    color: var(--danger);
                }

                /* Input Styles */
                .input-wrapper {
                    position: relative;
                }

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

                .form-input:hover {
                    border-color: var(--gray-300);
                }

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

                .form-input.is-invalid {
                    border-color: var(--danger);
                }

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

                .form-textarea.is-invalid {
                    border-color: var(--danger);
                }

                /* Select Styles */
                .select-wrapper {
                    position: relative;
                }

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

                .form-select.is-invalid {
                    border-color: var(--danger);
                }

                .select-icon {
                    position: absolute;
                    right: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--gray-400);
                    pointer-events: none;
                }

                /* Toggle Button */
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

                /* Suggestions List */
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

                .suggestion-item i {
                    color: var(--gray-400);
                }

                /* Checkbox Grid */
                .checkbox-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 0.75rem;
                }

                .checkbox-grid.compact {
                    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
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

                .checkbox-card.compact {
                    padding: 0.75rem;
                }

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

                .checkbox-card.selected .checkbox-icon {
                    color: var(--primary);
                }

                .checkbox-label {
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: var(--gray-600);
                }

                .checkbox-card.selected .checkbox-label {
                    color: var(--gray-800);
                }

                /* File Upload */
                .file-upload-wrapper {
                    position: relative;
                }

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

                .file-link:hover {
                    text-decoration: underline;
                }

                /* Error Message */
                .error-message {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--danger);
                    font-size: 0.85rem;
                    font-weight: 500;
                }

                /* Responsive */
                @media (max-width: 992px) {
                    .form-row.three-col {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 768px) {
                    .form-section {
                        padding: 1.25rem;
                    }

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

export default RecruitmentAgencyForm;
