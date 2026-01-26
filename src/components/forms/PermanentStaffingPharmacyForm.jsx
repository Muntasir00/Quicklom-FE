import React, { useState, useEffect } from "react";
import { fetchGeoapifySuggestions } from "../api/geopify";
import { getUserProfileService } from "@services/institute/ProfileService";

const PermanentStaffingPharmacyForm = ({ ContractFormHook }) => {
    const {
        register,
        handleSubmit,
        onSubmit,
        onError,
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

    // Set default professional category to "Pharmacy"
    useEffect(() => {
        if (professionalCategories && professionalCategories.length > 0 && positionRows.length > 0) {
            const pharmacyCategory = professionalCategories.find(
                cat => cat.name === "Pharmacy" || cat.name.toLowerCase().includes("pharm")
            );
            if (pharmacyCategory && positionRows[0]) {
                setValue(`position_soughts.0.professional_category_id`, pharmacyCategory.id);
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
      setValue("country", props.country || "Canada");

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

    const handleInputChange = (e) => {
      setSearchQuery(e.target.value);
    };

    return (
        <form id={formId ?? ""} onSubmit={handleSubmit(onSubmit, onError)}>
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0"><i className="fas fa-map-marker-alt mr-2"></i>Pharmacy Location</h5>
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
                        <div className="d-flex justify-content-end mb-3">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={handleManualEntryToggle}
                            >
                              <i className={`fas ${manualEntry ? 'fa-search' : 'fa-keyboard'} mr-1`}></i>
                              {manualEntry ? "Use Address Search" : "Enter Manually"}
                            </button>
                        </div>
                    )}

                    {!isClinicOrPharmacy && !manualEntry ? (
                      <>
                        <div className="form-group">
                            <label className="control-label font-weight-bold">
                              <i className="fas fa-search mr-2"></i>Search Address <span className="text-danger">*</span>
                            </label>
                            <div className="position-relative">
                                <input
                                  type="text"
                                  className="form-control form-control-lg"
                                  placeholder="Type pharmacy name or address (e.g., PharmaChoice, Toronto)"
                                  value={searchQuery}
                                  onChange={handleInputChange}
                                  autoComplete="off"
                                />
                                {searchQuery && (
                                  <span className="position-absolute" style={{right: '10px', top: '50%', transform: 'translateY(-50%)'}}>
                                    <i className="fas fa-spinner fa-spin text-muted"></i>
                                  </span>
                                )}
                            </div>

                            {showDropdown && suggestions.length > 0 && (
                              <div className="mt-2 shadow-lg rounded border-0" style={{maxHeight: "400px", overflowY: "auto", position: "relative", zIndex: 1000}}>
                                {suggestions.map((item, idx) => (
                                  <div
                                    key={item.properties.place_id}
                                    className="px-4 py-3 border-bottom suggestion-item"
                                    onClick={() => handleSelectSuggestion(item)}
                                    style={{
                                      cursor: "pointer",
                                      backgroundColor: "white",
                                      transition: "all 0.2s ease"
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = "#f8f9fa";
                                      e.currentTarget.style.borderLeftColor = "#007bff";
                                      e.currentTarget.style.borderLeftWidth = "4px";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = "white";
                                      e.currentTarget.style.borderLeftWidth = "0px";
                                    }}
                                  >
                                    <div className="d-flex align-items-start">
                                      <div className="mr-3 mt-1">
                                        <i className="fas fa-map-marker-alt text-primary" style={{fontSize: "20px"}}></i>
                                      </div>
                                      <div className="flex-grow-1">
                                        {item.properties.name && (
                                          <div className="font-weight-bold text-dark mb-1" style={{fontSize: "15px"}}>
                                            <i className="fas fa-building text-primary mr-2" style={{fontSize: "14px"}}></i>
                                            {item.properties.name}
                                          </div>
                                        )}
                                        <div className="text-muted" style={{fontSize: "13px"}}>
                                          {item.properties.formatted}
                                        </div>
                                        {(item.properties.city || item.properties.state) && (
                                          <div className="mt-1">
                                            <span className="badge badge-light text-secondary" style={{fontSize: "11px"}}>
                                              <i className="fas fa-city mr-1"></i>
                                              {item.properties.city}
                                              {item.properties.state && `, ${item.properties.state}`}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                      <div className="ml-2">
                                        <i className="fas fa-chevron-right text-muted" style={{fontSize: "12px"}}></i>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {searchQuery.length >= 3 && !showDropdown && suggestions.length === 0 && (
                              <div className="alert alert-warning mt-3" role="alert">
                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                <strong>No results found</strong> for "{searchQuery}"
                                <button
                                  type="button"
                                  className="btn btn-sm btn-warning ml-3"
                                  onClick={handleManualEntryToggle}
                                >
                                  <i className="fas fa-keyboard mr-1"></i>Enter Manually
                                </button>
                              </div>
                            )}
                        </div>

                        <hr className="my-4"/>
                        <h6 className="text-muted mb-3"><i className="fas fa-info-circle mr-2"></i>Auto-filled Details</h6>

                        <div className="form-group">
                            <label className="control-label font-weight-semibold">
                              <i className="fas fa-clinic-medical mr-2"></i>Facility/Pharmacy Name <span className="text-danger">*</span>
                            </label>
                            <input
                              {...register("facility_name")}
                              type="text"
                              className={`form-control ${isClinicOrPharmacy ? 'bg-light' : ''} ${errors?.facility_name ? 'is-invalid' : ''}`}
                              placeholder="Will be filled from search"
                              readOnly={isClinicOrPharmacy || !manualEntry}
                            />
                            {errors?.facility_name && (
                              <div className="invalid-feedback">{errors.facility_name.message}</div>
                            )}
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-semibold">
                                      <i className="fas fa-road mr-2"></i>Street Address
                                    </label>
                                    <input
                                      {...register("street_address")}
                                      type="text"
                                      className={`form-control ${isClinicOrPharmacy ? 'bg-light' : ''}`}
                                      placeholder="Will be filled from search"
                                      readOnly={isClinicOrPharmacy || !manualEntry}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-semibold">
                                      <i className="fas fa-city mr-2"></i>City <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      {...register("city")}
                                      type="text"
                                      className={`form-control ${isClinicOrPharmacy ? 'bg-light' : ''} ${errors?.city ? 'is-invalid' : ''}`}
                                      placeholder="Will be filled from search"
                                      readOnly={isClinicOrPharmacy || !manualEntry}
                                    />
                                    {errors?.city && (
                                      <div className="invalid-feedback">{errors.city.message}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label className="control-label font-weight-semibold">
                                      <i className="fas fa-flag mr-2"></i>Province <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      {...register("province")}
                                      type="text"
                                      className={`form-control ${isClinicOrPharmacy ? 'bg-light' : ''} ${errors?.province ? 'is-invalid' : ''}`}
                                      placeholder="Will be filled from search"
                                      readOnly={isClinicOrPharmacy || !manualEntry}
                                    />
                                    {errors?.province && (
                                      <div className="invalid-feedback">{errors.province.message}</div>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label className="control-label font-weight-semibold">
                                      <i className="fas fa-mailbox mr-2"></i>Postal Code
                                    </label>
                                    <input
                                      {...register("postal_code")}
                                      type="text"
                                      className={`form-control ${isClinicOrPharmacy ? 'bg-light' : ''}`}
                                      placeholder="Will be filled from search"
                                      readOnly={isClinicOrPharmacy || !manualEntry}
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label className="control-label font-weight-semibold">
                                      <i className="fas fa-globe-americas mr-2"></i>Country
                                    </label>
                                    <input
                                      {...register("country")}
                                      type="text"
                                      className={`form-control ${isClinicOrPharmacy ? 'bg-light' : ''}`}
                                      value="Canada"
                                      readOnly={isClinicOrPharmacy || !manualEntry}
                                    />
                                </div>
                            </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="form-group">
                            <label className="control-label font-weight-bold">
                              <i className="fas fa-clinic-medical mr-2"></i>Facility/Pharmacy Name <span className="text-danger">*</span>
                            </label>
                            <input
                              {...register("facility_name")}
                              type="text"
                              className={`form-control ${isClinicOrPharmacy ? 'bg-light' : ''} ${errors?.facility_name ? 'is-invalid' : ''}`}
                              placeholder="Enter pharmacy or facility name"
                              readOnly={isClinicOrPharmacy || !manualEntry}
                            />
                            {errors?.facility_name && (
                              <div className="invalid-feedback">{errors.facility_name.message}</div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="control-label font-weight-semibold">
                              <i className="fas fa-road mr-2"></i>Street Address
                            </label>
                            <input
                              {...register("street_address")}
                              type="text"
                              className={`form-control ${isClinicOrPharmacy ? 'bg-light' : ''}`}
                              placeholder="123 Main Street"
                              readOnly={isClinicOrPharmacy || !manualEntry}
                            />
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                      <i className="fas fa-city mr-2"></i>City <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      {...register("city")}
                                      type="text"
                                      className={`form-control ${isClinicOrPharmacy ? 'bg-light' : ''} ${errors?.city ? 'is-invalid' : ''}`}
                                      placeholder="Toronto"
                                      readOnly={isClinicOrPharmacy || !manualEntry}
                                    />
                                    {errors?.city && (
                                      <div className="invalid-feedback">{errors.city.message}</div>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                      <i className="fas fa-flag mr-2"></i>Province <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      {...register("province")}
                                      type="text"
                                      className={`form-control ${isClinicOrPharmacy ? 'bg-light' : ''} ${errors?.province ? 'is-invalid' : ''}`}
                                      placeholder="Ontario"
                                      readOnly={isClinicOrPharmacy || !manualEntry}
                                    />
                                    {errors?.province && (
                                      <div className="invalid-feedback">{errors.province.message}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-semibold">
                                      <i className="fas fa-mailbox mr-2"></i>Postal Code
                                    </label>
                                    <input
                                      {...register("postal_code")}
                                      type="text"
                                      className={`form-control ${isClinicOrPharmacy ? 'bg-light' : ''}`}
                                      placeholder="M5H 2N2"
                                      readOnly={isClinicOrPharmacy || !manualEntry}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-semibold">
                                      <i className="fas fa-globe-americas mr-2"></i>Country
                                    </label>
                                    <input
                                      {...register("country")}
                                      type="text"
                                      className={`form-control ${isClinicOrPharmacy ? 'bg-light' : ''}`}
                                      defaultValue="Canada"
                                      readOnly={isClinicOrPharmacy || !manualEntry}
                                    />
                                </div>
                            </div>
                        </div>
                      </>
                    )}
                </div>
            </div>

            {/* Contract Details Card */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-primary text-white">
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
                                    <div className="invalid-feedback">{errors.start_date.message}</div>
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
                                    <div className="invalid-feedback">{errors.required_experience.message}</div>
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
                                    {...register("job_description")}
                                    className={`form-control ${errors?.job_description ? 'is-invalid' : ''}`}
                                    rows="5"
                                    placeholder="Enter detailed job description"
                                ></textarea>
                                {errors?.job_description && (
                                    <div className="invalid-feedback">{errors.job_description.message}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Compensation & Benefits Card */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-primary text-white">
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
                                        placeholder="e.g., 85000"
                                    />
                                    {errors?.annual_salary && (
                                        <div className="invalid-feedback">{errors.annual_salary.message}</div>
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
                                    <i className="fas fa-gift mr-2"></i>Benefits
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
                                    <div className="invalid-feedback">{errors.benefits.message}</div>
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
                                    <div className="invalid-feedback">{errors.additional_bonus.message}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-dollar-sign mr-2"></i>Fees (CAD $)
                                </label>
                                <input
                                    {...register("fees")}
                                    type="text"
                                    className={`form-control ${errors?.fees ? 'is-invalid' : ''}`}
                                    placeholder="Enter fees in CAD"
                                />
                                {errors?.fees && (
                                    <div className="invalid-feedback">{errors.fees.message}</div>
                                )}
                            </div>
                        </div>
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
                <div className="card-header bg-primary text-white">
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
                                    <div className="invalid-feedback d-block">{errors.attachments.message}</div>
                                )}
                                <small className="form-text text-muted mt-1">
                                    {contract && contract?.attachments && (
                                        <a href={`${API_BASE_URL ?? ""}/${contract?.attachments}`} target="_blank" rel="noopener noreferrer" className="text-primary font-weight-semibold">
                                            <i className="fas fa-download mr-1"></i>Download existing file
                                        </a>
                                    )}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Position Sought Card */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0"><i className="fas fa-user-md mr-2"></i>Position Sought</h5>
                </div>
                <div className="card-body">
                    {positionRows?.length > 0 &&
                      positionRows.slice(0, 1).map((row, index) => {
                        const selectedCategoryId = watch(`position_soughts.${index}.professional_category_id`);
                        const selectedPositions = watch(`position_soughts.${index}.position_ids`, []);
                        const currentProvince = watch("province");

                        // Get positions for the selected category
                        const categoryPositionsForRow = (positions ?? []).filter(
                          item => Number(item.professional_category_id) === Number(selectedCategoryId)
                        );

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
                                    <i className="fas fa-pills mr-2"></i>Position Sought <span className="text-danger">*</span>
                                  </label>
                                  <div className="border rounded p-2 bg-white" style={{minHeight: "140px", maxHeight: "200px", overflowY: "auto"}}>
                                    {(() => {
                                      // Get province from form
                                      const provinceValue = currentProvince || watch("province");

                                      // Determine which positions to show
                                      let positionsToShow = [];

                                      if (provinceValue) {
                                        // Province is set - apply filtering
                                        if (provinceValue === "Quebec") {
                                          positionsToShow = categoryPositionsForRow.filter(position =>
                                            ["Pharmacy Technician (ATP)", "Pharmacist", "Pharmacy Clerk"].includes(position.name)
                                          );
                                        } else {
                                          positionsToShow = categoryPositionsForRow.filter(position =>
                                            ["Assistant", "Pharmacist", "Pharmacy Clerk", "Technician"].includes(position.name)
                                          );
                                        }
                                      } else {
                                        // No province at all - show warning
                                        positionsToShow = [];
                                      }

                                      // No positions available
                                      if (positionsToShow.length === 0) {
                                        return (
                                          <div className="alert alert-warning mb-0 py-2 text-center" role="alert">
                                            <i className="fas fa-exclamation-triangle mr-2"></i>
                                            <strong>{!provinceValue ? "Please select a province first" : `No positions available for ${provinceValue}`}</strong>
                                          </div>
                                        );
                                      }

                                      // Show positions
                                      return positionsToShow.map(position => (
                                        <div key={position.id} className="custom-control custom-radio mb-2">
                                          <input
                                            type="radio"
                                            className="custom-control-input"
                                            id={`position-${index}-${position.id}`}
                                            value={position.id}
                                            name={`position_soughts_${index}_position_ids`}
                                            checked={selectedPositions?.includes(String(position.id)) || selectedPositions?.includes(Number(position.id))}
                                            onChange={(e) => {
                                              setValue(`position_soughts.${index}.position_ids`, [e.target.value]);
                                            }}
                                          />
                                          <label className="custom-control-label" htmlFor={`position-${index}-${position.id}`}>
                                            <i className="fas fa-user-md text-info mr-2"></i>{position.name}
                                          </label>
                                        </div>
                                      ));
                                    })()}
                                  </div>
                                  {errors?.position_soughts?.[index]?.position_ids && (
                                    <small className="text-danger d-block mt-1">
                                      <i className="fas fa-exclamation-circle mr-1"></i>
                                      {errors.position_soughts[index].position_ids.message}
                                    </small>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                </div>
            </div>
        </form>
    );
}

export default PermanentStaffingPharmacyForm;