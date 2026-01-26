import React, { useState, useEffect } from "react";
import { fetchGeoapifySuggestions } from "../api/geopify";
import { getUserProfileService } from "@services/institute/ProfileService";

const NursingPermanentForm = ({ ContractFormHook }) => {
    const {
        register,
        handleSubmit,
        onSubmit,
        errors,
        setValue,
        setError,
        reset,
        contract,
        API_BASE_URL,
        FORM_ID,
        positionRows,
        handleAddRow,
        handleRemoveRow,
        watch,
        professionalCategories,
        positions,
    } = ContractFormHook();

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

    // Set default professional category to "Nursing and Home Care"
    useEffect(() => {
        if (professionalCategories && professionalCategories.length > 0 && positionRows.length > 0) {
            const nursingCategory = professionalCategories.find(cat => cat.name === "Nursing and Home Care");
            if (nursingCategory && positionRows[0]) {
                setValue(`position_soughts.0.professional_category_id`, nursingCategory.id);
            }
        }
    }, [professionalCategories, positionRows, setValue]);

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
      setValue("country", props.country || "");

      setSearchQuery("");
      setShowDropdown(false);
    };

    const handleManualEntryToggle = () => {
      setManualEntry(!manualEntry);
      if (!manualEntry) {
        setSearchQuery("");
        setSuggestions([]);
        setShowDropdown(false);
      }
    };

    // Get nursing positions for the dropdown
    const nursingCategory = professionalCategories?.find(cat => cat.name === "Nursing and Home Care");
    const nursingPositions = nursingCategory
        ? positions?.filter(pos => Number(pos.professional_category_id) === Number(nursingCategory.id))
        : [];

    return (
        <form id={FORM_ID ?? ""} onSubmit={handleSubmit(onSubmit)}>
            {/* Facility Location Card */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-dark text-white">
                    <h5 className="mb-0"><i className="fas fa-map-marker-alt mr-2"></i>Facility Location</h5>
                </div>
                <div className="card-body">
                    {/* Show info message for Clinics/Pharmacies */}
                    {isClinicOrPharmacy && (
                        <div className="alert alert-info mb-3">
                            <i className="fas fa-info-circle mr-2"></i>
                            <strong>Address loaded from your profile.</strong> To modify this address, please update your <a href={`/${sessionStorage.getItem('role')}/profile/${sessionStorage.getItem('user_id')}/edit`} className="alert-link">institute profile</a>.
                        </div>
                    )}

                    {/* Only show toggle and search for non-Clinic/Pharmacy users */}
                    {!isClinicOrPharmacy && (
                        <>
                            <div className="row mb-3">
                                <div className="col-12">
                                    <div className="custom-control custom-switch">
                                        <input
                                            type="checkbox"
                                            className="custom-control-input"
                                            id="manualEntryToggle"
                                            checked={manualEntry}
                                            onChange={handleManualEntryToggle}
                                        />
                                        <label className="custom-control-label" htmlFor="manualEntryToggle">
                                            <i className="fas fa-keyboard mr-2"></i>Enter Address Manually
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {!manualEntry ? (
                                <div className="row">
                                    <div className="col-12">
                                        <div className="form-group position-relative">
                                            <label className="control-label font-weight-bold">
                                                <i className="fas fa-search mr-2"></i>Search Facility Location <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Type facility name or address..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                            {showDropdown && suggestions.length > 0 && (
                                                <ul className="list-group position-absolute w-100" style={{zIndex: 1000, maxHeight: "300px", overflowY: "auto"}}>
                                                    {suggestions.map((item, idx) => (
                                                        <li
                                                            key={idx}
                                                            className="list-group-item list-group-item-action"
                                                            style={{cursor: "pointer"}}
                                                            onClick={() => handleSelectSuggestion(item)}
                                                        >
                                                            <i className="fas fa-map-pin text-primary mr-2"></i>
                                                            <strong>{item.properties.name || item.properties.address_line1}</strong>
                                                            <br />
                                                            <small className="text-muted">{item.properties.formatted}</small>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </>
                    )}

                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-building mr-2"></i>Facility Name <span className="text-danger">*</span>
                                </label>
                                <input
                                    {...register("facility_name")}
                                    type="text"
                                    className={`form-control ${errors?.facility_name ? 'is-invalid' : ''} ${isClinicOrPharmacy ? 'bg-light' : ''}`}
                                    placeholder="Enter facility name"
                                    readOnly={isClinicOrPharmacy || !manualEntry}
                                />
                                {errors?.facility_name && (
                                    <small className="text-danger d-block mt-1">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.facility_name.message}
                                    </small>
                                )}
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-road mr-2"></i>Street Address
                                </label>
                                <input
                                    {...register("street_address")}
                                    type="text"
                                    className={`form-control ${errors?.street_address ? 'is-invalid' : ''} ${isClinicOrPharmacy ? 'bg-light' : ''}`}
                                    placeholder="Enter street address"
                                    readOnly={isClinicOrPharmacy || !manualEntry}
                                />
                                {errors?.street_address && (
                                    <small className="text-danger d-block mt-1">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.street_address.message}
                                    </small>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-4">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-city mr-2"></i>City <span className="text-danger">*</span>
                                </label>
                                <input
                                    {...register("city")}
                                    type="text"
                                    className={`form-control ${errors?.city ? 'is-invalid' : ''} ${isClinicOrPharmacy ? 'bg-light' : ''}`}
                                    placeholder="Enter city"
                                    readOnly={isClinicOrPharmacy || !manualEntry}
                                />
                                {errors?.city && (
                                    <small className="text-danger d-block mt-1">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.city.message}
                                    </small>
                                )}
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-map mr-2"></i>Province <span className="text-danger">*</span>
                                </label>
                                <input
                                    {...register("province")}
                                    type="text"
                                    className={`form-control ${errors?.province ? 'is-invalid' : ''} ${isClinicOrPharmacy ? 'bg-light' : ''}`}
                                    placeholder="Enter province"
                                    readOnly={isClinicOrPharmacy || !manualEntry}
                                />
                                {errors?.province && (
                                    <small className="text-danger d-block mt-1">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.province.message}
                                    </small>
                                )}
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-mail-bulk mr-2"></i>Postal Code
                                </label>
                                <input
                                    {...register("postal_code")}
                                    type="text"
                                    className={`form-control ${errors?.postal_code ? 'is-invalid' : ''} ${isClinicOrPharmacy ? 'bg-light' : ''}`}
                                    placeholder="Enter postal code"
                                    readOnly={isClinicOrPharmacy || !manualEntry}
                                />
                                {errors?.postal_code && (
                                    <small className="text-danger d-block mt-1">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.postal_code.message}
                                    </small>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-globe mr-2"></i>Country
                                </label>
                                <input
                                    {...register("country")}
                                    type="text"
                                    className={`form-control ${errors?.country ? 'is-invalid' : ''} ${isClinicOrPharmacy ? 'bg-light' : ''}`}
                                    placeholder="Enter country"
                                    readOnly={isClinicOrPharmacy || !manualEntry}
                                />
                                {errors?.country && (
                                    <small className="text-danger d-block mt-1">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.country.message}
                                    </small>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contract Details Card */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-dark text-white">
                    <h5 className="mb-0"><i className="fas fa-file-contract mr-2"></i>Contract Details</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-calendar-week mr-2"></i>Weekly Schedule <span className="text-danger">*</span>
                                </label>
                                <select {...register("weekly_schedule")} className={`form-control ${errors?.weekly_schedule ? 'is-invalid' : ''}`}>
                                    <option value="">Select Schedule</option>
                                    <option value="Full-time (40 hours)">Full-time (40 hours)</option>
                                    <option value="Part-time (20-30 hours)">Part-time (20-30 hours)</option>
                                    <option value="Flexible">Flexible</option>
                                </select>
                                {errors?.weekly_schedule && (
                                    <small className="text-danger d-block mt-1">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.weekly_schedule.message}
                                    </small>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-calendar-check mr-2"></i>Start Date <span className="text-danger">*</span>
                                </label>
                                <input
                                    {...register("start_date")}
                                    type="date"
                                    className={`form-control ${errors?.start_date ? 'is-invalid' : ''}`}
                                />
                                {errors?.start_date && (
                                    <small className="text-danger d-block mt-1">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.start_date.message}
                                    </small>
                                )}
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-calendar-times mr-2"></i>End Date
                                </label>
                                <input
                                    {...register("end_date")}
                                    type="date"
                                    className={`form-control ${errors?.end_date ? 'is-invalid' : ''}`}
                                />
                                {errors?.end_date && (
                                    <small className="text-danger d-block mt-1">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.end_date.message}
                                    </small>
                                )}
                                <small className="form-text text-muted">Optional - Leave empty for permanent position</small>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-hospital mr-2"></i>Required Domain <span className="text-danger">*</span>
                                </label>
                                <select {...register("required_domain")} className={`form-control ${errors?.required_domain ? 'is-invalid' : ''}`} multiple>
                                    <option value="Hospital Care">Hospital Care</option>
                                    <option value="Geriatrics">Geriatrics</option>
                                    <option value="Home Care">Home Care</option>
                                    <option value="Pediatrics">Pediatrics</option>
                                    <option value="Psychiatry">Psychiatry</option>
                                    <option value="Emergency">Emergency</option>
                                    <option value="Operating Room">Operating Room</option>
                                </select>
                                {errors?.required_domain && (
                                    <small className="text-danger d-block mt-1">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.required_domain.message}
                                    </small>
                                )}
                                <small className="form-text text-muted">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</small>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-laptop-medical mr-2"></i>Software Skills <span className="text-danger">*</span>
                                </label>
                                <select {...register("software_skills")} className={`form-control ${errors?.software_skills ? 'is-invalid' : ''}`} multiple>
                                    <option value="EMR">EMR</option>
                                    <option value="Cristal-Net">Cristal-Net</option>
                                    <option value="OACIS">OACIS</option>
                                    <option value="ACTIV">ACTIV</option>
                                    <option value="Logibec">Logibec</option>
                                    <option value="Soins Santé">Soins Santé</option>
                                    <option value="iSoft">iSoft</option>
                                </select>
                                {errors?.software_skills && (
                                    <small className="text-danger d-block mt-1">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.software_skills.message}
                                    </small>
                                )}
                                <small className="form-text text-muted">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</small>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-star mr-2"></i>Minimum Experience <span className="text-danger">*</span>
                                </label>
                                <select {...register("minimum_experience")} className={`form-control ${errors?.minimum_experience ? 'is-invalid' : ''}`}>
                                    <option value="">Select Experience</option>
                                    <option value="0-1 years">0-1 years</option>
                                    <option value="1-3 years">1-3 years</option>
                                    <option value="3-5 years">3-5 years</option>
                                    <option value="5+ years">5+ years</option>
                                </select>
                                {errors?.minimum_experience && (
                                    <small className="text-danger d-block mt-1">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.minimum_experience.message}
                                    </small>
                                )}
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-language mr-2"></i>Languages <span className="text-danger">*</span>
                                </label>
                                <select {...register("languages")} className={`form-control ${errors?.languages ? 'is-invalid' : ''}`} multiple>
                                    <option value="English">English</option>
                                    <option value="French">French</option>
                                    <option value="Spanish">Spanish</option>
                                    <option value="Arabic">Arabic</option>
                                    <option value="Mandarin">Mandarin</option>
                                </select>
                                {errors?.languages && (
                                    <small className="text-danger d-block mt-1">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.languages.message}
                                    </small>
                                )}
                                <small className="form-text text-muted">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compensation Card */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-dark text-white">
                    <h5 className="mb-0"><i className="fas fa-money-bill-wave mr-2"></i>Compensation & Benefits</h5>
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
                                        step="0.01"
                                        className={`form-control ${errors?.annual_salary ? 'is-invalid' : ''}`}
                                        placeholder="e.g., 75000"
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
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-gift mr-2"></i>Benefits <span className="text-danger">*</span>
                                </label>
                                <select {...register("benefits")} className={`form-control ${errors?.benefits ? 'is-invalid' : ''}`} multiple size="6">
                                    <option value="Health Insurance">Health Insurance</option>
                                    <option value="Dental Insurance">Dental Insurance</option>
                                    <option value="Vision Insurance">Vision Insurance</option>
                                    <option value="Group Insurance">Group Insurance</option>
                                    <option value="Pension Plan">Pension Plan</option>
                                    <option value="Paid Vacation">Paid Vacation</option>
                                    <option value="Continuing Education">Continuing Education</option>
                                </select>
                                {errors?.benefits && (
                                    <small className="text-danger d-block mt-1">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.benefits.message}
                                    </small>
                                )}
                                <small className="form-text text-muted">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</small>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-plane mr-2"></i>Travel / Accommodation Costs
                                </label>
                                <select {...register("travel_costs")} className={`form-control ${errors?.travel_costs ? 'is-invalid' : ''}`}>
                                    <option value="">Select Option</option>
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>
                                {errors?.travel_costs && (
                                    <small className="text-danger d-block mt-1">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.travel_costs.message}
                                    </small>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-file-alt mr-2"></i>Detailed Job Description <span className="text-danger">*</span>
                                </label>
                                <textarea
                                    {...register("detailed_job_description")}
                                    className={`form-control ${errors?.detailed_job_description ? 'is-invalid' : ''}`}
                                    rows="5"
                                    placeholder="Provide a detailed description of the job responsibilities, duties, and expectations for this nursing position..."
                                ></textarea>
                                {errors?.detailed_job_description && (
                                    <small className="text-danger d-block mt-1">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.detailed_job_description.message}
                                    </small>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* License & Compliance Card */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-dark text-white">
                    <h5 className="mb-0"><i className="fas fa-check-circle mr-2"></i>License & Compliance</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-id-card mr-2"></i>Required License
                                </label>
                                <div className="custom-control custom-checkbox">
                                    <input
                                        {...register("required_license")}
                                        type="checkbox"
                                        className="custom-control-input"
                                        id="requiredLicense"
                                    />
                                    <label className="custom-control-label" htmlFor="requiredLicense">
                                        License Required
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-shield-alt mr-2"></i>Compliance
                                </label>
                                <div className="custom-control custom-checkbox">
                                    <input
                                        {...register("compliance.vaccination")}
                                        type="checkbox"
                                        className="custom-control-input"
                                        id="vaccination"
                                    />
                                    <label className="custom-control-label" htmlFor="vaccination">
                                        Vaccination
                                    </label>
                                </div>
                                <div className="custom-control custom-checkbox">
                                    <input
                                        {...register("compliance.criminal_record")}
                                        type="checkbox"
                                        className="custom-control-input"
                                        id="criminalRecord"
                                    />
                                    <label className="custom-control-label" htmlFor="criminalRecord">
                                        Criminal Record
                                    </label>
                                </div>
                                <div className="custom-control custom-checkbox">
                                    <input
                                        {...register("compliance.mandatory_training")}
                                        type="checkbox"
                                        className="custom-control-input"
                                        id="mandatoryTraining"
                                    />
                                    <label className="custom-control-label" htmlFor="mandatoryTraining">
                                        Mandatory Training
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Position Sought Card */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-dark text-white">
                    <h5 className="mb-0"><i className="fas fa-user-nurse mr-2"></i>Position Sought</h5>
                </div>
                <div className="card-body">
                    <div className="border rounded p-3 bg-light">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                        <i className="fas fa-briefcase mr-2"></i>Professional Category <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value="Nursing and Home Care"
                                        disabled
                                        readOnly
                                    />
                                    <input
                                        type="hidden"
                                        {...register("position_soughts.0.professional_category_id")}
                                    />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                        <i className="fas fa-user-md mr-2"></i>Position Sought <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        {...register("position_soughts.0.position_id")}
                                        className={`form-control ${errors?.position_soughts?.[0]?.position_id ? 'is-invalid' : ''}`}
                                    >
                                        <option value="">Select Position</option>
                                        {nursingPositions && nursingPositions.length > 0 ? (
                                            nursingPositions.map(position => (
                                                <option key={position.id} value={position.id}>
                                                    {position.name}
                                                </option>
                                            ))
                                        ) : (
                                            <option disabled>No positions available</option>
                                        )}
                                    </select>
                                    {errors?.position_soughts?.[0]?.position_id && (
                                        <small className="text-danger d-block mt-1">
                                            <i className="fas fa-exclamation-circle mr-1"></i>
                                            {errors.position_soughts[0].position_id.message}
                                        </small>
                                    )}
                                    <small className="form-text text-muted">
                                        Select one position for this contract
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default NursingPermanentForm;