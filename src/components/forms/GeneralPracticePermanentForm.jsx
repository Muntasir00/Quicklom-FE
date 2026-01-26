import React, { useState, useEffect } from "react";
import { fetchGeoapifySuggestions } from "../api/geopify";
import { getUserProfileService } from "@services/institute/ProfileService";

const GeneralPracticePermanentForm = ({ ContractFormHook }) => {
    const {
        register,
        handleSubmit,
        onSubmit,
        errors,
        contract,
        FORM_ID,
        API_BASE_URL,
        positionRows,
        handleAddRow,
        handleRemoveRow,
        watch,
        professionalCategories,
        positions,
        setValue,
    } = ContractFormHook();

    // Address API states
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [manualEntry, setManualEntry] = useState(false);
    const [isClinicOrPharmacy, setIsClinicOrPharmacy] = useState(false);
    const [addressPreFilled, setAddressPreFilled] = useState(false);

    // Fetch user profile and pre-fill address for Clinics (1) and Pharmacies (2)
    useEffect(() => {
        const fetchProfileAndPrefillAddress = async () => {
            // Only pre-fill on create (not edit)
            if (contract?.id) return;

            try {
                const profileResponse = await getUserProfileService();
                const profileData = profileResponse?.data?.data;

                if (profileData) {
                    const categoryId = String(profileData.institute_category_id);

                    // Only pre-fill for Clinics (1) and Pharmacies (2)
                    if (categoryId === "1" || categoryId === "2") {
                        setIsClinicOrPharmacy(true);

                        // Pre-fill address fields from profile
                        if (profileData.name_of_facility) {
                            setValue("facility_name", profileData.name_of_facility);
                        }
                        if (profileData.full_address) {
                            setValue("street_address", profileData.full_address);
                        }
                        if (profileData.city) {
                            setValue("city", profileData.city);
                        }
                        if (profileData.province) {
                            setValue("province", profileData.province);
                        }
                        if (profileData.postal_code) {
                            setValue("postal_code", profileData.postal_code);
                        }
                        setValue("country", "Canada");

                        setAddressPreFilled(true);
                        setManualEntry(true); // Show manual entry fields since they're pre-filled
                    }
                }
            } catch (error) {
                console.error("Error fetching profile for address pre-fill:", error);
            }
        };

        fetchProfileAndPrefillAddress();
    }, [contract, setValue]);

    // Fetch address suggestions from Geoapify
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!searchQuery || searchQuery.length < 3) {
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
    }, [searchQuery]);

    // Handle address selection from suggestions - EXACT SAME AS DENTISTRY FORM
    const handleSelectSuggestion = (item) => {
        const props = item.properties;
        const facilityName = props.name || props.address_line1 || "";
        if (facilityName) {
            setValue("facility_name", facilityName);
        }
        setValue("street_address", props.street || props.address_line2 || "");
        setValue("city", props.city || "");
        setValue("province", props.state || props.county || "");
        setValue("postal_code", props.postcode || "");
        setValue("country", props.country || "Canada");
        setValue("contract_location", props.formatted || "");
        setSearchQuery("");
        setShowDropdown(false);
        setManualEntry(false);
    };

    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleManualEntryToggle = () => {
        setManualEntry(!manualEntry);
        setShowDropdown(false);
        setSearchQuery("");
        if (!manualEntry) {
            setValue("facility_name", "");
            setValue("street_address", "");
            setValue("city", "");
            setValue("province", "");
            setValue("postal_code", "");
            setValue("contract_location", "");
        }
    };

    // Auto-set General Medicine category and Family Physician position on mount
    useEffect(() => {
        if (professionalCategories?.length > 0 && positions?.length > 0) {
            const generalMedicine = professionalCategories.find((c) =>
                c.name === "General Medicine" || c.name === "General Practice"
            );

            if (generalMedicine) {
                setValue(`position_soughts.0.professional_category_id`, generalMedicine.id.toString());

                // Find Family Physician position
                const familyPhysician = positions.find(p =>
                    p.professional_category_id === generalMedicine.id &&
                    (p.name === "Family Physician" || p.name === "General Practitioner" ||
                     p.name === "Family Physician / General Practitioner")
                );

                if (familyPhysician) {
                    setValue(`position_soughts.0.position_ids`, [familyPhysician.id.toString()]);
                }
            }
        }
    }, [professionalCategories, positions, setValue]);

    // Load address data when editing
    useEffect(() => {
        if (contract?.facility_name) {
            setSearchQuery(contract.facility_name);
        }
    }, [contract]);


    return (
        <>
            <style>{`
                .custom-select {
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='4' height='5' viewBox='0 0 4 5'%3e%3cpath fill='%23343a40' d='M2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e");
                    background-repeat: no-repeat;
                    background-position: right 0.75rem center;
                    background-size: 8px 10px;
                }

                .custom-control-input:checked ~ .custom-control-label::before {
                    background-color: #007bff;
                    border-color: #007bff;
                }

                .custom-control-label {
                    cursor: pointer;
                    user-select: none;
                }

                .custom-control-label:hover {
                    color: #007bff;
                }

                .card {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                .card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
                }

                .form-control:focus, .custom-select:focus {
                    border-color: #80bdff;
                    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
                }

                .suggestion-item {
                    border-left: 0px solid transparent;
                }

                .suggestion-item:hover {
                    background-color: #f8f9fa;
                    border-left: 3px solid #007bff;
                    cursor: pointer;
                }
            `}</style>

            <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)}>
                {/* Location Information Card */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-primary text-white">
                        <h5 className="mb-0"><i className="fas fa-map-marker-alt mr-2"></i>Location Information</h5>
                    </div>
                    <div className="card-body">
                        {/* Show info message for Clinics/Pharmacies */}
                        {isClinicOrPharmacy && (
                            <div className="alert alert-info mb-3">
                                <i className="fas fa-info-circle mr-2"></i>
                                <strong>Address loaded from your profile.</strong> To modify this address, please update your <a href={`/${sessionStorage.getItem('role')}/profile/${sessionStorage.getItem('user_id')}/edit`} className="alert-link">institute profile</a>.
                            </div>
                        )}

                        {!isClinicOrPharmacy && (
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="form-group position-relative">
                                        <label className="control-label font-weight-bold">
                                            <i className="fas fa-hospital mr-2"></i>Search for Facility / Location <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Start typing to search..."
                                            value={searchQuery}
                                            onChange={handleInputChange}
                                            disabled={manualEntry}
                                            style={{height: "45px"}}
                                        />
                                    {showDropdown && suggestions.length > 0 && (
                                        <div className="list-group position-absolute w-100" style={{zIndex: 1000, maxHeight: "300px", overflowY: "auto"}}>
                                            {suggestions.map((item, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    className="list-group-item list-group-item-action suggestion-item"
                                                    onClick={() => handleSelectSuggestion(item)}
                                                >
                                                    <div className="d-flex align-items-start">
                                                        <i className="fas fa-map-pin mt-1 mr-2 text-primary"></i>
                                                        <div>
                                                            <div className="font-weight-bold">{item.properties.name || item.properties.address_line1}</div>
                                                            <small className="text-muted">{item.properties.formatted}</small>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <small className="form-text text-muted">
                                        Type to search for a facility or location. Or{" "}
                                        <a href="#" onClick={(e) => { e.preventDefault(); handleManualEntryToggle(); }} className="font-weight-bold">
                                            {manualEntry ? "use search" : "enter manually"}
                                        </a>
                                    </small>
                                </div>
                            </div>
                        </div>
                        )}

                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                        <i className="fas fa-hospital mr-2"></i>Facility Name <span className="text-danger">*</span>
                                    </label>
                                    <input {...register("facility_name")} type="text" className={`form-control ${isClinicOrPharmacy ? 'bg-light' : ''} ${errors?.facility_name ? 'is-invalid' : ''}`} placeholder="Enter facility name" disabled={isClinicOrPharmacy || !manualEntry} style={{height: "45px"}} />
                                    {errors?.facility_name && (
                                        <div className="invalid-feedback">
                                            <i className="fas fa-exclamation-circle mr-1"></i>
                                            {errors.facility_name.message}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                        <i className="fas fa-road mr-2"></i>Street Address
                                    </label>
                                    <input {...register("street_address")} type="text" className={`form-control ${isClinicOrPharmacy ? 'bg-light' : ''}`} placeholder="Enter street address" disabled={isClinicOrPharmacy || !manualEntry} style={{height: "45px"}} />
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                        <i className="fas fa-city mr-2"></i>City <span className="text-danger">*</span>
                                    </label>
                                    <input {...register("city")} type="text" className={`form-control ${isClinicOrPharmacy ? 'bg-light' : ''} ${errors?.city ? 'is-invalid' : ''}`} placeholder="Enter city" disabled={isClinicOrPharmacy || !manualEntry} style={{height: "45px"}} />
                                    {errors?.city && (
                                        <div className="invalid-feedback">
                                            <i className="fas fa-exclamation-circle mr-1"></i>
                                            {errors.city.message}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                        <i className="fas fa-flag mr-2"></i>Province <span className="text-danger">*</span>
                                    </label>
                                    <input {...register("province")} type="text" className={`form-control ${isClinicOrPharmacy ? 'bg-light' : ''} ${errors?.province ? 'is-invalid' : ''}`} placeholder="Enter province" disabled={isClinicOrPharmacy || !manualEntry} style={{height: "45px"}} />
                                    {errors?.province && (
                                        <div className="invalid-feedback">
                                            <i className="fas fa-exclamation-circle mr-1"></i>
                                            {errors.province.message}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                        <i className="fas fa-mail-bulk mr-2"></i>Postal Code
                                    </label>
                                    <input {...register("postal_code")} type="text" className={`form-control ${isClinicOrPharmacy ? 'bg-light' : ''}`} placeholder="Enter postal code" disabled={isClinicOrPharmacy || !manualEntry} style={{height: "45px"}} />
                                </div>
                            </div>
                        </div>

                        <input type="hidden" {...register("contract_location")} />
                        <input type="hidden" {...register("country")} />
                    </div>
                </div>

                {/* Contract Duration Card */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-info text-white">
                        <h5 className="mb-0"><i className="fas fa-calendar-alt mr-2"></i>Contract Duration</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                        <i className="fas fa-calendar-check mr-2"></i>Start Date <span className="text-danger">*</span>
                                    </label>
                                    <input {...register("start_date")} type="date" className={`form-control ${errors?.start_date ? 'is-invalid' : ''}`} style={{height: "45px"}} />
                                    {errors?.start_date && (
                                        <div className="invalid-feedback">
                                            <i className="fas fa-exclamation-circle mr-1"></i>
                                            {errors.start_date.message}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                        <i className="fas fa-calendar-times mr-2"></i>End Date (if applicable)
                                    </label>
                                    <input {...register("end_date")} type="date" className="form-control" style={{height: "45px"}} />
                                    <small className="form-text text-muted">Leave blank if permanent position</small>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                        <i className="fas fa-clock mr-2"></i>Weekly Schedule <span className="text-danger">*</span>
                                    </label>
                                    <textarea {...register("weekly_schedule")} className={`form-control ${errors?.weekly_schedule ? 'is-invalid' : ''}`} rows="3" placeholder="e.g., Monday-Friday 9 AM - 5 PM"></textarea>
                                    {errors?.weekly_schedule && (
                                        <div className="invalid-feedback">
                                            <i className="fas fa-exclamation-circle mr-1"></i>
                                            {errors.weekly_schedule.message}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Required Skills & Experience Card */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-warning text-dark">
                        <h5 className="mb-0"><i className="fas fa-star mr-2"></i>Required Skills & Experience</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                        <i className="fas fa-tools mr-2"></i>Required Skills <span className="text-danger">*</span>
                                    </label>
                                    <select {...register("required_skills")} className={`form-control ${errors?.required_skills ? 'is-invalid' : ''}`} multiple size="5">
                                        <option value="Primary Care">Primary Care</option>
                                        <option value="Preventive Medicine">Preventive Medicine</option>
                                        <option value="Chronic Disease Management">Chronic Disease Management</option>
                                        <option value="Acute Care">Acute Care</option>
                                        <option value="Patient Education">Patient Education</option>
                                        <option value="Diagnostic Skills">Diagnostic Skills</option>
                                    </select>
                                    <small className="form-text text-muted">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</small>
                                    {errors?.required_skills && (
                                        <div className="invalid-feedback">
                                            <i className="fas fa-exclamation-circle mr-1"></i>
                                            {errors.required_skills.message}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                        <i className="fas fa-laptop-medical mr-2"></i>Software Skills <span className="text-danger">*</span>
                                    </label>
                                    <select {...register("software_skills")} className={`form-control ${errors?.software_skills ? 'is-invalid' : ''}`} multiple size="5">
                                        <option value="EMR Systems">EMR Systems</option>
                                        <option value="Medical Billing Software">Medical Billing Software</option>
                                        <option value="E-Prescribing">E-Prescribing</option>
                                        <option value="Telemedicine Platforms">Telemedicine Platforms</option>
                                        <option value="Lab Integration">Lab Integration</option>
                                    </select>
                                    <small className="form-text text-muted">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</small>
                                    {errors?.software_skills && (
                                        <div className="invalid-feedback">
                                            <i className="fas fa-exclamation-circle mr-1"></i>
                                            {errors.software_skills.message}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                        <i className="fas fa-graduation-cap mr-2"></i>Minimum Experience <span className="text-danger">*</span>
                                    </label>
                                    <select {...register("minimum_experience")} className={`form-control custom-select ${errors?.minimum_experience ? 'is-invalid' : ''}`} style={{height: "45px"}}>
                                        <option value="">Select Experience Level</option>
                                        <option value="Entry Level">Entry Level</option>
                                        <option value="1-2 years">1-2 years</option>
                                        <option value="3-5 years">3-5 years</option>
                                        <option value="5+ years">5+ years</option>
                                    </select>
                                    {errors?.minimum_experience && (
                                        <div className="invalid-feedback">
                                            <i className="fas fa-exclamation-circle mr-1"></i>
                                            {errors.minimum_experience.message}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                        <i className="fas fa-language mr-2"></i>Languages Required <span className="text-danger">*</span>
                                    </label>
                                    <select {...register("languages")} className={`form-control ${errors?.languages ? 'is-invalid' : ''}`} multiple size="4">
                                        <option value="English">English</option>
                                        <option value="French">French</option>
                                        <option value="Spanish">Spanish</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <small className="form-text text-muted">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</small>
                                    {errors?.languages && (
                                        <div className="invalid-feedback">
                                            <i className="fas fa-exclamation-circle mr-1"></i>
                                            {errors.languages.message}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Compensation & Benefits Card */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-success text-white">
                        <h5 className="mb-0"><i className="fas fa-dollar-sign mr-2"></i>Compensation & Benefits</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                        <i className="fas fa-money-bill-wave mr-2"></i>Gross Annual Salary <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text">CAD $</span>
                                        </div>
                                        <input
                                            {...register("annual_salary")}
                                            type="number"
                                            className={`form-control ${errors?.annual_salary ? 'is-invalid' : ''}`}
                                            placeholder="e.g., 150000"
                                        />
                                        {errors?.annual_salary && (
                                            <div className="invalid-feedback">
                                                <i className="fas fa-exclamation-circle mr-1"></i>
                                                {errors.annual_salary.message}
                                            </div>
                                        )}
                                    </div>
                                    <small className="form-text text-info">
                                        <i className="fas fa-info-circle mr-1"></i>
                                        Enter the gross annual salary for this permanent position.
                                    </small>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                        <i className="fas fa-gifts mr-2"></i>Benefits <span className="text-danger">*</span>
                                    </label>
                                    <select {...register("benefits")} className={`form-control ${errors?.benefits ? 'is-invalid' : ''}`} multiple size="4">
                                        <option value="Insurance">Insurance</option>
                                        <option value="Retirement">Retirement</option>
                                        <option value="Leave">Leave</option>
                                        <option value="Continuing Education">Continuing Education</option>
                                    </select>
                                    <small className="form-text text-muted">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</small>
                                    {errors?.benefits && (
                                        <div className="invalid-feedback">
                                            <i className="fas fa-exclamation-circle mr-1"></i>
                                            {errors.benefits.message}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                        <i className="fas fa-car mr-2"></i>Travel / Accommodation Costs
                                    </label>
                                    <select {...register("travel_costs")} className="form-control custom-select" style={{height: "45px"}}>
                                        <option value="">Select Option</option>
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Compliance & Licensing Card */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-danger text-white">
                        <h5 className="mb-0"><i className="fas fa-shield-alt mr-2"></i>Compliance & Licensing</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="custom-control custom-checkbox mb-3">
                                    <input {...register("required_license")} type="checkbox" className="custom-control-input" id="requiredLicense" />
                                    <label className="custom-control-label font-weight-bold" htmlFor="requiredLicense">
                                        <i className="fas fa-id-card mr-2"></i>Provincial Medical License Required
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <label className="control-label font-weight-bold mb-2">
                                    <i className="fas fa-clipboard-check mr-2"></i>Additional Compliance Requirements
                                </label>
                                <div className="custom-control custom-checkbox mb-2">
                                    <input {...register("compliance.vaccination")} type="checkbox" className="custom-control-input" id="vaccination" />
                                    <label className="custom-control-label" htmlFor="vaccination">
                                        Vaccination Records Required
                                    </label>
                                </div>
                                <div className="custom-control custom-checkbox mb-2">
                                    <input {...register("compliance.criminal_record")} type="checkbox" className="custom-control-input" id="criminalRecord" />
                                    <label className="custom-control-label" htmlFor="criminalRecord">
                                        Criminal Background Check Required
                                    </label>
                                </div>
                                <div className="custom-control custom-checkbox mb-2">
                                    <input {...register("compliance.confidentiality")} type="checkbox" className="custom-control-input" id="confidentiality" />
                                    <label className="custom-control-label" htmlFor="confidentiality">
                                        LPRPDE Confidentiality Agreement Required
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Position Sought Card - Auto-filled, Hidden */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-dark text-white">
                        <h5 className="mb-0"><i className="fas fa-user-md mr-2"></i>Position Information</h5>
                    </div>
                    <div className="card-body bg-light">
                        {positionRows?.length > 0 && positionRows.map((row, index) => (
                            <div key={row.id} className="row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="control-label font-weight-bold">
                                            <i className="fas fa-briefcase mr-2"></i>Professional Category
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control bg-white"
                                            value="General Medicine"
                                            readOnly
                                            disabled
                                            style={{height: "45px"}}
                                        />
                                        <input type="hidden" {...register(`position_soughts.${index}.professional_category_id`)} />
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="control-label font-weight-bold">
                                            <i className="fas fa-user-md mr-2"></i>Position Sought
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control bg-white"
                                            value="Family Physician / General Practitioner"
                                            readOnly
                                            disabled
                                            style={{height: "45px"}}
                                        />
                                        <input type="hidden" {...register(`position_soughts.${index}.position_ids`)} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="alert alert-info mb-0">
                            <i className="fas fa-info-circle mr-2"></i>
                            <strong>Note:</strong> This contract is specifically for General Medicine - Family Physician / General Practitioner positions.
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}

export default GeneralPracticePermanentForm;