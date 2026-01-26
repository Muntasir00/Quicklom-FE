import { API_BASE_URL } from "@config/apiConfig";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { dentalFormSchema } from "@schemas/user/DentalFormSchema";

const DentalForm = ({ profileData, handleFormSubmit }) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const [fileName, setFileName] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(dentalFormSchema),
        defaultValues: {
            type_of_clinic: "",
            institution_phone_number: "",
            type_of_contract: [],
            logo: null,
            province: "",
            city: "",
            address: "",
            postal_code: "",
            languages: [],
            software: [],
            services: [],
            weekday_traffic_patients_per_day: 0,
            weekend_traffic_prescriptions_per_day: 0,
            fees: "",
            maximum_travel_fee: 0,
            per_diem_fee_per_day: 0,
            accommodation_fee_per_night: 0,
            odontogram_system: [],
            type_of_ultrasound: [],
            type_of_radiography: [],
            parking: [],
            number_of_current_dentists: 0,
            number_of_current_dental_hygienists: 0,
            additional_info_before_contract: "",
        },
    });

    const feesEnabled = watch("fees");
    const selectedContractTypes = watch("type_of_contract", []);
    const selectedLanguages = watch("languages", []);
    const selectedSoftware = watch("software", []);
    const selectedServices = watch("services", []);
    const selectedOdontogram = watch("odontogram_system", []);
    const selectedUltrasound = watch("type_of_ultrasound", []);
    const selectedRadiography = watch("type_of_radiography", []);
    const selectedParking = watch("parking", []);

    const contractTypesOptions = [
        { value: "Placement", label: "Permanent Staffing", icon: "fa-user-check" },
        { value: "Replacement", label: "Temporary Staffing", icon: "fa-clock" }
    ];

    const languagesOptions = [
        { value: "English", label: "English" },
        { value: "French", label: "French" },
        { value: "Spanish", label: "Spanish" },
        { value: "Mandarin", label: "Mandarin" },
        { value: "Cantonese", label: "Cantonese" },
        { value: "Arabic", label: "Arabic" },
        { value: "Italian", label: "Italian" },
        { value: "German", label: "German" },
        { value: "Portuguese", label: "Portuguese" }
    ];

    const softwareOptions = [
        { value: "ABELdent", label: "ABELdent" },
        { value: "ADSTRA MANAGEMENT", label: "ADSTRA MANAGEMENT" },
        { value: "AXXIUM X", label: "AXXIUM X" },
        { value: "AXXIUM R", label: "AXXIUM R" },
        { value: "AXXIUM R+", label: "AXXIUM R+" },
        { value: "TRACKER", label: "TRACKER" },
        { value: "AD2000", label: "AD2000" },
        { value: "CADI OPTIMUM", label: "CADI OPTIMUM" },
        { value: "WINDENJ", label: "WINDENJ" },
        { value: "DEXIS", label: "DEXIS" },
        { value: "EXCELDENJ", label: "EXCELDENJ" },
        { value: "X JBAC", label: "X JBAC" },
        { value: "CONSULT PRO", label: "CONSULT PRO" },
        { value: "CURVE DMS", label: "CURVE DMS" },
        { value: "DENTIMAX", label: "DENTIMAX" },
        { value: "DIALOG", label: "DIALOG" },
        { value: "DOMTRAK", label: "DOMTRAK" },
        { value: "ENTERDENJ", label: "ENTERDENJ" },
        { value: "ORYX DENTAL SOFTWARE", label: "ORYX DENTAL SOFTWARE" },
        { value: "POWER PRACTICE", label: "POWER PRACTICE" },
        { value: "AXIUM", label: "AXIUM" },
        { value: "DOVETAIL", label: "DOVETAIL" },
        { value: "GOLD", label: "GOLD" },
        { value: "DENTRIX", label: "DENTRIX" },
        { value: "OMEXISION", label: "OMEXISION" },
        { value: "ORTHONOVO", label: "ORTHONOVO" },
        { value: "ENDOXISION", label: "ENDOXISION" },
        { value: "DENTAL VISION ENTREPRISE", label: "DENTAL VISION ENTREPRISE" },
        { value: "PERIOVISION", label: "PERIOVISION" },
        { value: "IKLIX", label: "IKLIX" },
        { value: "QUADRA DENTAL SOFTWARE", label: "QUADRA DENTAL SOFTWARE" },
        { value: "LIVE DOM", label: "LIVE DOM" },
        { value: "DENTONOVO", label: "DENTONOVO" },
        { value: "MAXIMUS", label: "MAXIMUS" },
        { value: "CLICK", label: "CLICK" },
        { value: "MAXIDENJ", label: "MAXIDENJ" },
        { value: "PARADIGM", label: "PARADIGM" },
        { value: "MACPRACTICE DDS", label: "MACPRACTICE DDS" },
        { value: "OPEN DENTAL SOFTWARE", label: "OPEN DENTAL SOFTWARE" },
        { value: "DENTAL VARIE", label: "DENTAL VARIE" },
        { value: "EAGLESOEJ", label: "EAGLESOEJ" },
        { value: "CLEARDENJ", label: "CLEARDENJ" },
        { value: "PROGIDENJ", label: "PROGIDENJ" },
        { value: "DENTITES", label: "DENTITES" },
        { value: "SENSE", label: "SENSE" },
        { value: "TDO", label: "TDO" },
        { value: "AUTORIA", label: "AUTORIA" },
        { value: "PROGITES", label: "PROGITES" },
        { value: "AKITU ONE", label: "AKITU ONE" },
        { value: "GID", label: "GID" },
        { value: "SIDEXIS", label: "SIDEXIS" },
        { value: "VISION R", label: "VISION R" }
    ];

    const servicesOptions = [
        { value: "Periodontics", label: "Periodontics", icon: "fa-teeth" },
        { value: "Orthodontics", label: "Orthodontics", icon: "fa-teeth-open" },
        { value: "Dental Restoration", label: "Dental Restoration", icon: "fa-tooth" },
        { value: "General Dentistry", label: "General Dentistry", icon: "fa-tooth" },
        { value: "Oral Surgery", label: "Oral Surgery", icon: "fa-syringe" },
        { value: "Prosthodontics", label: "Prosthodontics", icon: "fa-teeth" },
        { value: "Odontology", label: "Odontology", icon: "fa-tooth" },
        { value: "Pediatric Dentistry", label: "Pediatric Dentistry", icon: "fa-child" }
    ];

    const odontogramOptions = [
        { value: "Paper", label: "Paper", icon: "fa-file-alt" },
        { value: "Digital", label: "Digital", icon: "fa-laptop-medical" }
    ];

    const ultrasoundOptions = [
        { value: "Savitron", label: "Savitron" },
        { value: "Piezo", label: "Piezo" }
    ];

    const radiographyOptions = [
        { value: "Film", label: "Film" },
        { value: "Sensors", label: "Sensors" },
        { value: "Phosphor plates", label: "Phosphor plates" }
    ];

    const parkingOptions = [
        { value: "Free on-site", label: "Free on-site", icon: "fa-parking" },
        { value: "Paid on-site", label: "Paid on-site", icon: "fa-credit-card" },
        { value: "Street parking", label: "Street parking", icon: "fa-road" },
        { value: "Public parking", label: "Public parking", icon: "fa-warehouse" },
        { value: "No parking available", label: "No parking available", icon: "fa-ban" }
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

    const formatPhoneNumber = (value) => {
        const phone = value.replace(/\D/g, '');
        if (phone.length <= 3) return phone;
        if (phone.length <= 6) return `(${phone.slice(0, 3)}) ${phone.slice(3)}`;
        return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
    };

    const handlePhoneChange = (e) => {
        const formatted = formatPhoneNumber(e.target.value);
        setValue("institution_phone_number", formatted);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
        }
    };

    const getFileDisplayName = () => {
        if (fileName) return fileName;
        if (profileData?.logo) {
            return profileData.logo.split('/').pop();
        }
        return "Choose file";
    };

    const onSubmit = async (data) => {
        const dataFiles = ['logo'];
        await handleFormSubmit(data, dataFiles);
    };

    useEffect(() => {
        if (profileData) {
            reset({ ...profileData });
            setFileName("");
        }
    }, [profileData, reset]);

    return (
        <form id="dental-clinic-form" onSubmit={handleSubmit(onSubmit)} className="healthcare-form">
            {/* Clinic Information Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon primary">
                        <i className="fas fa-tooth"></i>
                    </div>
                    <div className="section-title-wrapper">
                        <h3 className="section-title">Clinic Information</h3>
                        <p className="section-description">Basic details about your dental clinic</p>
                    </div>
                </div>

                <div className="form-content">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                Type of Clinic <span className="required">*</span>
                            </label>
                            <div className="select-wrapper">
                                <select
                                    className={`form-select ${errors.type_of_clinic ? 'is-invalid' : ''}`}
                                    {...register("type_of_clinic")}
                                >
                                    <option value="">Select Type</option>
                                    <option value="Private Clinic">Private Clinic</option>
                                    <option value="Hospital Clinic">Hospital Clinic</option>
                                </select>
                                <div className="select-icon">
                                    <i className="fas fa-chevron-down"></i>
                                </div>
                            </div>
                            {errors.type_of_clinic && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.type_of_clinic.message}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Institution Phone Number <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-phone"></i>
                                </div>
                                <input
                                    type="text"
                                    className={`form-input ${errors.institution_phone_number ? 'is-invalid' : ''}`}
                                    placeholder="(123) 456-7890"
                                    value={watch("institution_phone_number") || ""}
                                    onChange={handlePhoneChange}
                                    maxLength="14"
                                />
                            </div>
                            {errors.institution_phone_number && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.institution_phone_number.message}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                Type of Contract <span className="required">*</span>
                            </label>
                            <div className="checkbox-grid">
                                {contractTypesOptions.map((option, index) => (
                                    <div
                                        key={index}
                                        className={`checkbox-card ${selectedContractTypes.includes(option.value) ? 'selected' : ''}`}
                                        onClick={() => handleCheckboxChange("type_of_contract", option.value)}
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
                            {errors.type_of_contract && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.type_of_contract.message}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Logo <span className="required">*</span>
                            </label>
                            <div className="file-upload-wrapper">
                                <input
                                    type="file"
                                    id="logo"
                                    className="file-input"
                                    accept="image/*"
                                    {...register("logo")}
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
                            {profileData?.logo && !fileName && (
                                <a
                                    href={`${API_BASE_URL}/${profileData.logo}`}
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

            {/* Location Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon info">
                        <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <div className="section-title-wrapper">
                        <h3 className="section-title">Location</h3>
                        <p className="section-description">Address and location details</p>
                    </div>
                </div>

                <div className="form-content">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                Province <span className="required">*</span>
                            </label>
                            <div className="select-wrapper">
                                <select
                                    className={`form-select ${errors.province ? 'is-invalid' : ''}`}
                                    {...register("province")}
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
                                City <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-city"></i>
                                </div>
                                <input
                                    type="text"
                                    className={`form-input ${errors.city ? 'is-invalid' : ''}`}
                                    placeholder="Enter city"
                                    {...register("city")}
                                />
                            </div>
                            {errors.city && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.city.message}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                Address <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-map-marker-alt"></i>
                                </div>
                                <input
                                    type="text"
                                    className={`form-input ${errors.address ? 'is-invalid' : ''}`}
                                    placeholder="Enter address"
                                    {...register("address")}
                                />
                            </div>
                            {errors.address && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.address.message}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Postal Code <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-mail-bulk"></i>
                                </div>
                                <input
                                    type="text"
                                    className={`form-input ${errors.postal_code ? 'is-invalid' : ''}`}
                                    placeholder="A1A 1A1"
                                    {...register("postal_code")}
                                />
                            </div>
                            {errors.postal_code && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.postal_code.message}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label className="form-label">
                            Parking <span className="required">*</span>
                        </label>
                        <div className="checkbox-grid">
                            {parkingOptions.map((option, index) => (
                                <div
                                    key={index}
                                    className={`checkbox-card ${selectedParking.includes(option.value) ? 'selected' : ''}`}
                                    onClick={() => handleCheckboxChange("parking", option.value)}
                                >
                                    <div className="checkbox-indicator">
                                        {selectedParking.includes(option.value) && <i className="fas fa-check"></i>}
                                    </div>
                                    <div className="checkbox-icon">
                                        <i className={`fas ${option.icon}`}></i>
                                    </div>
                                    <span className="checkbox-label">{option.label}</span>
                                </div>
                            ))}
                        </div>
                        {errors.parking && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-circle"></i>
                                {errors.parking.message}
                            </div>
                        )}
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
                        <p className="section-description">Languages, software, and services offered</p>
                    </div>
                </div>

                <div className="form-content">
                    <div className="form-group full-width">
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

                    <div className="form-group full-width">
                        <label className="form-label">Software</label>
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
                            Services <span className="required">*</span>
                        </label>
                        <div className="checkbox-grid">
                            {servicesOptions.map((option, index) => (
                                <div
                                    key={index}
                                    className={`checkbox-card ${selectedServices.includes(option.value) ? 'selected' : ''}`}
                                    onClick={() => handleCheckboxChange("services", option.value)}
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
                        {errors.services && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-circle"></i>
                                {errors.services.message}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Equipment Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon warning">
                        <i className="fas fa-x-ray"></i>
                    </div>
                    <div className="section-title-wrapper">
                        <h3 className="section-title">Equipment</h3>
                        <p className="section-description">Dental equipment and systems used</p>
                    </div>
                </div>

                <div className="form-content">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                Odontogram System <span className="required">*</span>
                            </label>
                            <div className="checkbox-grid">
                                {odontogramOptions.map((option, index) => (
                                    <div
                                        key={index}
                                        className={`checkbox-card ${selectedOdontogram.includes(option.value) ? 'selected' : ''}`}
                                        onClick={() => handleCheckboxChange("odontogram_system", option.value)}
                                    >
                                        <div className="checkbox-indicator">
                                            {selectedOdontogram.includes(option.value) && <i className="fas fa-check"></i>}
                                        </div>
                                        <div className="checkbox-icon">
                                            <i className={`fas ${option.icon}`}></i>
                                        </div>
                                        <span className="checkbox-label">{option.label}</span>
                                    </div>
                                ))}
                            </div>
                            {errors.odontogram_system && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.odontogram_system.message}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Type of Ultrasound <span className="required">*</span>
                            </label>
                            <div className="checkbox-grid compact">
                                {ultrasoundOptions.map((option, index) => (
                                    <div
                                        key={index}
                                        className={`checkbox-card compact ${selectedUltrasound.includes(option.value) ? 'selected' : ''}`}
                                        onClick={() => handleCheckboxChange("type_of_ultrasound", option.value)}
                                    >
                                        <div className="checkbox-indicator small">
                                            {selectedUltrasound.includes(option.value) && <i className="fas fa-check"></i>}
                                        </div>
                                        <span className="checkbox-label">{option.label}</span>
                                    </div>
                                ))}
                            </div>
                            {errors.type_of_ultrasound && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.type_of_ultrasound.message}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label className="form-label">
                            Type of Radiography <span className="required">*</span>
                        </label>
                        <div className="checkbox-grid compact">
                            {radiographyOptions.map((option, index) => (
                                <div
                                    key={index}
                                    className={`checkbox-card compact ${selectedRadiography.includes(option.value) ? 'selected' : ''}`}
                                    onClick={() => handleCheckboxChange("type_of_radiography", option.value)}
                                >
                                    <div className="checkbox-indicator small">
                                        {selectedRadiography.includes(option.value) && <i className="fas fa-check"></i>}
                                    </div>
                                    <span className="checkbox-label">{option.label}</span>
                                </div>
                            ))}
                        </div>
                        {errors.type_of_radiography && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-circle"></i>
                                {errors.type_of_radiography.message}
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
                        <p className="section-description">Patient traffic and staff information</p>
                    </div>
                </div>

                <div className="form-content">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Weekday Traffic (patients/day)</label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-users"></i>
                                </div>
                                <input
                                    type="number"
                                    className={`form-input ${errors.weekday_traffic_patients_per_day ? 'is-invalid' : ''}`}
                                    placeholder="Enter number"
                                    {...register("weekday_traffic_patients_per_day", { valueAsNumber: true })}
                                />
                            </div>
                            {errors.weekday_traffic_patients_per_day && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.weekday_traffic_patients_per_day.message}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Weekend Traffic (prescriptions/day)</label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-file-prescription"></i>
                                </div>
                                <input
                                    type="number"
                                    className={`form-input ${errors.weekend_traffic_prescriptions_per_day ? 'is-invalid' : ''}`}
                                    placeholder="Enter number"
                                    {...register("weekend_traffic_prescriptions_per_day", { valueAsNumber: true })}
                                />
                            </div>
                            {errors.weekend_traffic_prescriptions_per_day && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.weekend_traffic_prescriptions_per_day.message}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                Number of Current Dentists <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-user-md"></i>
                                </div>
                                <input
                                    type="number"
                                    className={`form-input ${errors.number_of_current_dentists ? 'is-invalid' : ''}`}
                                    placeholder="Enter number"
                                    {...register("number_of_current_dentists", { valueAsNumber: true })}
                                />
                            </div>
                            {errors.number_of_current_dentists && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.number_of_current_dentists.message}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Number of Current Dental Hygienists <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <i className="fas fa-user-nurse"></i>
                                </div>
                                <input
                                    type="number"
                                    className={`form-input ${errors.number_of_current_dental_hygienists ? 'is-invalid' : ''}`}
                                    placeholder="Enter number"
                                    {...register("number_of_current_dental_hygienists", { valueAsNumber: true })}
                                />
                            </div>
                            {errors.number_of_current_dental_hygienists && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.number_of_current_dental_hygienists.message}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Fees Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon danger">
                        <i className="fas fa-dollar-sign"></i>
                    </div>
                    <div className="section-title-wrapper">
                        <h3 className="section-title">Fees (Optional)</h3>
                        <p className="section-description">Fee structure and compensation details</p>
                    </div>
                </div>

                <div className="form-content">
                    <div className="form-group full-width">
                        <div
                            className={`checkbox-card ${feesEnabled ? 'selected' : ''}`}
                            onClick={() => setValue("fees", !feesEnabled)}
                            style={{ maxWidth: '300px' }}
                        >
                            <div className="checkbox-indicator">
                                {feesEnabled && <i className="fas fa-check"></i>}
                            </div>
                            <span className="checkbox-label">Enable additional fees</span>
                        </div>
                    </div>

                    {feesEnabled && (
                        <div className="form-row three-col">
                            <div className="form-group">
                                <label className="form-label">Maximum Travel Fee ($)</label>
                                <div className="input-wrapper">
                                    <div className="input-icon">
                                        <i className="fas fa-dollar-sign"></i>
                                    </div>
                                    <input
                                        type="number"
                                        className={`form-input ${errors.maximum_travel_fee ? 'is-invalid' : ''}`}
                                        placeholder="0.00"
                                        {...register("maximum_travel_fee", { valueAsNumber: true })}
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
                                <label className="form-label">Per Diem Fee/Day ($)</label>
                                <div className="input-wrapper">
                                    <div className="input-icon">
                                        <i className="fas fa-dollar-sign"></i>
                                    </div>
                                    <input
                                        type="number"
                                        className={`form-input ${errors.per_diem_fee_per_day ? 'is-invalid' : ''}`}
                                        placeholder="0.00"
                                        {...register("per_diem_fee_per_day", { valueAsNumber: true })}
                                    />
                                </div>
                                {errors.per_diem_fee_per_day && (
                                    <div className="error-message">
                                        <i className="fas fa-exclamation-circle"></i>
                                        {errors.per_diem_fee_per_day.message}
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Accommodation Fee/Night ($)</label>
                                <div className="input-wrapper">
                                    <div className="input-icon">
                                        <i className="fas fa-dollar-sign"></i>
                                    </div>
                                    <input
                                        type="number"
                                        className={`form-input ${errors.accommodation_fee_per_night ? 'is-invalid' : ''}`}
                                        placeholder="0.00"
                                        {...register("accommodation_fee_per_night", { valueAsNumber: true })}
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
                    )}
                </div>
            </div>

            {/* Additional Information Section */}
            <div className="form-section">
                <div className="section-header">
                    <div className="section-icon primary">
                        <i className="fas fa-info-circle"></i>
                    </div>
                    <div className="section-title-wrapper">
                        <h3 className="section-title">Additional Information</h3>
                        <p className="section-description">Any extra details visible before contract confirmation</p>
                    </div>
                </div>

                <div className="form-content">
                    <div className="form-group full-width">
                        <label className="form-label">
                            Additional Information <span className="required">*</span>
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

                .form-input:hover { border-color: var(--gray-300); }
                .form-input:focus {
                    outline: none;
                    border-color: var(--primary);
                    background: white;
                    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
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
                .form-select.is-invalid { border-color: var(--danger); }

                .select-icon {
                    position: absolute;
                    right: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--gray-400);
                    pointer-events: none;
                }

                .checkbox-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
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
                }
            `}</style>
        </form>
    );
}

export default DentalForm;
