// PharmacyForm.jsx
import { API_BASE_URL } from "@config/apiConfig";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pharmacyFormSchema } from "../../../../schemas/user/PharmacyFormSchema";
import { fetchGeoapifySuggestions } from "@components/api/geopify";

const PharmacyForm = ({
    profile,
    userCategory,
    handleFormSubmit,
    selectedSpecialties
}) => {
    const formId = "pharmacy-form";
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [useManualAddress, setUseManualAddress] = useState(false);
    const [addressFieldsStatus, setAddressFieldsStatus] = useState({
        city: false,
        province: false,
        postal_code: false
    });
    const [fileName, setFileName] = useState("");

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(pharmacyFormSchema),
        defaultValues: {
            business_legal_name: "",
            name_of_pharmacy: "",
            pharmacy_phone_number: "",
            types_of_contracts_managed: [],
            province: "",
            city: "",
            address: "",
            postal_code: "",
            languages: [],
            software: [],
            additional_services: "",
            weekday_staff_prescription_day: 0,
            weekend_staffs_prescriptions_day: 0,
            maximum_travel_fee: "",
            duration_for_day: "",
            accommodation_fee_per_night: "",
            current_number_of_pharmacists: 0,
            current_number_of_assistants: 0,
            additional_info_before_contract: "",
            logo: null,
            fee: false,
        },
    });

    const address = watch("address", "");
    const selectedContractTypes = watch("types_of_contracts_managed", []);
    const selectedLanguages = watch("languages", []);
    const selectedSoftware = watch("software", []);
    const feeChecked = watch("fee", false);

    const contractTypesOptions = [
        { value: "temporary staffing", label: "Temporary Staffing", icon: "fa-clock" },
        { value: "permanent staffing", label: "Permanent Staffing", icon: "fa-user-check" }
    ];

    const languagesOptions = [
        { value: "English", label: "English" },
        { value: "French", label: "French" },
        { value: "Spanish", label: "Spanish" },
        { value: "Mandarin", label: "Mandarin" },
        { value: "Arabic", label: "Arabic" },
        { value: "Other", label: "Other" }
    ];

    const softwareOptions = [
        { value: "AssystRx", label: "AssystRx" },
        { value: "Mentor", label: "Mentor" },
        { value: "PrioRx", label: "PrioRx" },
        { value: "RxPro", label: "RxPro" },
        { value: "Ubik", label: "Ubik" },
        { value: "ReflexRx (XDRx)", label: "ReflexRx (XDRx)" },
        { value: "CGSI/Gesphar", label: "CGSI/Gesphar" },
        { value: "Syphac Option", label: "Syphac Option" },
        { value: "L'Ordonnance (Logipharm)", label: "L'Ordonnance (Logipharm)" },
        { value: "Kroll", label: "Kroll" },
        { value: "Aucun", label: "Aucun" },
        { value: "Synmed (Dispill)", label: "Synmed (Dispill)" },
        { value: "Paratamax (Vial)", label: "Paratamax (Vial)" },
        { value: "Paratamax2 (Vial)", label: "Paratamax2 (Vial)" },
        { value: "Paratamini (Vial)", label: "Paratamini (Vial)" },
        { value: "CountAssist", label: "CountAssist" },
        { value: "AccuCount", label: "AccuCount" },
        { value: "EzCount", label: "EzCount" },
        { value: "Pacmed (Sachet)", label: "Pacmed (Sachet)" },
        { value: "ScriptPro (Vial)", label: "ScriptPro (Vial)" },
        { value: "Pharmaclik", label: "Pharmaclik" }
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

    const formatPhoneNumber = (value) => {
        const phone = value.replace(/\D/g, '');
        if (phone.length <= 3) return phone;
        if (phone.length <= 6) return `(${phone.slice(0, 3)}) ${phone.slice(3)}`;
        return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
    };

    const handlePhoneChange = (e) => {
        const formatted = formatPhoneNumber(e.target.value);
        setValue("pharmacy_phone_number", formatted);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
        }
    };

    const getFileDisplayName = () => {
        if (fileName) {
            return fileName;
        }

        if (profile && profile.logo) {
            const filePath = profile.logo;
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
        setValue("address", value);
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

        setValue("address", suggestion.properties.formatted, { shouldValidate: true });
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
        const dataFiles = ["logo"];
        await handleFormSubmit(data, dataFiles);
    };

    useEffect(() => {
        if (profile && userCategory === "Pharmacy") {
            reset({
                business_legal_name: profile.business_legal_name || "",
                name_of_pharmacy: profile.name_of_pharmacy || "",
                pharmacy_phone_number: profile.pharmacy_phone_number || "",
                types_of_contracts_managed: profile.types_of_contracts_managed || [],
                province: profile.province || "",
                city: profile.city || "",
                address: profile.address || "",
                postal_code: profile.postal_code || "",
                languages: profile.languages || [],
                software: profile.software || [],
                additional_services: profile.additional_services || "",
                weekday_staff_prescription_day: profile.weekday_staff_prescription_day || 0,
                weekend_staffs_prescriptions_day: profile.weekend_staffs_prescriptions_day || 0,
                maximum_travel_fee: profile.maximum_travel_fee || "",
                duration_for_day: profile.duration_for_day || "",
                accommodation_fee_per_night: profile.accommodation_fee_per_night || "",
                current_number_of_pharmacists: profile.current_number_of_pharmacists || 0,
                current_number_of_assistants: profile.current_number_of_assistants || 0,
                additional_info_before_contract: profile.additional_info_before_contract || "",
                logo: profile.logo || null,
                fee: profile.fee || false,
            });

            setUseManualAddress(false);

            if (profile.address) {
                setAddressFieldsStatus({
                    city: !profile.city,
                    province: !profile.province,
                    postal_code: !profile.postal_code
                });
            }

            setFileName("");
        }
    }, [profile, userCategory, reset]);

    return (
        <form id={formId} onSubmit={handleSubmit(onSubmit)} className="healthcare-form">
            {/* Pharmacy Information Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon primary">
                        <i className="fas fa-pills"></i>
                    </div>
                    <div className="section-title-wrapper">
                        <h3 className="section-title">Pharmacy Information</h3>
                        <p className="section-description">Basic details about your pharmacy</p>
                    </div>
                </div>

                <div className="form-content">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                Business Legal Name <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-building"></i>
                                </div>
                                <input
                                    type="text"
                                    className={`form-input ${errors.business_legal_name ? 'is-invalid' : ''}`}
                                    placeholder="Enter business legal name"
                                    {...register("business_legal_name")}
                                />
                            </div>
                            {errors.business_legal_name && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.business_legal_name.message}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Name of Pharmacy <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-prescription-bottle"></i>
                                </div>
                                <input
                                    type="text"
                                    className={`form-input ${errors.name_of_pharmacy ? 'is-invalid' : ''}`}
                                    placeholder="Enter pharmacy name"
                                    {...register("name_of_pharmacy")}
                                />
                            </div>
                            {errors.name_of_pharmacy && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.name_of_pharmacy.message}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label className="form-label">
                            Pharmacy Phone Number <span className="required">*</span>
                        </label>
                        <div className="input-wrapper">
                            <div className="input-icon">
                                <i className="fas fa-phone"></i>
                            </div>
                            <input
                                type="text"
                                className={`form-input ${errors.pharmacy_phone_number ? 'is-invalid' : ''}`}
                                placeholder="(123) 456-7890"
                                value={watch("pharmacy_phone_number") || ""}
                                onChange={handlePhoneChange}
                                maxLength="14"
                            />
                        </div>
                        {errors.pharmacy_phone_number && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-circle"></i>
                                {errors.pharmacy_phone_number.message}
                            </div>
                        )}
                    </div>

                    <div className="form-group full-width">
                        <div className="label-row">
                            <label className="form-label">
                                Address <span className="required">*</span>
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
                                    className={`form-input ${errors.address ? 'is-invalid' : ''}`}
                                    placeholder="Start typing address..."
                                    value={address}
                                    onChange={(e) => handleAddressChange(e.target.value)}
                                    autoComplete="off"
                                />
                            ) : (
                                <input
                                    type="text"
                                    className={`form-input ${errors.address ? 'is-invalid' : ''}`}
                                    placeholder="Enter complete address manually"
                                    {...register("address")}
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
                        {errors.address && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-circle"></i>
                                {errors.address.message}
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
                </div>
            </div>

            {/* Services & Requirements Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon success">
                        <i className="fas fa-cogs"></i>
                    </div>
                    <div className="section-title-wrapper">
                        <h3 className="section-title">Services & Requirements</h3>
                        <p className="section-description">Contract types, languages, and software used</p>
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

                        <div className="form-group">
                            <label className="form-label">
                                Languages <span className="required">*</span>
                            </label>
                            <div className="checkbox-grid compact">
                                {languagesOptions.map((option, index) => (
                                    <div
                                        key={index}
                                        className={`checkbox-card compact ${selectedLanguages.includes(option.value) ? 'selected' : ''}`}
                                        onClick={() => handleCheckboxChange("languages", option.value)}
                                    >
                                        <div className="checkbox-indicator small">
                                            {selectedLanguages.includes(option.value) && <i className="fas fa-check"></i>}
                                        </div>
                                        <span className="checkbox-label">{option.label}</span>
                                    </div>
                                ))}
                            </div>
                            {errors.languages && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.languages.message}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label className="form-label">
                            Software <span className="required">*</span>
                        </label>
                        <div className="checkbox-grid compact scrollable">
                            {softwareOptions.map((option, index) => (
                                <div
                                    key={index}
                                    className={`checkbox-card compact ${selectedSoftware.includes(option.value) ? 'selected' : ''}`}
                                    onClick={() => handleCheckboxChange("software", option.value)}
                                >
                                    <div className="checkbox-indicator small">
                                        {selectedSoftware.includes(option.value) && <i className="fas fa-check"></i>}
                                    </div>
                                    <span className="checkbox-label">{option.label}</span>
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

                    <div className="form-group full-width">
                        <label className="form-label">
                            Additional Services <span className="required">*</span>
                        </label>
                        <textarea
                            className={`form-textarea ${errors.additional_services ? 'is-invalid' : ''}`}
                            rows="3"
                            placeholder="Describe additional services offered..."
                            {...register("additional_services")}
                        ></textarea>
                        {errors.additional_services && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-circle"></i>
                                {errors.additional_services.message}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Operational Details Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon info">
                        <i className="fas fa-chart-line"></i>
                    </div>
                    <div className="section-title-wrapper">
                        <h3 className="section-title">Operational Details</h3>
                        <p className="section-description">Prescription volume and staffing information</p>
                    </div>
                </div>

                <div className="form-content">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                Weekday Prescriptions per Day <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-file-prescription"></i>
                                </div>
                                <input
                                    type="number"
                                    className={`form-input ${errors.weekday_staff_prescription_day ? 'is-invalid' : ''}`}
                                    placeholder="Enter number"
                                    {...register("weekday_staff_prescription_day", { valueAsNumber: true })}
                                />
                            </div>
                            {errors.weekday_staff_prescription_day && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.weekday_staff_prescription_day.message}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Weekend Prescriptions per Day <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-file-prescription"></i>
                                </div>
                                <input
                                    type="number"
                                    className={`form-input ${errors.weekend_staffs_prescriptions_day ? 'is-invalid' : ''}`}
                                    placeholder="Enter number"
                                    {...register("weekend_staffs_prescriptions_day", { valueAsNumber: true })}
                                />
                            </div>
                            {errors.weekend_staffs_prescriptions_day && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.weekend_staffs_prescriptions_day.message}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                Current Number of Pharmacists <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-user-md"></i>
                                </div>
                                <input
                                    type="number"
                                    className={`form-input ${errors.current_number_of_pharmacists ? 'is-invalid' : ''}`}
                                    placeholder="Enter number"
                                    {...register("current_number_of_pharmacists", { valueAsNumber: true })}
                                />
                            </div>
                            {errors.current_number_of_pharmacists && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.current_number_of_pharmacists.message}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Current Number of Assistants <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-users"></i>
                                </div>
                                <input
                                    type="number"
                                    className={`form-input ${errors.current_number_of_assistants ? 'is-invalid' : ''}`}
                                    placeholder="Enter number"
                                    {...register("current_number_of_assistants", { valueAsNumber: true })}
                                />
                            </div>
                            {errors.current_number_of_assistants && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.current_number_of_assistants.message}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Financial Details Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon warning">
                        <i className="fas fa-dollar-sign"></i>
                    </div>
                    <div className="section-title-wrapper">
                        <h3 className="section-title">Financial Details (Optional)</h3>
                        <p className="section-description">Fee structure and compensation details</p>
                    </div>
                </div>

                <div className="form-content">
                    <div className="form-row three-col">
                        <div className="form-group">
                            <label className="form-label">Maximum Travel Fee</label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-dollar-sign"></i>
                                </div>
                                <input
                                    type="number"
                                    className={`form-input ${errors.maximum_travel_fee ? 'is-invalid' : ''}`}
                                    placeholder="0.00"
                                    step="0.01"
                                    {...register("maximum_travel_fee")}
                                />
                            </div>
                            {errors.maximum_travel_fee && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.maximum_travel_fee.message}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Duration per Day (hours)</label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-clock"></i>
                                </div>
                                <input
                                    type="number"
                                    className={`form-input ${errors.duration_for_day ? 'is-invalid' : ''}`}
                                    placeholder="8"
                                    {...register("duration_for_day")}
                                />
                            </div>
                            {errors.duration_for_day && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.duration_for_day.message}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Accommodation Fee per Night</label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-dollar-sign"></i>
                                </div>
                                <input
                                    type="number"
                                    className={`form-input ${errors.accommodation_fee_per_night ? 'is-invalid' : ''}`}
                                    placeholder="0.00"
                                    step="0.01"
                                    {...register("accommodation_fee_per_night")}
                                />
                            </div>
                            {errors.accommodation_fee_per_night && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.accommodation_fee_per_night.message}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <div className="fee-toggle">
                            <div
                                className={`fee-toggle-card ${feeChecked ? 'selected' : ''}`}
                                onClick={() => setValue("fee", !feeChecked)}
                            >
                                <div className="checkbox-indicator">
                                    {feeChecked && <i className="fas fa-check"></i>}
                                </div>
                                <span className="fee-toggle-label">Additional fees apply</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Information Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon danger">
                        <i className="fas fa-info-circle"></i>
                    </div>
                    <div className="section-title-wrapper">
                        <h3 className="section-title">Additional Information</h3>
                        <p className="section-description">Extra details and pharmacy branding</p>
                    </div>
                </div>

                <div className="form-content">
                    <div className="form-group full-width">
                        <label className="form-label">
                            Additional Information Before Contract <span className="required">*</span>
                        </label>
                        <textarea
                            className={`form-textarea ${errors.additional_info_before_contract ? 'is-invalid' : ''}`}
                            rows="4"
                            placeholder="Enter any additional information..."
                            {...register("additional_info_before_contract")}
                        ></textarea>
                        {errors.additional_info_before_contract && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-circle"></i>
                                {errors.additional_info_before_contract.message}
                            </div>
                        )}
                    </div>

                    <div className="form-group full-width">
                        <label className="form-label">Pharmacy Logo</label>
                        <div className="file-upload-wrapper">
                            <input
                                type="file"
                                id="logo"
                                className="file-input"
                                {...register("logo")}
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="logo" className="file-label">
                                <i className="fas fa-cloud-upload-alt"></i>
                                <span>{getFileDisplayName()}</span>
                            </label>
                        </div>
                        {errors.logo && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-circle"></i>
                                {errors.logo.message}
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
                    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                }

                .checkbox-grid.scrollable {
                    max-height: 250px;
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

                .fee-toggle { margin-top: 0.5rem; }

                .fee-toggle-card {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.875rem 1.25rem;
                    background: var(--gray-50);
                    border: 2px solid var(--gray-200);
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.25s ease;
                }

                .fee-toggle-card:hover { border-color: var(--gray-300); }

                .fee-toggle-card.selected {
                    border-color: var(--primary);
                    background: var(--accent);
                }

                .fee-toggle-card.selected .checkbox-indicator {
                    background: var(--primary);
                    border-color: var(--primary);
                    color: white;
                }

                .fee-toggle-label {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: var(--gray-600);
                }

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

export default PharmacyForm;
