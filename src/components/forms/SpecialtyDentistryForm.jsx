import React, { useState, useEffect } from "react";
import { fetchGeoapifySuggestions } from "../api/geopify";
import { getUserProfileService } from "@services/institute/ProfileService";

const SpecialtyDentistryForm = ({ ContractFormHook }) => {
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

    const CANADA_HOLIDAYS = [
        "2025-01-01", "2025-04-18", "2025-04-21", "2025-05-19", "2025-06-24",
        "2025-07-01", "2025-08-04", "2025-09-01", "2025-09-30", "2025-10-13",
        "2025-11-11", "2025-12-25", "2025-12-26", "2026-01-01", "2026-04-03",
        "2026-04-06", "2026-05-18", "2026-06-24", "2026-07-01", "2026-08-03",
        "2026-09-07", "2026-09-30", "2026-10-12", "2026-11-11", "2026-12-25", "2026-12-26",
    ];

    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [manualEntry, setManualEntry] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(new Date());
    const [selectedDates, setSelectedDates] = useState([]);
    const [datesInitialized, setDatesInitialized] = useState(false);
    const [durationMode, setDurationMode] = useState("global");
    const [dateDurations, setDateDurations] = useState({});
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

    // Debug: Monitor form errors
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.log("🔴 FORM VALIDATION ERRORS DETECTED:");
            console.log(errors);
        }
    }, [errors]);

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
        if (contract && contract.data?.selected_dates && !datesInitialized) {
            try {
                const dates = typeof contract.data.selected_dates === 'string'
                    ? JSON.parse(contract.data.selected_dates)
                    : contract.data.selected_dates;

                if (Array.isArray(dates) && dates.length > 0) {
                    setSelectedDates(dates);
                    setDatesInitialized(true);
                }
            } catch (error) {
                console.error("Error parsing selected dates:", error);
            }
        }
    }, [contract, datesInitialized]);

    useEffect(() => {
        if (contract && contract.data) {
            if (contract.data.duration_mode) {
                setDurationMode(contract.data.duration_mode);
                setValue("duration_mode", contract.data.duration_mode);
            }

            if (contract.data.date_durations) {
                try {
                    const durations = typeof contract.data.date_durations === 'string'
                        ? JSON.parse(contract.data.date_durations)
                        : contract.data.date_durations;
                    setDateDurations(durations);
                } catch (error) {
                    console.error("Error parsing date durations:", error);
                }
            }
        }
    }, [contract, setValue]);

    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === "compensation_mode") {
                setValue("hourly_rate", "", { shouldValidate: false });
                setValue("contract_value", "", { shouldValidate: false });
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, setValue]);

    useEffect(() => {
        if (durationMode === "per_date" && Object.keys(dateDurations).length > 0) {
            setValue("date_durations", JSON.stringify(dateDurations), { shouldValidate: true });
        } else {
            setValue("date_durations", "", { shouldValidate: false });
        }
        setValue("duration_mode", durationMode);
    }, [dateDurations, durationMode, setValue]);

    const formatDateLocal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDateDisplay = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const groupConsecutiveDates = (dates) => {
        if (dates.length === 0) return [];
        const sorted = [...dates].sort();
        const groups = [];
        let currentGroup = [sorted[0]];

        for (let i = 1; i < sorted.length; i++) {
            const prevDate = new Date(sorted[i - 1]);
            const currDate = new Date(sorted[i]);
            const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);

            if (diffDays === 1) {
                currentGroup.push(sorted[i]);
            } else {
                groups.push(currentGroup);
                currentGroup = [sorted[i]];
            }
        }
        groups.push(currentGroup);
        return groups;
    };

    const handleDateDurationChange = (date, field, value) => {
        setDateDurations(prev => ({
            ...prev,
            [date]: {
                ...prev[date],
                [field]: value
            }
        }));
    };

    const handleDurationModeChange = (mode) => {
        setDurationMode(mode);
        if (mode === "global") {
            setDateDurations({});
        } else if (mode === "per_date") {
            const initialDurations = {};
            selectedDates.forEach(date => {
                if (!dateDurations[date]) {
                    initialDurations[date] = {
                        start_hour: watch("estimated_duration.start_hour") || "",
                        end_hour: watch("estimated_duration.end_hour") || ""
                    };
                } else {
                    initialDurations[date] = dateDurations[date];
                }
            });
            setDateDurations(initialDurations);
        }
    };

    useEffect(() => {
        if (selectedDates.length > 0) {
            const sortedDates = [...selectedDates].sort();
            setValue("start_date", sortedDates[0], { shouldValidate: true, shouldDirty: true });
            setValue("end_date", sortedDates[sortedDates.length - 1], { shouldValidate: true, shouldDirty: true });
            setValue("selected_dates", JSON.stringify(sortedDates), { shouldValidate: false, shouldDirty: true });
        } else {
            setValue("start_date", "", { shouldValidate: false });
            setValue("end_date", "", { shouldValidate: false });
            setValue("selected_dates", "", { shouldValidate: false });
        }
    }, [selectedDates, setValue]);

    const handleDateClick = (dateStr) => {
        setSelectedDates(prev => {
            if (prev.includes(dateStr)) {
                return prev.filter(d => d !== dateStr);
            } else {
                return [...prev, dateStr];
            }
        });
    };

    const handleClearAllDates = () => {
        setSelectedDates([]);
        setValue("selected_dates", "");
    };

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
            } catch (error) {
                console.error("Error fetching suggestions:", error);
                setSuggestions([]);
                setShowDropdown(false);
            }
        };

        const debounce = setTimeout(() => {
            if (!manualEntry) {
                fetchSuggestions();
            }
        }, 300);

        return () => clearTimeout(debounce);
    }, [searchQuery, manualEntry]);

    const handleSuggestionClick = (suggestion) => {
        const city = suggestion.city || "";
        const state = suggestion.state || "";
        const country = suggestion.country || "";

        setValue("facility_name", searchQuery);
        setValue("street_address", suggestion.address_line1 || "");
        setValue("city", city);
        setValue("province", state);
        setValue("postal_code", suggestion.postcode || "");
        setValue("country", country);

        setShowDropdown(false);
        setSearchQuery("");
        setManualEntry(false);
    };

    const handleManualEntry = () => {
        setManualEntry(true);
        setShowDropdown(false);
        setValue("facility_name", searchQuery);
    };

    const generateCalendarDays = () => {
        const year = calendarMonth.getFullYear();
        const month = calendarMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const weeks = [];
        let week = new Array(7).fill(null);

        for (let i = 0; i < firstDay; i++) {
            week[i] = null;
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayIndex = (firstDay + day - 1) % 7;
            const dateStr = formatDateLocal(new Date(year, month, day));
            week[dayIndex] = dateStr;

            if (dayIndex === 6 || day === daysInMonth) {
                weeks.push([...week]);
                week = new Array(7).fill(null);
            }
        }

        return weeks;
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
    const handleInputChange = (e) => {
      setSearchQuery(e.target.value);
    };
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
    const weeks = generateCalendarDays();

    // Debug wrapper for form submission
    const handleFormSubmit = (e) => {
        console.log("=== FORM SUBMIT EVENT TRIGGERED ===");
        console.log("Current errors:", errors);
        console.log("Form values:", watch());

        handleSubmit(
            (data) => {
                console.log("✅ Validation passed, calling onSubmit with:", data);
                onSubmit(data);
            },
            (errors) => {
                console.error("❌ VALIDATION FAILED");
                console.error("Validation errors:", errors);
                console.error("Form data at time of error:", watch());
            }
        )(e);
    };

    return (
        <>
        <style>{`
            /* Calendar Styles */
            .calendar-container {
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 15px;
                background-color: #f8f9fa;
            }
            .calendar-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            .calendar-grid {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 5px;
            }
            .calendar-day-header {
                text-align: center;
                font-weight: bold;
                padding: 4px;
                font-size: 0.85rem;
                background-color: #e9ecef;
                border-radius: 4px;
            }
            .calendar-day {
                min-height: 35px;
                max-height: 35px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                cursor: pointer;
                background-color: white;
                transition: all 0.2s;
                font-size: 0.9rem;
                padding: 2px;
            }
            .calendar-day:hover:not(.disabled) {
                background-color: #e9ecef;
                transform: scale(1.05);
            }
            .calendar-day.selected {
                background-color: #007bff;
                color: white;
                font-weight: bold;
            }
            .calendar-day.disabled {
                background-color: #f8f9fa;
                cursor: not-allowed;
                opacity: 0.5;
            }
            .calendar-day.holiday.disabled {
                background-color: #dc3545;
                color: white;
                cursor: not-allowed;
                opacity: 0.8;
                pointer-events: none;
            }
            .calendar-day.today {
                border: 2px solid #17a2b8;
            }
            .legend {
                display: flex;
                gap: 15px;
                margin-top: 10px;
                font-size: 0.875rem;
            }
            .legend-item {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .legend-box {
                width: 20px;
                height: 20px;
                border: 1px solid #dee2e6;
                border-radius: 3px;
            }
        `}</style>
        <form id={FORM_ID} onSubmit={handleFormSubmit} encType="multipart/form-data">
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0"><i className="fas fa-map-marker-alt mr-2"></i>Location Information</h5>
                </div>
                <div className="card-body">
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
                                  placeholder="Type facility name or address (e.g., Downtown Dental Clinic, Toronto)"
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

                        <input type="hidden" {...register("contract_location")} />

                        <hr className="my-4"/>
                        <h6 className="text-muted mb-3"><i className="fas fa-info-circle mr-2"></i>Auto-filled Details</h6>

                        <div className="form-group">
                            <label className="control-label font-weight-semibold">
                              <i className="fas fa-clinic-medical mr-2"></i>Facility/Clinic Name
                            </label>
                            <input
                              {...register("facility_name")}
                              type="text"
                              className="form-control bg-light"
                              placeholder="Will be filled from search"
                              readOnly
                            />
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
                                      className="form-control bg-light"
                                      placeholder="Will be filled from search"
                                      readOnly
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
                                      className="form-control bg-light"
                                      placeholder="Will be filled from search"
                                      readOnly
                                    />
                                    {errors?.city && (
                                      <small className="text-danger"><i className="fas fa-exclamation-circle mr-1"></i>{errors.city.message}</small>
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
                                      className="form-control bg-light"
                                      placeholder="Will be filled from search"
                                      readOnly
                                    />
                                    {errors?.province && (
                                      <small className="text-danger"><i className="fas fa-exclamation-circle mr-1"></i>{errors.province.message}</small>
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
                                      className="form-control bg-light"
                                      placeholder="Will be filled from search"
                                      readOnly
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
                                      className="form-control bg-light"
                                      value="Canada"
                                      readOnly
                                    />
                                </div>
                            </div>
                        </div>
                      </>
                    ) : !isClinicOrPharmacy && manualEntry ? (
                      <>
                        <div className="form-group">
                            <label className="control-label font-weight-bold">
                              <i className="fas fa-clinic-medical mr-2"></i>Facility/Clinic Name <span className="text-danger">*</span>
                            </label>
                            <input
                              {...register("facility_name")}
                              type="text"
                              className={`form-control ${errors?.facility_name ? 'is-invalid' : ''}`}
                              placeholder="Enter clinic or facility name"
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
                              className="form-control"
                              placeholder="123 Main Street"
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
                                      className={`form-control ${errors?.city ? 'is-invalid' : ''}`}
                                      placeholder="Toronto"
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
                                    <select {...register("province")} className={`form-control custom-select ${errors?.province ? 'is-invalid' : ''}`} style={{height: "45px"}}>
                                        <option value="">Select Province</option>
                                        <option value="Alberta">🍁 Alberta (AB)</option>
                                        <option value="British Columbia">🌲 British Columbia (BC)</option>
                                        <option value="Manitoba">🌾 Manitoba (MB)</option>
                                        <option value="New Brunswick">🦞 New Brunswick (NB)</option>
                                        <option value="Newfoundland and Labrador">⛵ Newfoundland and Labrador (NL)</option>
                                        <option value="Northwest Territories">❄️ Northwest Territories (NT)</option>
                                        <option value="Nova Scotia">🐟 Nova Scotia (NS)</option>
                                        <option value="Nunavut">🐻‍❄️ Nunavut (NU)</option>
                                        <option value="Ontario">🏙️ Ontario (ON)</option>
                                        <option value="Prince Edward Island">🥔 Prince Edward Island (PE)</option>
                                        <option value="Quebec">⚜️ Quebec (QC)</option>
                                        <option value="Saskatchewan">🌻 Saskatchewan (SK)</option>
                                        <option value="Yukon">⛰️ Yukon (YT)</option>
                                    </select>
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
                                      className="form-control"
                                      placeholder="M5H 2N2"
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
                                      className="form-control bg-light"
                                      value="Canada"
                                      readOnly
                                    />
                                </div>
                            </div>
                        </div>
                        <input type="hidden" {...register("contract_location")} />
                      </>
                    ) : isClinicOrPharmacy ? (
                      <>
                        <div className="form-group">
                            <label className="control-label font-weight-bold">
                              <i className="fas fa-clinic-medical mr-2"></i>Facility/Clinic Name <span className="text-danger">*</span>
                            </label>
                            <input
                              {...register("facility_name")}
                              type="text"
                              className={`form-control bg-light ${errors?.facility_name ? 'is-invalid' : ''}`}
                              placeholder="Enter clinic or facility name"
                              readOnly
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
                              className="form-control bg-light"
                              placeholder="123 Main Street"
                              readOnly
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
                                      className={`form-control bg-light ${errors?.city ? 'is-invalid' : ''}`}
                                      placeholder="Toronto"
                                      readOnly
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
                                      className={`form-control bg-light ${errors?.province ? 'is-invalid' : ''}`}
                                      placeholder="Province"
                                      readOnly
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
                                      className="form-control bg-light"
                                      placeholder="M5H 2N2"
                                      readOnly
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
                                      className="form-control bg-light"
                                      value="Canada"
                                      readOnly
                                    />
                                </div>
                            </div>
                        </div>
                        <input type="hidden" {...register("contract_location")} />
                      </>
                    ) : null}
                </div>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0"><i className="fas fa-calendar-alt mr-2"></i>Select Dates</h5>
                </div>
                <div className="card-body">
                    <div className="calendar-container">
                        <div className="calendar-header">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                            >
                                <i className="fas fa-chevron-left"></i> Previous
                            </button>
                            <h5 className="mb-0">
                                {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h5>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                            >
                                Next <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>

                        <div className="calendar-grid">
                            {/* Day headers */}
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="calendar-day-header">
                                    {day}
                                </div>
                            ))}

                            {/* Calendar days */}
                            {(() => {
                                const year = calendarMonth.getFullYear();
                                const month = calendarMonth.getMonth();
                                const firstDay = new Date(year, month, 1);
                                const lastDay = new Date(year, month + 1, 0);
                                const startingDayOfWeek = firstDay.getDay();
                                const daysInMonth = lastDay.getDate();

                                const days = [];

                                // Empty cells before month starts
                                for (let i = 0; i < startingDayOfWeek; i++) {
                                    days.push(<div key={`empty-${i}`} className="calendar-day disabled"></div>);
                                }

                                // Days of the month
                                for (let day = 1; day <= daysInMonth; day++) {
                                    const date = new Date(year, month, day);
                                    const dateStr = formatDateLocal(date);
                                    const isSelected = selectedDates.includes(dateStr);
                                    const isToday = dateStr === formatDateLocal(new Date());
                                    const isHoliday = CANADA_HOLIDAYS.includes(dateStr);

                                    days.push(
                                        <div
                                            key={dateStr}
                                            className={`calendar-day ${isSelected ? 'selected' : ''} ${isHoliday ? 'holiday disabled' : ''} ${isToday ? 'today' : ''}`}
                                            onClick={() => !isHoliday && handleDateClick(dateStr)}
                                            title={isHoliday ? 'Canadian Holiday' : dateStr}
                                        >
                                            {day}
                                        </div>
                                    );
                                }

                                return days;
                            })()}
                        </div>

                        {/* Color Legend */}
                        <div className="legend">
                            <div className="legend-item">
                                <div className="legend-box" style={{backgroundColor: '#007bff'}}></div>
                                <span>Selected</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-box" style={{backgroundColor: '#dc3545'}}></div>
                                <span>Holiday (Blocked)</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-box" style={{backgroundColor: 'white'}}></div>
                                <span>Available</span>
                            </div>
                        </div>
                    </div>

                    {selectedDates.length > 0 && (
                        <div className="mt-4">
                            <h6><i className="fas fa-check-circle text-success mr-2"></i>Selected Dates ({selectedDates.length})</h6>
                            <div className="alert alert-info">
                                {groupConsecutiveDates(selectedDates).map((group, idx) => (
                                    <div key={idx}>
                                        {group.length === 1
                                            ? formatDateDisplay(group[0])
                                            : `${formatDateDisplay(group[0])} - ${formatDateDisplay(group[group.length - 1])}`}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <input type="hidden" {...register("selected_dates")} />
                    <input type="hidden" {...register("start_date")} />
                    <input type="hidden" {...register("end_date")} />

                    {errors?.start_date && (
                        <div className="alert alert-danger mt-2">
                            <i className="fas fa-exclamation-circle mr-2"></i>{errors.start_date.message}
                        </div>
                    )}
                </div>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0"><i className="fas fa-user-md mr-2"></i>Specialty Details</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-briefcase mr-2"></i>Position Title <span className="text-danger">*</span>
                                </label>
                                <select {...register("position_title")} className={`form-control ${errors?.position_title ? 'is-invalid' : ''}`}>
                                    <option value="">Select Position</option>
                                    <option value="Surgical">Surgical</option>
                                    <option value="Complex Evaluation">Complex Evaluation</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors?.position_title && (
                                    <div className="invalid-feedback">{errors.position_title.message}</div>
                                )}
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-stethoscope mr-2"></i>Required Specialty <span className="text-danger">*</span>
                                </label>
                                <input
                                    {...register("required_specialty")}
                                    type="text"
                                    className={`form-control ${errors?.required_specialty ? 'is-invalid' : ''}`}
                                    placeholder="Enter required specialty"
                                />
                                {errors?.required_specialty && (
                                    <div className="invalid-feedback">{errors.required_specialty.message}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-file-alt mr-2"></i>Mission Objective / Required Procedure <span className="text-danger">*</span>
                                </label>
                                <textarea
                                    {...register("mission_objective")}
                                    className={`form-control ${errors?.mission_objective ? 'is-invalid' : ''}`}
                                    rows="4"
                                    placeholder="Enter mission objective or required procedure"
                                ></textarea>
                                {errors?.mission_objective && (
                                    <div className="invalid-feedback">{errors.mission_objective.message}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0"><i className="fas fa-clock mr-2"></i>Duration & Compensation</h5>
                </div>
                <div className="card-body">
                    {selectedDates.length > 0 && (
                        <div className="form-group">
                            <label className="control-label font-weight-bold d-block">
                                <i className="fas fa-sliders-h mr-2"></i>Duration Configuration
                            </label>
                            <div className="btn-group btn-group-toggle w-100 mb-3" data-toggle="buttons">
                                <label className={`btn btn-outline-primary ${durationMode === "global" ? "active" : ""}`}>
                                    <input
                                        type="radio"
                                        name="durationMode"
                                        checked={durationMode === "global"}
                                        onChange={() => handleDurationModeChange("global")}
                                    />
                                    <i className="fas fa-globe mr-1"></i> Same for All Dates
                                </label>
                                <label className={`btn btn-outline-primary ${durationMode === "per_date" ? "active" : ""}`}>
                                    <input
                                        type="radio"
                                        name="durationMode"
                                        checked={durationMode === "per_date"}
                                        onChange={() => handleDurationModeChange("per_date")}
                                    />
                                    <i className="fas fa-calendar-day mr-1"></i> Different per Date
                                </label>
                            </div>
                        </div>
                    )}

                    <div className="row">
                        <div className="col-md-6">
                            {durationMode === "global" ? (
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                        <i className="fas fa-hourglass-start mr-2"></i>Estimated Duration (All Dates) <span className="text-danger">*</span>
                                    </label>
                                    <div className="card p-3 bg-light">
                                        <div className="form-group mb-2">
                                            <label htmlFor="startHour">Start Hour</label>
                                            <input
                                                {...register("estimated_duration.start_hour")}
                                                type="time"
                                                className={`form-control ${errors?.estimated_duration?.start_hour ? 'is-invalid' : ''}`}
                                                id="startHour"
                                            />
                                            {errors?.estimated_duration?.start_hour && (
                                                <div className="invalid-feedback">{errors.estimated_duration.start_hour.message}</div>
                                            )}
                                        </div>
                                        <div className="form-group mb-0">
                                            <label htmlFor="endHour">End Hour</label>
                                            <input
                                                {...register("estimated_duration.end_hour")}
                                                type="time"
                                                className={`form-control ${errors?.estimated_duration?.end_hour ? 'is-invalid' : ''}`}
                                                id="endHour"
                                            />
                                            {errors?.estimated_duration?.end_hour && (
                                                <div className="invalid-feedback">{errors.estimated_duration.end_hour.message}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                        <i className="fas fa-calendar-check mr-2"></i>Duration per Date <span className="text-danger">*</span>
                                    </label>
                                    <div className="card p-3 bg-light" style={{maxHeight: "400px", overflowY: "auto"}}>
                                        {selectedDates.length === 0 ? (
                                            <div className="text-center text-muted py-3">
                                                <i className="fas fa-info-circle mr-2"></i>
                                                Please select dates first
                                            </div>
                                        ) : (
                                            selectedDates.sort().map(date => (
                                                <div key={date} className="mb-3 p-2 border rounded bg-white">
                                                    <div className="font-weight-bold text-primary mb-2">
                                                        <i className="fas fa-calendar mr-1"></i>
                                                        {formatDateDisplay(date)}
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-6">
                                                            <label className="small">Start Hour</label>
                                                            <input
                                                                type="time"
                                                                className="form-control form-control-sm"
                                                                value={dateDurations[date]?.start_hour || ""}
                                                                onChange={(e) => handleDateDurationChange(date, "start_hour", e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="col-6">
                                                            <label className="small">End Hour</label>
                                                            <input
                                                                type="time"
                                                                className="form-control form-control-sm"
                                                                value={dateDurations[date]?.end_hour || ""}
                                                                onChange={(e) => handleDateDurationChange(date, "end_hour", e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    {errors?.date_durations && (
                                        <div className="text-danger small mt-1">
                                            <i className="fas fa-exclamation-circle mr-1"></i>
                                            {errors.date_durations.message}
                                        </div>
                                    )}
                                    <input type="hidden" {...register("date_durations")} />
                                </div>
                            )}
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-dollar-sign mr-2"></i>Compensation Mode <span className="text-danger">*</span>
                                </label>
                                <select
                                    {...register("compensation_mode")}
                                    className={`form-control ${errors?.compensation_mode ? 'is-invalid' : ''}`}
                                >
                                    <option value="">Select Compensation Mode</option>
                                    <option value="Per Hour">⏰ Per Hour</option>
                                    <option value="Fixed Contract Value">💰 Fixed Contract Value</option>
                                </select>
                                {errors?.compensation_mode && (
                                    <div className="invalid-feedback">{errors.compensation_mode.message}</div>
                                )}
                                {watch("compensation_mode") === "Fixed Contract Value" && (
                                    <small className="form-text text-info">
                                        <i className="fas fa-info-circle mr-1"></i>
                                        Use for specific specialty missions (e.g., wisdom teeth extraction, root canal treatment, periodontal surgery). The value should represent the total contract value from start date to end date.
                                    </small>
                                )}
                            </div>

                            {watch("compensation_mode") === "Per Hour" && (
                                <div className="form-group mt-3">
                                    <label className="control-label font-weight-bold">
                                        <i className="fas fa-money-bill-wave mr-2"></i>
                                        Hourly Rate
                                        <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text">$</span>
                                        </div>
                                        <input
                                            {...register("hourly_rate")}
                                            type="number"
                                            step="0.01"
                                            className={`form-control ${errors?.hourly_rate ? 'is-invalid' : ''}`}
                                            placeholder="e.g., 150.00"
                                        />
                                        {errors?.hourly_rate && (
                                            <div className="invalid-feedback">{errors.hourly_rate.message}</div>
                                        )}
                                    </div>
                                    <small className="form-text text-muted">
                                        Enter the amount in CAD per hour
                                    </small>
                                </div>
                            )}

                            {watch("compensation_mode") === "Fixed Contract Value" && (
                                <>
                                    <div className="form-group mt-3">
                                        <label className="control-label font-weight-bold">
                                            <i className="fas fa-money-bill-wave mr-2"></i>
                                            Contract Value
                                            <span className="text-danger">*</span>
                                        </label>
                                        <div className="input-group">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text">$</span>
                                            </div>
                                            <input
                                                {...register("contract_value")}
                                                type="number"
                                                step="0.01"
                                                className={`form-control ${errors?.contract_value ? 'is-invalid' : ''}`}
                                                placeholder="e.g., 5000.00"
                                            />
                                            {errors?.contract_value && (
                                                <div className="invalid-feedback">{errors.contract_value.message}</div>
                                            )}
                                        </div>
                                        <small className="form-text text-muted">
                                            Total value for the entire contract
                                        </small>
                                    </div>
                                    <div className="form-group mt-3">
                                        <label className="control-label font-weight-bold">
                                            <i className="fas fa-tasks mr-2"></i>Mission Description <span className="text-danger">*</span>
                                        </label>
                                        <textarea
                                            {...register("mission_description")}
                                            className={`form-control ${errors?.mission_description ? 'is-invalid' : ''}`}
                                            rows="3"
                                            placeholder="Describe the specific specialty dental mission (e.g., 'Extraction of 4 impacted wisdom teeth', 'Root canal treatment for molar', 'Periodontal surgery for quadrant')"
                                        ></textarea>
                                        {errors?.mission_description && (
                                            <div className="invalid-feedback">{errors.mission_description.message}</div>
                                        )}
                                        <small className="form-text text-muted">
                                            Provide details about the specific specialty procedure or mission that justifies the fixed contract value.
                                        </small>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <input type="hidden" {...register("duration_mode")} />
                </div>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0"><i className="fas fa-list-check mr-2"></i>Additional Requirements</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-tools mr-2"></i>Equipment / Room
                                </label>
                                <select
                                    {...register("equipment_room")}
                                    className={`form-control ${errors?.equipment_room ? 'is-invalid' : ''}`}
                                >
                                    <option value="">Select Option</option>
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>
                                {errors?.equipment_room && (
                                    <div className="invalid-feedback">{errors.equipment_room.message}</div>
                                )}
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-file-signature mr-2"></i>Required Documents / Consent
                                </label>
                                <select
                                    {...register("required_documents")}
                                    className={`form-control ${errors?.required_documents ? 'is-invalid' : ''}`}
                                >
                                    <option value="">Select Option</option>
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>
                                {errors?.required_documents && (
                                    <div className="invalid-feedback">{errors.required_documents.message}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
                                                    setValue(`position_soughts.${index}.position_ids`, [e.target.value], { shouldValidate: true });
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
        </>
    );
}

export default SpecialtyDentistryForm;