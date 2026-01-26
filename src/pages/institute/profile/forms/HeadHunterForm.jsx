// HeadHunterForm.jsx
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HeadHunterFormSchema } from "../../../../schemas/user/HeadHunterFormSchema";
import { fetchGeoapifySuggestions } from "../../../../components/api/geopify";

const HeadHunterForm = ({ profileData, handleFormSubmit }) => {
    const formId = "headhunter-form";

    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [useManualAddress, setUseManualAddress] = useState(false);
    const [addressFieldsStatus, setAddressFieldsStatus] = useState({
        city: false,
        province: false,
        postal_code: false
    });

    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedSectors, setSelectedSectors] = useState([]);
    const [selectedBillingMethods, setSelectedBillingMethods] = useState([]);
    const [selectedRegions, setSelectedRegions] = useState([]);
    const [legalForm, setLegalForm] = useState("");

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(HeadHunterFormSchema),
        defaultValues: {
            profile_type: "",
            legal_form: "",
            legal_company_name: "",
            owner_name: "",
            legal_address: "",
            city: "",
            province: "",
            postal_code: "",
            phone: "",
            business_email: "",
            website: "",
            federal_number: "",
            hr_certification: "",
            regions_served: [],
            types_of_contracts_managed: [],
            specialties_covered: [],
            notes: "",
            billing_method: [],
            other_billing_method: "",
        },
    });

    const legalAddress = watch("legal_address", "");

    const contractTypesOptions = [
        { value: "temporary staffing", label: "Temporary Staffing", icon: "fa-clock" },
        { value: "permanent staffing", label: "Permanent Staffing", icon: "fa-user-check" }
    ];

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

    const billingMethodOptions = [
        { value: "commission_success", label: "Commission on Success", icon: "fa-percentage" },
        { value: "hourly_daily_rate", label: "Hourly / Daily Rate", icon: "fa-hourglass-half" },
        { value: "fixed_fee", label: "Fixed Fee / Flat Rate", icon: "fa-hand-holding-usd" },
        { value: "other", label: "Other", icon: "fa-ellipsis-h" },
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

    const handleCheckboxChange = (fieldName, value, setStateFunction) => {
        const currentValues = watch(fieldName) || [];
        let updatedValues;

        if (currentValues.includes(value)) {
            updatedValues = currentValues.filter(item => item !== value);
        } else {
            updatedValues = [...currentValues, value];
        }

        setValue(fieldName, updatedValues, { shouldValidate: true });
        setStateFunction(updatedValues);
    };

    const handleAddressChange = async (value) => {
        setValue("legal_address", value);
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

        setValue("legal_address", suggestion.properties.formatted, { shouldValidate: true });
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

    const onSubmit = async (data) => {
        await handleFormSubmit(data);
    };

    useEffect(() => {
        if (profileData) {
            const formData = {
                profile_type: profileData.profile_type || "",
                legal_form: profileData.legal_form || "",
                legal_company_name: profileData.legal_company_name || "",
                owner_name: profileData.owner_name || "",
                legal_address: profileData.legal_address || "",
                city: profileData.city || "",
                province: profileData.province || "",
                postal_code: profileData.postal_code || "",
                phone: profileData.phone || "",
                business_email: profileData.business_email || "",
                website: profileData.website || "",
                federal_number: profileData.federal_number || "",
                hr_certification: profileData.hr_certification || "",
                regions_served: profileData.regions_served || [],
                types_of_contracts_managed: profileData.types_of_contracts_managed || [],
                specialties_covered: profileData.specialties_covered || [],
                notes: profileData.notes || "",
                billing_method: profileData.billing_method || [],
                other_billing_method: profileData.other_billing_method || "",
            };

            reset(formData);
            setSelectedServices(profileData.types_of_contracts_managed || []);
            setSelectedSectors(profileData.specialties_covered || []);
            setSelectedRegions(profileData.regions_served || []);
            setSelectedBillingMethods(profileData.billing_method || []);
            setLegalForm(profileData.legal_form || "");

            setUseManualAddress(false);

            if (profileData.legal_address) {
                setAddressFieldsStatus({
                    city: !profileData.city,
                    province: !profileData.province,
                    postal_code: !profileData.postal_code
                });
            }
        }
    }, [profileData, reset]);

    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === "legal_form") {
                setLegalForm(value.legal_form);
            }
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    return (
        <form id={formId} onSubmit={handleSubmit(onSubmit)} className="healthcare-form">
            {/* Head Hunter Information Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon primary">
                        <i className="fas fa-user-tie"></i>
                    </div>
                    <div className="section-title-wrapper">
                        <h3 className="section-title">Head Hunter Information</h3>
                        <p className="section-description">Basic details about your head hunter profile</p>
                    </div>
                </div>

                <div className="form-content">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                Profile Type <span className="required">*</span>
                            </label>
                            <div className="select-wrapper">
                                <select
                                    className={`form-select ${errors.profile_type ? 'is-invalid' : ''}`}
                                    {...register("profile_type")}
                                >
                                    <option value="">Select Profile Type</option>
                                    <option value="individual">Individual</option>
                                    <option value="firm">Firm</option>
                                </select>
                                <div className="select-icon">
                                    <i className="fas fa-chevron-down"></i>
                                </div>
                            </div>
                            {errors.profile_type && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.profile_type.message}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Legal Form <span className="required">*</span>
                            </label>
                            <div className="select-wrapper">
                                <select
                                    className={`form-select ${errors.legal_form ? 'is-invalid' : ''}`}
                                    {...register("legal_form")}
                                >
                                    <option value="">Select Legal Form</option>
                                    <option value="sole_proprietorship">Sole Proprietorship</option>
                                    <option value="partnership">Partnership</option>
                                    <option value="corporation">Corporation</option>
                                </select>
                                <div className="select-icon">
                                    <i className="fas fa-chevron-down"></i>
                                </div>
                            </div>
                            {errors.legal_form && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.legal_form.message}
                                </div>
                            )}
                        </div>
                    </div>

                    {(legalForm === "partnership" || legalForm === "corporation") && (
                        <div className="form-group full-width">
                            <label className="form-label">
                                Legal Company Name <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-building"></i>
                                </div>
                                <input
                                    type="text"
                                    className={`form-input ${errors.legal_company_name ? 'is-invalid' : ''}`}
                                    placeholder="Enter legal company name"
                                    {...register("legal_company_name")}
                                />
                            </div>
                            {errors.legal_company_name && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.legal_company_name.message}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="form-group full-width">
                        <label className="form-label">
                            Owner Name <span className="required">*</span>
                        </label>
                        <div className="input-wrapper">
                            <div className="input-icon">
                                <i className="fas fa-user"></i>
                            </div>
                            <input
                                type="text"
                                className={`form-input ${errors.owner_name ? 'is-invalid' : ''}`}
                                placeholder="Enter owner name"
                                {...register("owner_name")}
                            />
                        </div>
                        {errors.owner_name && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-circle"></i>
                                {errors.owner_name.message}
                            </div>
                        )}
                    </div>

                    <div className="form-group full-width">
                        <div className="label-row">
                            <label className="form-label">
                                Legal Address <span className="required">*</span>
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
                                    className={`form-input ${errors.legal_address ? 'is-invalid' : ''}`}
                                    placeholder="Start typing address..."
                                    value={legalAddress}
                                    onChange={(e) => handleAddressChange(e.target.value)}
                                    autoComplete="off"
                                />
                            ) : (
                                <input
                                    type="text"
                                    className={`form-input ${errors.legal_address ? 'is-invalid' : ''}`}
                                    placeholder="Enter complete address manually"
                                    {...register("legal_address")}
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
                        {errors.legal_address && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-circle"></i>
                                {errors.legal_address.message}
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
                                Phone <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-phone"></i>
                                </div>
                                <input
                                    type="text"
                                    className={`form-input ${errors.phone ? 'is-invalid' : ''}`}
                                    placeholder="(123) 456-7890"
                                    value={watch("phone") || ""}
                                    onChange={(e) => handlePhoneChange(e, "phone")}
                                    maxLength="14"
                                />
                            </div>
                            {errors.phone && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.phone.message}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Business Email <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-envelope"></i>
                                </div>
                                <input
                                    type="email"
                                    className={`form-input ${errors.business_email ? 'is-invalid' : ''}`}
                                    placeholder="Enter business email"
                                    {...register("business_email")}
                                />
                            </div>
                            {errors.business_email && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.business_email.message}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
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

                        <div className="form-group">
                            <label className="form-label">Federal Number</label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-id-card"></i>
                                </div>
                                <input
                                    type="text"
                                    className={`form-input ${errors.federal_number ? 'is-invalid' : ''}`}
                                    placeholder="Enter federal number"
                                    {...register("federal_number")}
                                />
                            </div>
                            {errors.federal_number && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.federal_number.message}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label className="form-label">HR Certification</label>
                        <div className="input-wrapper">
                            <div className="input-icon">
                                <i className="fas fa-certificate"></i>
                            </div>
                            <input
                                type="text"
                                className={`form-input ${errors.hr_certification ? 'is-invalid' : ''}`}
                                placeholder="Enter HR certification"
                                {...register("hr_certification")}
                            />
                        </div>
                        {errors.hr_certification && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-circle"></i>
                                {errors.hr_certification.message}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Services & Specialization Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon success">
                        <i className="fas fa-briefcase"></i>
                    </div>
                    <div className="section-title-wrapper">
                        <h3 className="section-title">Services & Specialization</h3>
                        <p className="section-description">Contract types, specialties, and regions you serve</p>
                    </div>
                </div>

                <div className="form-content">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                Types of Contracts Managed <span className="required">*</span>
                            </label>
                            <div className="checkbox-grid">
                                {contractTypesOptions.map((option, index) => (
                                    <div
                                        key={index}
                                        className={`checkbox-card ${selectedServices.includes(option.value) ? 'selected' : ''}`}
                                        onClick={() => handleCheckboxChange("types_of_contracts_managed", option.value, setSelectedServices)}
                                    >
                                        <div className="checkbox-indicator">
                                            {selectedServices.includes(option.value) && <i className="fas fa-check"></i>}
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

                        <div className="form-group">
                            <label className="form-label">
                                Specialties Covered <span className="required">*</span>
                            </label>
                            <div className="checkbox-grid">
                                {specialtiesOptions.map((option, index) => (
                                    <div
                                        key={index}
                                        className={`checkbox-card ${selectedSectors.includes(option.value) ? 'selected' : ''}`}
                                        onClick={() => handleCheckboxChange("specialties_covered", option.value, setSelectedSectors)}
                                    >
                                        <div className="checkbox-indicator">
                                            {selectedSectors.includes(option.value) && <i className="fas fa-check"></i>}
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
                                    onClick={() => handleCheckboxChange("regions_served", option.value, setSelectedRegions)}
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
                                    onClick={() => handleCheckboxChange("billing_method", option.value, setSelectedBillingMethods)}
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

            {/* Additional Notes Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon info">
                        <i className="fas fa-sticky-note"></i>
                    </div>
                    <div className="section-title-wrapper">
                        <h3 className="section-title">Additional Notes</h3>
                        <p className="section-description">Any extra information you'd like to share</p>
                    </div>
                </div>

                <div className="form-content">
                    <div className="form-group full-width">
                        <label className="form-label">Notes</label>
                        <textarea
                            className={`form-textarea ${errors.notes ? 'is-invalid' : ''}`}
                            rows="4"
                            placeholder="Enter any additional notes..."
                            {...register("notes")}
                        ></textarea>
                        {errors.notes && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-circle"></i>
                                {errors.notes.message}
                            </div>
                        )}
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

                .section-icon.warning {
                    background: linear-gradient(135deg, var(--warning) 0%, #d97706 100%);
                    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
                }

                .section-icon.info {
                    background: linear-gradient(135deg, var(--info) 0%, #0284c7 100%);
                    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
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

export default HeadHunterForm;
