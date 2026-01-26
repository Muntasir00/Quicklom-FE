import React, { useState, useEffect } from "react";
import { fetchGeoapifySuggestions } from "../api/geopify";
import { getUserProfileService } from "@services/institute/ProfileService";

const PermanentStaffingDentalForm = ({ ContractFormHook }) => {
    const {
        register,
        handleSubmit,
        onSubmit,
        errors,
        contract,
        formId,
        API_BASE_URL,
        positionRows,
        handleAddRow,
        handleRemoveRow,
        watch,
        professionalCategories,
        positions,
        setValue,
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

    // Set default professional category to "Dental" or "Dentistry"
    useEffect(() => {
        if (professionalCategories && professionalCategories.length > 0 && positionRows.length > 0) {
            const dentalCategory = professionalCategories.find(
                cat => cat.name === "Dental" || cat.name === "Dentistry" || cat.name === "Dental Care" || cat.name.toLowerCase().includes("dent")
            );
            if (dentalCategory && positionRows[0]) {
                setValue(`position_soughts.0.professional_category_id`, dentalCategory.id);
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

    return (
        <form id={formId} onSubmit={handleSubmit(
            (data) => {
                console.log("=== PERMANENT DENTAL FORM SUBMISSION ===");
                console.log("Form data:", data);
                return onSubmit(data);
            },
            (errors) => {
                console.log("=== PERMANENT DENTAL VALIDATION ERRORS ===");
                console.log("Validation errors:", errors);
                console.log("Error fields:", Object.keys(errors));
                Object.keys(errors).forEach(field => {
                    console.log(`${field}:`, errors[field].message);
                });
                console.log("============================");
            }
        )}>
            {/* Facility Location Card */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-dark text-white">
                    <h5 className="mb-0"><i className="fas fa-map-marker-alt mr-2"></i>Facility Location</h5>
                </div>
                <div className="card-body">
                    {isClinicOrPharmacy && (
                        <div className="alert alert-info mb-3">
                            <i className="fas fa-info-circle mr-2"></i>
                            <strong>Address loaded from your profile.</strong> To modify this address, please update your <a href={`/${sessionStorage.getItem('role')}/profile/${sessionStorage.getItem('user_id')}/edit`} className="alert-link">institute profile</a>.
                        </div>
                    )}

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
                                    <i className="fas fa-star mr-2"></i>Required Experience Level <span className="text-danger">*</span>
                                </label>
                                <select
                                    {...register("required_experience")}
                                    className={`form-control ${errors?.required_experience ? 'is-invalid' : ''}`}
                                >
                                    <option value="">Select Experience Level</option>
                                    <option value="Less than 1 year">Less than 1 year</option>
                                    <option value="1–3 years">1–3 years</option>
                                    <option value="3–5 years">3–5 years</option>
                                    <option value="5–10 years">5–10 years</option>
                                    <option value="More than 10 years">More than 10 years</option>
                                    <option value="No preference">No preference</option>
                                </select>
                                {errors?.required_experience && (
                                    <small className="text-danger d-block mt-1">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.required_experience.message}
                                    </small>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-clock mr-2"></i>Working Shifts <span className="text-danger">*</span>
                                </label>
                                <select
                                    {...register("working_shifts")}
                                    className={`form-control ${errors?.working_shifts ? 'is-invalid' : ''}`}
                                    multiple
                                    size="4"
                                >
                                    <option value="Day">Day</option>
                                    <option value="Evening">Evening</option>
                                    <option value="Night">Night</option>
                                    <option value="Weekend">Weekend</option>
                                </select>
                                {errors?.working_shifts && (
                                    <small className="text-danger d-block mt-1">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.working_shifts.message}
                                    </small>
                                )}
                                <small className="form-text text-muted">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</small>
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
                                    {...register("job_description")}
                                    className={`form-control ${errors?.job_description ? 'is-invalid' : ''}`}
                                    rows="5"
                                    placeholder="Enter detailed job description"
                                ></textarea>
                                {errors?.job_description && (
                                    <small className="text-danger d-block mt-1">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.job_description.message}
                                    </small>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compensation & Benefits Card */}
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
                                        type="text"
                                        className={`form-control ${errors?.annual_salary ? 'is-invalid' : ''}`}
                                        placeholder="e.g., 120000"
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
                                <select
                                    {...register("benefits")}
                                    className={`form-control ${errors?.benefits ? 'is-invalid' : ''}`}
                                    multiple
                                    size="2"
                                >
                                    <option value="In-kind">In-kind</option>
                                    <option value="Monetary">Monetary</option>
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
                                    <i className="fas fa-trophy mr-2"></i>Additional Bonus / Incentives
                                </label>
                                <select
                                    {...register("additional_bonus")}
                                    className={`form-control ${errors?.additional_bonus ? 'is-invalid' : ''}`}
                                >
                                    <option value="">Select Option</option>
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>
                                {errors?.additional_bonus && (
                                    <small className="text-danger d-block mt-1">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.additional_bonus.message}
                                    </small>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-exclamation-triangle mr-2"></i>Urgent Need
                                </label>
                                <div className="custom-control custom-checkbox mt-2">
                                    <input
                                        {...register("urgent_need")}
                                        type="checkbox"
                                        className="custom-control-input"
                                        id="urgentNeed"
                                    />
                                    <label className="custom-control-label" htmlFor="urgentNeed">
                                        This is an urgent need
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attachments Card */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-dark text-white">
                    <h5 className="mb-0"><i className="fas fa-paperclip mr-2"></i>Attachments</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-file-upload mr-2"></i>Attachments
                                </label>
                                <input
                                    {...register("attachments")}
                                    type="file"
                                    className={`form-control-file ${errors?.attachments ? 'is-invalid' : ''}`}
                                    accept=".pdf,.jpg,.png"
                                />
                                {errors?.attachments && (
                                    <small className="text-danger d-block mt-1">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.attachments.message}
                                    </small>
                                )}
                                <small className="form-text text-muted mt-1">
                                    {contract && contract?.data?.attachments && (
                                        <a href={`${API_BASE_URL}/${contract?.data?.attachments}`} target="_blank" rel="noopener noreferrer" className="text-primary font-weight-semibold">
                                            <i className="fas fa-download mr-1"></i>Download existing file
                                        </a>
                                    )}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Position Sought Card - Same as GeneralDentistry */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-dark text-white">
                    <h5 className="mb-0"><i className="fas fa-user-md mr-2"></i>Position Sought</h5>
                </div>
                <div className="card-body">
                    {positionRows?.length > 0 &&
                      positionRows.map((row, index) => {
                        const selectedCategoryId = watch(`position_soughts.${index}.professional_category_id`);
                        const selectedPositions = watch(`position_soughts.${index}.position_ids`, []);
                        const specialistDentistPosition = positions?.find(p => p.name === "Specialist Dentist");
                        const showSpecialistRole =
                          specialistDentistPosition &&
                          Array.isArray(selectedPositions) &&
                          selectedPositions.length > 0 &&
                          selectedPositions.some(posId => Number(posId) === Number(specialistDentistPosition.id));
                        const categoryPositionsForRow = (positions ?? []).filter(
                          item => Number(item.professional_category_id) === Number(selectedCategoryId)
                        );

                        // Clear specialist_dentist_role when Specialist Dentist is not selected
                        React.useEffect(() => {
                          if (!showSpecialistRole) {
                            setValue(`position_soughts.${index}.specialist_dentist_role`, "");
                          }
                        }, [showSpecialistRole]);

                        return (
                          <div key={row.id} className="border rounded p-3 mb-3 bg-light">
                            <div className="row">
                              <div className="col-md-6">
                                <div className="form-group">
                                  <label className="control-label font-weight-bold">
                                    <i className="fas fa-briefcase mr-2"></i>Professional Category <span className="text-danger">*</span>
                                  </label>
                                  <select
                                    className={`form-control ${errors?.position_soughts?.[index]?.professional_category_id ? 'is-invalid' : ''}`}
                                    {...register(`position_soughts.${index}.professional_category_id`)}
                                    disabled
                                  >
                                    <option value="">--select--</option>
                                    {Array.isArray(professionalCategories) && professionalCategories.length > 0 ? (
                                      professionalCategories.map(category => (
                                        <option key={category.id} value={category.id}>
                                          {category.name}
                                        </option>
                                      ))
                                    ) : (
                                      <option disabled>No categories available</option>
                                    )}
                                  </select>
                                  {errors?.position_soughts?.[index]?.professional_category_id && (
                                    <div className="invalid-feedback d-block">
                                      {errors.position_soughts[index].professional_category_id.message}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="col-md-6">
                                <div className="form-group">
                                  <label className="control-label font-weight-bold">
                                    <i className="fas fa-teeth mr-2"></i>Position Sought <span className="text-danger">*</span>
                                  </label>
                                  <div className="border rounded p-2 bg-white" style={{minHeight: "140px", maxHeight: "200px", overflowY: "auto"}}>
                                    {Array.isArray(categoryPositionsForRow) && categoryPositionsForRow.length > 0 ? (
                                      categoryPositionsForRow.map(position => (
                                        <div key={position.id} className="custom-control custom-radio mb-2">
                                            <input
                                                type="radio"
                                                className="custom-control-input"
                                                id={`position-${index}-${position.id}`}
                                                value={position.id}
                                                name={`position_soughts_${index}_position_ids`}
                                                checked={selectedPositions?.includes(String(position.id)) || selectedPositions?.includes(Number(position.id))}
                                                onChange={(e) => {
                                                    // Set the new position with validation trigger
                                                    setValue(`position_soughts.${index}.position_ids`, [e.target.value], { shouldValidate: true });

                                                    // Clear specialist_dentist_role if the new selection is not Specialist Dentist
                                                    const isSpecialistDentist = specialistDentistPosition &&
                                                                               Number(e.target.value) === Number(specialistDentistPosition.id);
                                                    if (!isSpecialistDentist) {
                                                        setValue(`position_soughts.${index}.specialist_dentist_role`, "");
                                                    }
                                                }}
                                            />
                                            <label className="custom-control-label" htmlFor={`position-${index}-${position.id}`}>
                                                <i className="fas fa-user-md text-info mr-2"></i>{position.name}
                                            </label>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-muted text-center py-3">
                                          <i className="fas fa-info-circle mr-2"></i>No positions available
                                      </div>
                                    )}
                                  </div>
                                  {errors?.position_soughts?.[index]?.position_ids && (
                                    <small className="text-danger d-block mt-1">
                                      <i className="fas fa-exclamation-circle mr-1"></i>
                                      {errors.position_soughts[index].position_ids.message}
                                    </small>
                                  )}
                                </div>
                              </div>

                              {showSpecialistRole && (
                                <div className="col-md-12">
                                  <div className="alert alert-info" role="alert">
                                    <i className="fas fa-user-md mr-2"></i><strong>Specialist Dentist Selected</strong> - Please specify the role:
                                  </div>
                                  <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                      <i className="fas fa-stethoscope mr-2"></i>Specialist Dentist Role <span className="text-danger">*</span>
                                    </label>
                                    <select
                                      className={`form-control custom-select ${errors?.position_soughts?.[index]?.specialist_dentist_role ? 'is-invalid' : ''}`}
                                      {...register(`position_soughts.${index}.specialist_dentist_role`)}
                                      style={{height: "45px"}}
                                    >
                                      <option value="">Choose Specialty...</option>
                                      <option value="orthodontist">🦷 Orthodontist - Braces & Alignment</option>
                                      <option value="endodontist">🦷 Endodontist - Root Canals</option>
                                      <option value="periodontist">🦷 Periodontist - Gums & Supporting Structures</option>
                                      <option value="pediatric dentist">👶 Pediatric Dentist - Children's Dental Care</option>
                                      <option value="prosthodontist">🦷 Prosthodontist - Prosthetics & Restoration</option>
                                      <option value="oral and maxillofacial surgeon">⚕️ Oral & Maxillofacial Surgeon - Surgery</option>
                                    </select>
                                    {errors?.position_soughts?.[index]?.specialist_dentist_role && (
                                      <div className="invalid-feedback d-block">
                                        {errors.position_soughts[index].specialist_dentist_role.message}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                </div>
            </div>
        </form>
    );
}

export default PermanentStaffingDentalForm;