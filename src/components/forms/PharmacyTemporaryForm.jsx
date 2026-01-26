import React, { useState, useEffect } from "react";
import { fetchGeoapifySuggestions } from "../api/geopify";
import { getUserProfileService } from "@services/institute/ProfileService";


const PharmacyTemporaryForm = ({ContractFormHook}) => {
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


    // Canadian Holidays
    const CANADA_HOLIDAYS = [
            "2025-01-01", // New Year – Wednesday, January 1, 2025
            "2025-04-18", // Good Friday – Friday, April 18, 2025
            "2025-04-21", // Easter Monday – Monday, April 21, 2025
            "2025-05-19", // Victoria Day – Monday, May 19, 2025
            "2025-06-24", // Saint-Jean-Baptiste Day – Tuesday, June 24, 2025 (Quebec only)
            "2025-07-01", // Canada Day – Tuesday, July 1, 2025
            "2025-08-04", // Civic Holiday – Monday, August 4, 2025 (excluding Quebec)
            "2025-09-01", // Labour Day – Monday, September 1, 2025
            "2025-09-30", // National Day for Truth and Reconciliation – Tuesday, September 30, 2025
            "2025-10-13", // Thanksgiving Day – Monday, October 13, 2025
            "2025-11-11", // Remembrance Day – Tuesday, November 11, 2025
            "2025-12-25", // Christmas Day – Thursday, December 25, 2025
            "2025-12-26", // Boxing Day – Friday, December 26, 2025
            "2026-01-01", // New Year's Day – Thursday, January 1, 2026
            "2026-04-03", // Good Friday – Friday, April 3, 2026
            "2026-04-06", // Easter Monday – Monday, April 6, 2026
            "2026-05-18", // Victoria Day – Monday, May 18, 2026
            "2026-06-24", // Saint-Jean-Baptiste Day – Wednesday, June 24, 2026 (Quebec only)
            "2026-07-01", // Canada Day – Wednesday, July 1, 2026
            "2026-08-03", // Civic Holiday – Monday, August 3, 2026 (excluding Quebec)
            "2026-09-07", // Labour Day – Monday, September 7, 2026
            "2026-09-30", // National Day for Truth and Reconciliation – Wednesday, September 30, 2026
            "2026-10-12", // Thanksgiving Day – Monday, October 12, 2026
            "2026-11-11", // Remembrance Day – Wednesday, November 11, 2026
            "2026-12-25", // Christmas Day – Friday, December 25, 2026
            "2026-12-26", // Boxing Day – Saturday, December 26, 2026
    ];
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [manualEntry, setManualEntry] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(new Date());
    const [selectedDates, setSelectedDates] = useState([]);
    const [timeSlots, setTimeSlots] = useState({});
    const [applyToAll, setApplyToAll] = useState(false);
    const [masterTimeSlot, setMasterTimeSlot] = useState({ start_time: "09:00", end_time: "17:00" });
    const [isInitialLoad, setIsInitialLoad] = useState(true);
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

    // Helper function to format date as YYYY-MM-DD in local time (prevents timezone issues)
    const formatDateLocal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Clear all dates
    const handleClearAllDates = () => {
      setSelectedDates([]);
      setValue("selected_dates", "");
    };

    // Remove a single date
    const handleRemoveDate = (dateToRemove) => {
      const updatedDates = selectedDates.filter(date => date !== dateToRemove);
      setSelectedDates(updatedDates);
      setValue("selected_dates", updatedDates.length > 0 ? JSON.stringify(updatedDates) : "");
    };

    // Group consecutive dates
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
    // Format date for display
    const formatDateDisplay = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
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
        } catch (err) {
          console.error("Error fetching location suggestions:", err);
        }
      };

      const timeoutId = setTimeout(fetchSuggestions, 300);
      return () => clearTimeout(timeoutId);
    }, [searchQuery]);
    // Sync selected dates with start_date and end_date for form compatibility
    useEffect(() => {
      if (selectedDates.length > 0) {
        const sortedDates = [...selectedDates].sort();
        const shouldValidate = !isInitialLoad;

        // Set start_date and end_date with proper validation flags
        setValue("start_date", sortedDates[0], { shouldValidate, shouldDirty: !isInitialLoad });
        setValue("end_date", sortedDates[sortedDates.length - 1], { shouldValidate, shouldDirty: !isInitialLoad });
        setValue("selected_dates", JSON.stringify(sortedDates), { shouldValidate: false, shouldDirty: !isInitialLoad });

        // Log for debugging
        console.log("Selected dates updated:", {
          selected_dates: sortedDates,
          start_date: sortedDates[0],
          end_date: sortedDates[sortedDates.length - 1]
        });
      } else {
        // Clear the fields if no dates selected
        setValue("start_date", "", { shouldValidate: false });
        setValue("end_date", "", { shouldValidate: false });
        setValue("selected_dates", "", { shouldValidate: false });
      }
    }, [selectedDates, setValue, isInitialLoad]);

    // Sync time slots with form
    useEffect(() => {
        if (Object.keys(timeSlots).length > 0) {
            const slotsArray = Object.entries(timeSlots).map(([date, times]) => ({
                date,
                start_time: times.start_time,
                end_time: times.end_time
            }));
            const jsonString = JSON.stringify(slotsArray);
            setValue("time_slots", jsonString, { shouldValidate: false });
            console.log("Time slots synced to form:", jsonString);
        } else {
            setValue("time_slots", "", { shouldValidate: false });
            console.log("Time slots cleared from form");
        }
    }, [timeSlots, setValue]);

    // Initialize time slots for newly selected dates
    useEffect(() => {
        if (selectedDates.length > 0) {
            setTimeSlots(prevSlots => {
                const newSlots = { ...prevSlots };
                selectedDates.forEach(date => {
                    if (!newSlots[date]) {
                        newSlots[date] = applyToAll ? { ...masterTimeSlot } : { start_time: "09:00", end_time: "17:00" };
                    }
                });
                // Remove time slots for dates that are no longer selected
                Object.keys(newSlots).forEach(date => {
                    if (!selectedDates.includes(date)) {
                        delete newSlots[date];
                    }
                });
                return newSlots;
            });
        } else {
            setTimeSlots({});
        }
    }, [selectedDates]);

    // Apply master time slot to all dates when applyToAll is toggled
    useEffect(() => {
        if (applyToAll && selectedDates.length > 0) {
            const newSlots = {};
            selectedDates.forEach(date => {
                newSlots[date] = { ...masterTimeSlot };
            });
            setTimeSlots(newSlots);
        }
    }, [applyToAll, masterTimeSlot]);

    useEffect(() => {
          if (professionalCategories?.length > 0) {
            const dental = professionalCategories.find((c) => c.name === "Pharmacy");
            if (dental) {
              positionRows.forEach((_, index) => {
                setValue(`position_soughts.${index}.professional_category_id`, dental.id);
              });
            }
          }
        }, [professionalCategories, positionRows]);
    // Load selected dates from contract when editing
    useEffect(() => {
        if (contract?.selected_dates) {
            try {
                // If selected_dates is a string (JSON), parse it
                const dates = typeof contract.selected_dates === 'string'
                    ? JSON.parse(contract.selected_dates)
                    : contract.selected_dates;

                if (Array.isArray(dates) && dates.length > 0) {
                    setSelectedDates(dates);
                    setValue("selected_dates", JSON.stringify(dates));

                    // Set calendar to show the first selected date's month
                    const firstDate = new Date(dates[0]);
                    setCalendarMonth(firstDate);

                    console.log("Loaded existing selected dates:", dates);

                    // Mark initial load as complete after a short delay
                    setTimeout(() => {
                        setIsInitialLoad(false);
                    }, 200);
                }
            } catch (error) {
                console.error("Error loading selected dates:", error);
            }
        } else if (contract?.start_date && contract?.end_date) {
            // Fallback: if no selected_dates but has start/end dates, generate range
            console.log("No selected_dates found, using start/end date range");
            const generateRange = (start, end) => {
                const dates = [];
                const startDate = new Date(start);
                const endDate = new Date(end);

                for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
                    const dateStr = formatDateLocal(date);
                    // Skip holidays when generating from range
                    if (!CANADA_HOLIDAYS.includes(dateStr)) {
                        dates.push(dateStr);
                    }
                }
                return dates;
            };

            const dates = generateRange(contract.start_date, contract.end_date);
            setSelectedDates(dates);
            setValue("selected_dates", JSON.stringify(dates));
        }
    }, [contract, setValue]);

    // Load existing time slots when editing
    useEffect(() => {
        if (contract?.time_slots) {
            try {
                const slots = typeof contract.time_slots === 'string'
                    ? JSON.parse(contract.time_slots)
                    : contract.time_slots;

                if (Array.isArray(slots) && slots.length > 0) {
                    // Convert array to object format for state
                    const slotsObject = {};
                    slots.forEach(slot => {
                        if (slot.date && slot.start_time && slot.end_time) {
                            slotsObject[slot.date] = {
                                start_time: slot.start_time,
                                end_time: slot.end_time
                            };
                        }
                    });
                    setTimeSlots(slotsObject);
                    setValue("time_slots", JSON.stringify(slots));

                    // Check if all time slots are the same (detect if "Apply to All" was used)
                    const uniqueSlots = [...new Set(slots.map(s => `${s.start_time}-${s.end_time}`))];
                    if (uniqueSlots.length === 1 && slots.length > 1) {
                        // All time slots are identical - restore "Apply to All" state
                        setApplyToAll(true);
                        setMasterTimeSlot({
                            start_time: slots[0].start_time,
                            end_time: slots[0].end_time
                        });
                        console.log("Detected uniform time slots - applying to all");
                    } else {
                        setApplyToAll(false);
                    }

                    console.log("Loaded existing time slots:", slotsObject);
                }
            } catch (error) {
                console.error("Error loading time slots:", error);
            }
        }
    }, [contract?.time_slots]);

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

    useEffect(() => {
      if (professionalCategories?.length > 0) {
        const pharmacy = professionalCategories.find((c) => c.name === "Pharmacy");
        if (pharmacy) {
          positionRows.forEach((_, index) => {
            setValue(`position_soughts.${index}.professional_category_id`, pharmacy.id);
          });
        }
      }
    }, [professionalCategories, positionRows]);

    // Update file input label when file is selected
    useEffect(() => {
      const fileInput = document.getElementById('attachments');
      if (fileInput) {
        fileInput.addEventListener('change', (e) => {
          const fileName = e.target.files[0]?.name || 'Choose file...';
          const label = document.querySelector('.custom-file-label');
          if (label) label.textContent = fileName;
        });
      }
    }, []);
    const [currentProvince, setCurrentProvince] = useState("");
    // ADD THIS: Watch province changes and update local state
        useEffect(() => {
            const subscription = watch((value, { name }) => {
                if (name === "province") {
                    console.log("Province changed to:", value.province);
                    setCurrentProvince(value.province || "");

                    // Clear position selections when province changes
                    positionRows.forEach((_, index) => {
                        setValue(`position_soughts.${index}.position_ids`, []);
                    });
                }
            });
            return () => subscription.unsubscribe();
        }, [watch, positionRows, setValue]);

        // Initialize province from form value
        useEffect(() => {
            const provinceValue = watch("province");
            if (provinceValue) {
                setCurrentProvince(provinceValue);
            }
        }, []);


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

            .form-control:focus, .custom-select:focus, .custom-file-input:focus ~ .custom-file-label {
                border-color: #80bdff;
                box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
            }

            .suggestion-item {
                border-left: 0px solid transparent;
            }

            .badge {
                font-weight: 600;
            }

            .input-group-text {
                background-color: #e9ecef;
                border: 1px solid #ced4da;
            }

            .custom-file-label::after {
                content: "Browse";
                background-color: #007bff;
                color: white;
                border-color: #007bff;
            }

            .custom-control-input:checked ~ .custom-control-label {
                color: #007bff;
                font-weight: 500;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .card {
                animation: fadeIn 0.3s ease;
            }

            .border.rounded.p-2::-webkit-scrollbar {
                width: 8px;
            }

            .border.rounded.p-2::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 4px;
            }

            .border.rounded.p-2::-webkit-scrollbar-thumb {
                background: #888;
                border-radius: 4px;
            }

            .border.rounded.p-2::-webkit-scrollbar-thumb:hover {
                background: #555;
            }

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
        <form id={FORM_ID ?? ""} onSubmit={handleSubmit(onSubmit)}>
            {/* Contract Name Card */}
            {contract && (
                <div className="card shadow-sm mb-4 border-primary">
                    <div className="card-header bg-gradient-primary text-white">
                        <h4 className="mb-0">
                            <i className="fas fa-file-contract mr-2"></i>
                            {contract.contract_name || "Pharmacy Temporary Contract"}
                        </h4>
                    </div>
                </div>
            )}

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

                        <input type="hidden" {...register("contract_location")} />

                        <hr className="my-4"/>
                        <h6 className="text-muted mb-3"><i className="fas fa-info-circle mr-2"></i>Auto-filled Details</h6>

                        <div className="form-group">
                            <label className="control-label font-weight-semibold">
                              <i className="fas fa-clinic-medical mr-2"></i>Facility/Pharmacy Name
                            </label>
                            <input
                              {...register("facility_name")}
                              type="text"
                              className={`form-control ${isClinicOrPharmacy ? 'bg-light' : ''}`}
                              placeholder="Will be filled from search"
                              readOnly={isClinicOrPharmacy || !manualEntry}
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
                                      className={`form-control ${isClinicOrPharmacy ? 'bg-light' : ''}`}
                                      placeholder="Will be filled from search"
                                      readOnly={isClinicOrPharmacy || !manualEntry}
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
                                      className={`form-control ${isClinicOrPharmacy ? 'bg-light' : ''}`}
                                      placeholder="Will be filled from search"
                                      readOnly={isClinicOrPharmacy || !manualEntry}
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
                                    <select {...register("province")} className={`form-control custom-select ${isClinicOrPharmacy ? 'bg-light' : ''} ${errors?.province ? 'is-invalid' : ''}`} style={{height: "45px"}} disabled={isClinicOrPharmacy}>
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
                                      value="Canada"
                                      readOnly={isClinicOrPharmacy || !manualEntry}
                                    />
                                </div>
                            </div>
                        </div>
                        <input type="hidden" {...register("contract_location")} />
                      </>
                    )}
                </div>
            </div>

            {/* Contract Dates Card */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-success text-white">
                    <h5 className="mb-0"><i className="fas fa-calendar-alt mr-2"></i>Contract Duration</h5>
                </div>
                <div className="card-body">
                    {/* Calendar Day Picker Interface */}
                    <div className="row">
                        <div className="col-md-12">
                            <div className="form-group">
                                <label className="control-label font-weight-semibold">
                                    <i className="fas fa-calendar-plus mr-2"></i>Select Working Days <span className="text-danger">*</span>
                                </label>
                                <p className="text-muted small mb-3">
                                    <i className="fas fa-info-circle mr-1"></i>
                                    Click on days in the calendar below to select/deselect them for your contract
                                </p>

                                {/* Show info if editing existing contract with dates */}
                                {contract?.selected_dates && selectedDates.length > 0 && (
                                    <div className="alert alert-info mb-3" role="alert">
                                        <i className="fas fa-check-circle mr-2"></i>
                                        <strong>Loaded existing contract dates:</strong> {selectedDates.length} days selected.
                                        You can modify them by clicking on the calendar below.
                                    </div>
                                )}

                                <div className="calendar-container">
                                    {/* Month/Year Navigation */}
                                    <div className="calendar-header">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => {
                                                const current = new Date(calendarMonth);
                                                current.setMonth(current.getMonth() - 1);
                                                setCalendarMonth(current);
                                            }}
                                        >
                                            <i className="fas fa-chevron-left"></i> Previous
                                        </button>
                                        <h5 className="mb-0">
                                            {calendarMonth.toLocaleDateString('en-US', {
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </h5>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => {
                                                const current = new Date(calendarMonth);
                                                current.setMonth(current.getMonth() + 1);
                                                setCalendarMonth(current);
                                            }}
                                        >
                                            Next <i className="fas fa-chevron-right"></i>
                                        </button>
                                    </div>

                                    {/* Calendar Grid */}
                                    <div className="calendar-grid">
                                        {/* Day headers */}
                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                            <div key={day} className="calendar-day-header">
                                                {day}
                                            </div>
                                        ))}

                                        {/* Calendar days */}
                                        {(() => {
                                            const currentMonth = calendarMonth;
                                            const year = currentMonth.getFullYear();
                                            const month = currentMonth.getMonth();
                                            const firstDay = new Date(year, month, 1);
                                            const lastDay = new Date(year, month + 1, 0);
                                            const startingDayOfWeek = firstDay.getDay();
                                            const daysInMonth = lastDay.getDate();

                                            const days = [];

                                            // Add empty cells for days before the first of the month
                                            for (let i = 0; i < startingDayOfWeek; i++) {
                                                days.push(<div key={`empty-${i}`} className="calendar-day disabled"></div>);
                                            }

                                            // Add the days of the month
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
                                                        onClick={() => {
                                                            if (!isHoliday) {
                                                                if (isSelected) {
                                                                    handleRemoveDate(dateStr);
                                                                } else {
                                                                    const updatedDates = [...selectedDates, dateStr].sort();
                                                                    setSelectedDates(updatedDates);
                                                                    setValue("selected_dates", JSON.stringify(updatedDates));
                                                                }
                                                            }
                                                        }}
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

                                    {/* Quick Actions */}
                                    <div className="mt-3 d-flex gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-outline-success btn-sm"
                                            onClick={() => {
                                                // Select all weekdays in current month (excluding holidays)
                                                const currentMonth = calendarMonth;
                                                const year = currentMonth.getFullYear();
                                                const month = currentMonth.getMonth();
                                                const lastDay = new Date(year, month + 1, 0).getDate();
                                                const weekdays = [];

                                                for (let day = 1; day <= lastDay; day++) {
                                                    const date = new Date(year, month, day);
                                                    const dateStr = formatDateLocal(date);
                                                    const dayOfWeek = date.getDay();
                                                    const isHoliday = CANADA_HOLIDAYS.includes(dateStr);
                                                    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday) { // Not Sunday, Saturday, or holiday
                                                        weekdays.push(dateStr);
                                                    }
                                                }

                                                const updatedDates = [...new Set([...selectedDates, ...weekdays])].sort();
                                                setSelectedDates(updatedDates);
                                                setValue("selected_dates", JSON.stringify(updatedDates));
                                            }}
                                        >
                                            <i className="fas fa-briefcase mr-1"></i>Select All Weekdays
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-info btn-sm"
                                            onClick={() => {
                                                // Select entire month (excluding holidays)
                                                const currentMonth = calendarMonth;
                                                const year = currentMonth.getFullYear();
                                                const month = currentMonth.getMonth();
                                                const lastDay = new Date(year, month + 1, 0).getDate();
                                                const allDays = [];

                                                for (let day = 1; day <= lastDay; day++) {
                                                    const date = new Date(year, month, day);
                                                    const dateStr = formatDateLocal(date);
                                                    const isHoliday = CANADA_HOLIDAYS.includes(dateStr);
                                                    if (!isHoliday) {
                                                        allDays.push(dateStr);
                                                    }
                                                }

                                                const updatedDates = [...new Set([...selectedDates, ...allDays])].sort();
                                                setSelectedDates(updatedDates);
                                                setValue("selected_dates", JSON.stringify(updatedDates));
                                            }}
                                        >
                                            <i className="fas fa-calendar-alt mr-1"></i>Select Entire Month
                                        </button>
                                        {selectedDates.length > 0 && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger btn-sm ml-auto"
                                                onClick={handleClearAllDates}
                                            >
                                                <i className="fas fa-times mr-1"></i>Clear All
                                            </button>
                                        )}
                                    </div>

                                    {/* Selected Dates Summary */}
                                    {selectedDates.length > 0 ? (
                                        <div className="mt-3">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <label className="control-label font-weight-semibold mb-0">
                                                    <i className="fas fa-calendar-check mr-2 text-success"></i>
                                                    Selected Dates ({selectedDates.length} days)
                                                </label>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm"
                                                    onClick={handleClearAllDates}
                                                >
                                                    <i className="fas fa-trash mr-1"></i>Clear All
                                                </button>
                                            </div>

                                            <div className="border rounded p-2 bg-white" style={{maxHeight: "200px", overflowY: "auto"}}>
                                                {groupConsecutiveDates(selectedDates).map((group, groupIndex) => (
                                                    <div key={groupIndex} className="mb-2">
                                                        {group.length === 1 ? (
                                                            <span className="badge badge-primary badge-custom mr-2 mb-2">
                                                                <i className="fas fa-calendar-day mr-1"></i>
                                                                {formatDateDisplay(group[0])}
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-link text-white p-0 ml-2"
                                                                    onClick={() => handleRemoveDate(group[0])}
                                                                    style={{fontSize: "0.8rem"}}
                                                                >
                                                                    ×
                                                                </button>
                                                            </span>
                                                        ) : (
                                                            <span className="badge badge-success badge-custom mr-2 mb-2">
                                                                <i className="fas fa-calendar-week mr-1"></i>
                                                                {formatDateDisplay(group[0])} → {formatDateDisplay(group[group.length - 1])}
                                                                <span className="ml-1">({group.length} days)</span>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-link text-white p-0 ml-2"
                                                                    onClick={() => group.forEach(date => handleRemoveDate(date))}
                                                                    style={{fontSize: "0.8rem"}}
                                                                >
                                                                    ×
                                                                </button>
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Individual dates for removal */}
                                            <div className="mt-2">
                                                <small className="text-muted">
                                                    <i className="fas fa-info-circle mr-1"></i>
                                                    Click × to remove dates. Consecutive dates are grouped together.
                                                </small>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-3">
                                            <div className="alert alert-warning" role="alert">
                                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                                <strong>No dates selected yet.</strong> Please add at least one date or date range above.
                                            </div>
                                        </div>
                                    )}

                                    {/* Hidden input for form submission */}
                                    <input type="hidden" {...register("selected_dates")} />
                                    <input type="hidden" {...register("start_date")} />
                                    <input type="hidden" {...register("end_date")} />

                                    {errors?.selected_dates && (
                                        <div className="invalid-feedback d-block mt-2">
                                            <i className="fas fa-exclamation-circle mr-1"></i>
                                            {errors.selected_dates.message}
                                        </div>
                                    )}
                                    {errors?.start_date && (
                                        <div className="invalid-feedback d-block mt-2">
                                            <i className="fas fa-exclamation-circle mr-1"></i>
                                            {errors.start_date.message}
                                        </div>
                                    )}
                                    {errors?.end_date && (
                                        <div className="invalid-feedback d-block mt-2">
                                            <i className="fas fa-exclamation-circle mr-1"></i>
                                            {errors.end_date.message}
                                        </div>
                                    )}
                                </div>
                                <small className="form-text text-muted mt-2">
                                    <i className="fas fa-lightbulb mr-1"></i>
                                    <strong>Tip:</strong> You can add multiple date ranges with gaps.
                                    For example: Add Sept 3-5, then separately add Sept 8-10 to skip weekends.
                                </small>

                                {/* Preview button to see what will be submitted */}
                                {selectedDates.length > 0 && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm mt-2"
                                        onClick={() => {
                                            const previewData = {
                                                selected_dates: watch("selected_dates"),
                                                parsed_dates: JSON.parse(watch("selected_dates") || "[]"),
                                                start_date: watch("start_date"),
                                                end_date: watch("end_date"),
                                                total_days: selectedDates.length
                                            };
                                            console.log("📋 PREVIEW - Data that will be submitted:", previewData);
                                            alert(
                                                `📋 Submission Preview:\n\n` +
                                                `Total Days: ${previewData.total_days}\n` +
                                                `Start Date: ${previewData.start_date}\n` +
                                                `End Date: ${previewData.end_date}\n\n` +
                                                `Selected Dates:\n${previewData.parsed_dates.join(', ')}\n\n` +
                                                `Check browser console for full details.`
                                            );
                                        }}
                                    >
                                        <i className="fas fa-eye mr-1"></i>Preview Submission Data
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Time Slots Configuration */}
            {selectedDates.length > 0 && (
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-dark text-white">
                        <h5 className="mb-0">
                            <i className="fas fa-clock mr-2"></i>
                            Configure Time Slots for Selected Dates
                        </h5>
                    </div>
                    <div className="card-body">
                        {/* Apply to All Dates Option */}
                        <div className="mb-4 p-3 bg-light rounded border">
                            <div className="custom-control custom-checkbox mb-3">
                                <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    id="applyToAllDates"
                                    checked={applyToAll}
                                    onChange={(e) => setApplyToAll(e.target.checked)}
                                />
                                <label className="custom-control-label font-weight-bold" htmlFor="applyToAllDates">
                                    <i className="fas fa-copy mr-2"></i>
                                    Apply the same time slot to all selected dates
                                </label>
                            </div>

                            {applyToAll && (
                                <div className="row">
                                    <div className="col-md-4">
                                        <label className="control-label font-weight-bold">
                                            <i className="fas fa-play-circle mr-2"></i>Start Time
                                        </label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            value={masterTimeSlot.start_time}
                                            onChange={(e) => {
                                                const newMaster = { ...masterTimeSlot, start_time: e.target.value };
                                                setMasterTimeSlot(newMaster);
                                                // Apply to all dates immediately
                                                const newSlots = {};
                                                selectedDates.forEach(date => {
                                                    newSlots[date] = { ...newMaster };
                                                });
                                                setTimeSlots(newSlots);
                                            }}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="control-label font-weight-bold">
                                            <i className="fas fa-stop-circle mr-2"></i>End Time
                                        </label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            value={masterTimeSlot.end_time}
                                            onChange={(e) => {
                                                const newMaster = { ...masterTimeSlot, end_time: e.target.value };
                                                setMasterTimeSlot(newMaster);
                                                // Apply to all dates immediately
                                                const newSlots = {};
                                                selectedDates.forEach(date => {
                                                    newSlots[date] = { ...newMaster };
                                                });
                                                setTimeSlots(newSlots);
                                            }}
                                        />
                                    </div>
                                    <div className="col-md-4 d-flex align-items-end">
                                        <div className="alert alert-info mb-0 w-100 py-2">
                                            <small>
                                                <i className="fas fa-info-circle mr-1"></i>
                                                This will apply {masterTimeSlot.start_time} - {masterTimeSlot.end_time} to all {selectedDates.length} selected dates
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Individual Time Slots (shown when Apply to All is off) */}
                        {!applyToAll && (
                            <div>
                                <h6 className="font-weight-bold mb-3">
                                    <i className="fas fa-calendar-day mr-2"></i>
                                    Set Time Slots for Each Date
                                </h6>
                                <div className="table-responsive">
                                    <table className="table table-bordered table-hover">
                                        <thead className="thead-light">
                                            <tr>
                                                <th width="40%">Date</th>
                                                <th width="25%">Start Time</th>
                                                <th width="25%">End Time</th>
                                                <th width="10%">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {groupConsecutiveDates(selectedDates).map((group, groupIndex) =>
                                                group.map((date, dateIndex) => {
                                                    const slot = timeSlots[date] || { start_time: "09:00", end_time: "17:00" };
                                                    return (
                                                        <tr key={date}>
                                                            <td>
                                                                <strong>
                                                                    <i className="fas fa-calendar-alt mr-2 text-primary"></i>
                                                                    {formatDateDisplay(date)}
                                                                </strong>
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="time"
                                                                    className="form-control form-control-sm"
                                                                    value={slot.start_time}
                                                                    onChange={(e) => {
                                                                        setTimeSlots(prev => ({
                                                                            ...prev,
                                                                            [date]: { ...prev[date], start_time: e.target.value }
                                                                        }));
                                                                    }}
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="time"
                                                                    className="form-control form-control-sm"
                                                                    value={slot.end_time}
                                                                    onChange={(e) => {
                                                                        setTimeSlots(prev => ({
                                                                            ...prev,
                                                                            [date]: { ...prev[date], end_time: e.target.value }
                                                                        }));
                                                                    }}
                                                                />
                                                            </td>
                                                            <td className="text-center">
                                                                {dateIndex > 0 && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-secondary"
                                                                        title="Copy from previous"
                                                                        onClick={() => {
                                                                            const prevDate = group[dateIndex - 1];
                                                                            const prevSlot = timeSlots[prevDate];
                                                                            if (prevSlot) {
                                                                                setTimeSlots(prev => ({
                                                                                    ...prev,
                                                                                    [date]: { ...prevSlot }
                                                                                }));
                                                                            }
                                                                        }}
                                                                    >
                                                                        <i className="fas fa-copy"></i>
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="alert alert-info mt-3">
                                    <i className="fas fa-lightbulb mr-2"></i>
                                    <strong>Tip:</strong> Use the copy button <i className="fas fa-copy mx-1"></i> to quickly copy time slots from the previous date, or check "Apply to all dates" above for uniform scheduling.
                                </div>
                            </div>
                        )}

                        {/* Hidden input for form submission */}
                        <input type="hidden" {...register("time_slots")} />
                    </div>
                </div>
            )}

            {/* Work Schedule Card */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-info text-white">
                    <h5 className="mb-0"><i className="fas fa-clock mr-2"></i>Work Schedule</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                      <i className="fas fa-business-time mr-2"></i>Specific Time Slots <span className="text-danger">*</span>
                                    </label>
                                    <input {...register("work_schedule")} type="text" className={`form-control ${errors?.work_schedule ? 'is-invalid' : ''}`} placeholder="e.g., Monday-Friday, 9AM-5PM" />
                                    {errors?.work_schedule && <div className="invalid-feedback">{errors.work_schedule.message}</div>}
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label className="control-label font-weight-semibold">
                                      <i className="fas fa-mug-hot mr-2"></i>Break Included
                                    </label>
                                    <select {...register("break_included")} className="form-control custom-select" style={{height: "45px"}}>
                                        <option value="">Select Option</option>
                                        <option value="yes">✓ Yes (with duration)</option>
                                        <option value="no">✗ No Break</option>
                                    </select>
                                </div>
                            </div>
                            <div className={`col-md-3 ${watch("break_included") === "yes" ? "" : "d-none"}`}>
                                <div className="form-group">
                                    <label className="control-label font-weight-semibold">Break Duration</label>
                                    <input {...register("break_duration")} type="text" className="form-control" placeholder="30 minutes" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Compensation Card */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-warning text-dark">
                        <h5 className="mb-0"><i className="fas fa-dollar-sign mr-2"></i>Compensation & Requirements</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                      <i className="fas fa-user-graduate mr-2"></i>Required Experience Level <span className="text-danger">*</span>
                                    </label>
                                    <select {...register("required_experience")} className={`form-control custom-select ${errors?.required_experience ? 'is-invalid' : ''}`} style={{height: "45px"}}>
                                        <option value="">Select Experience Level</option>
                                        <option value="less1">⭐ Less than 1 year</option>
                                        <option value="1-3">⭐⭐ 1-3 years</option>
                                        <option value="3-5">⭐⭐⭐ 3-5 years</option>
                                        <option value="5-10">⭐⭐⭐⭐ 5-10 years</option>
                                        <option value="10plus">⭐⭐⭐⭐⭐ More than 10 years</option>
                                        <option value="noPreference">✓ No preference</option>
                                    </select>
                                    {errors?.required_experience && <div className="invalid-feedback">{errors.required_experience.message}</div>}
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label className="control-label font-weight-semibold">
                                      <i className="fas fa-money-bill-wave mr-2"></i>Compensation Mode
                                    </label>
                                    <select {...register("compensation_mode")} className="form-control custom-select" style={{height: "45px"}}>
                                        <option value="">Select Mode</option>
                                        <option value="Per Day">📅 Per Day</option>
                                        <option value="Per Hour">⏰ Per Hour</option>
                                        <option value="Fixed Contract Value">💰 Fixed Contract Value</option>
                                    </select>
                                    {watch("compensation_mode") === "Fixed Contract Value" && (
                                        <small className="form-text text-info">
                                            <i className="fas fa-info-circle mr-1"></i>
                                            Use for specific missions (e.g., medication review consultation, inventory audit, specific dispensing project). The value should represent the total contract value from start date to end date.
                                        </small>
                                    )}
                                </div>
                            </div>
                            <div className={`col-md-3 ${watch("compensation_mode") === "Per Day" ? "" : "d-none"}`}>
                                <div className="form-group">
                                    <label className="control-label font-weight-semibold">Daily Rate</label>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text">$</span>
                                        </div>
                                        <input {...register("daily_rate")} type="text" className="form-control" placeholder="500" />
                                        <div className="input-group-append">
                                            <span className="input-group-text">CAD</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={`col-md-3 ${watch("compensation_mode") === "Per Hour" ? "" : "d-none"}`}>
                                <div className="form-group">
                                    <label className="control-label font-weight-semibold">Hourly Rate</label>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text">$</span>
                                        </div>
                                        <input {...register("hourly_rate")} type="text" className="form-control" placeholder="50" />
                                        <div className="input-group-append">
                                            <span className="input-group-text">CAD</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={`col-md-3 ${watch("compensation_mode") === "Fixed Contract Value" ? "" : "d-none"}`}>
                                <div className="form-group">
                                    <label className="control-label font-weight-semibold">Contract Value</label>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text">$</span>
                                        </div>
                                        <input {...register("contract_value")} type="text" className="form-control" placeholder="5000" />
                                        <div className="input-group-append">
                                            <span className="input-group-text">CAD</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mission Description - only shown for Fixed Contract Value */}
                        <div className={`row ${watch("compensation_mode") === "Fixed Contract Value" ? "" : "d-none"}`}>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                        <i className="fas fa-tasks mr-2"></i>Mission Description <span className="text-danger">*</span>
                                    </label>
                                    <textarea
                                        {...register("mission_description")}
                                        className={`form-control ${errors?.mission_description ? 'is-invalid' : ''}`}
                                        rows="3"
                                        placeholder="Describe the specific mission (e.g., 'Complete medication review for 50 patients', 'Pharmacy inventory audit and reorganization')"
                                    ></textarea>
                                    {errors?.mission_description && (
                                        <div className="invalid-feedback">{errors.mission_description.message}</div>
                                    )}
                                    <small className="form-text text-muted">
                                        Provide details about the specific mission or procedure that justifies the fixed contract value.
                                    </small>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-semibold">
                                      <i className="fas fa-gift mr-2"></i>Bonus / Incentives
                                    </label>
                                    <select {...register("bonus_incentives")} className="form-control custom-select" style={{height: "45px"}}>
                                        <option value="">Select Option</option>
                                        <option value="yes">✓ Yes - Bonuses Available</option>
                                        <option value="no">✗ No Bonuses</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-semibold">
                                      <i className="fas fa-file-invoice-dollar mr-2"></i>Fees
                                    </label>
                                    <input {...register("fees")} type="text" className="form-control" placeholder="e.g., License renewal, insurance" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Details Card */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-secondary text-white">
                        <h5 className="mb-0"><i className="fas fa-info-circle mr-2"></i>Additional Details</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-semibold">
                                      <i className="fas fa-parking mr-2"></i>Parking
                                    </label>
                                    <input {...register("parking")} type="text" className="form-control" placeholder="Available on-site" />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                      <i className="fas fa-language mr-2"></i>Languages <span className="text-danger">*</span>
                                    </label>
                                    <select {...register("languages")} className={`form-control custom-select ${errors?.languages ? 'is-invalid' : ''}`} multiple style={{height: "120px"}}>
                                        <option value="English">🇬🇧 English</option>
                                        <option value="French">🇫🇷 French</option>
                                        <option value="Spanish">🇪🇸 Spanish</option>
                                    </select>
                                    {errors?.languages && <small className="text-danger d-block mt-1"><i className="fas fa-exclamation-circle mr-1"></i>{errors.languages.message}</small>}
                                    <small className="form-text text-muted">Hold Ctrl (Cmd on Mac) to select multiple</small>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                      <i className="fas fa-laptop-medical mr-2"></i>Software <span className="text-danger">*</span>
                                    </label>
                                    <select {...register("software")} className={`form-control custom-select ${errors?.software ? 'is-invalid' : ''}`} multiple style={{height: "200px"}}>
                                        <option value="AssystRx">AssystRx</option>
                                        <option value="Mentor">Mentor</option>
                                        <option value="PrioRx">PrioRx</option>
                                        <option value="RxPro">RxPro</option>
                                        <option value="Ubik">Ubik</option>
                                        <option value="ReflexRx (XDRx)">ReflexRx (XDRx)</option>
                                        <option value="CGSI/Gesphar">CGSI/Gesphar</option>
                                        <option value="Syphac Option">Syphac Option</option>
                                        <option value="L'Ordonnance (Logipharm)">L'Ordonnance (Logipharm)</option>
                                        <option value="Kroll">Kroll</option>
                                        <option value="Aucun">Aucun</option>
                                        <option value="Synmed (Dispill)">Synmed (Dispill)</option>
                                        <option value="Paratamax (Vial)">Paratamax (Vial)</option>
                                        <option value="Paratamax2 (Vial)">Paratamax2 (Vial)</option>
                                        <option value="Paratamini (Vial)">Paratamini (Vial)</option>
                                        <option value="CountAssist">CountAssist</option>
                                        <option value="AccuCount">AccuCount</option>
                                        <option value="EzCount">EzCount</option>
                                        <option value="Pacmed (Sachet)">Pacmed (Sachet)</option>
                                        <option value="ScriptPro (Vial)">ScriptPro (Vial)</option>
                                        <option value="Pharmaclik">Pharmaclik</option>
                                    </select>
                                    {errors?.software && <small className="text-danger d-block mt-1"><i className="fas fa-exclamation-circle mr-1"></i>{errors.software.message}</small>}
                                    <small className="form-text text-muted">Hold Ctrl (Cmd on Mac) to select multiple</small>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                      <i className="fas fa-file-alt mr-2"></i>Detailed Job Description <span className="text-danger">*</span>
                                    </label>
                                    <textarea {...register("detailed_job_description")} className={`form-control ${errors?.detailed_job_description ? 'is-invalid' : ''}`} rows="7" placeholder="Provide comprehensive job description..."></textarea>
                                    {errors?.detailed_job_description && <div className="invalid-feedback">{errors.detailed_job_description.message}</div>}
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-semibold">
                                      <i className="fas fa-plus-circle mr-2"></i>Additional Information
                                    </label>
                                    <input {...register("additional_info")} type="text" className="form-control" placeholder="e.g., Dress code, PPE required" />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-semibold">
                                      <i className="fas fa-paperclip mr-2"></i>Attachments
                                    </label>
                                    <div className="custom-file">
                                        <input
                                            {...register("attachments")}
                                            type="file"
                                            className="custom-file-input"
                                            id="attachments"
                                            accept=".pdf,.jpg,.png"
                                            onChange={(e) => {
                                                const fileName = e.target.files?.[0]?.name || "Choose file...";
                                                const label = document.querySelector('label[for="attachments"]');
                                                if (label) label.textContent = fileName;
                                            }}
                                        />
                                        <label className="custom-file-label" htmlFor="attachments">
                                            {contract?.attachments ? contract.attachments.split('/').pop() : "Choose file..."}
                                        </label>
                                    </div>
                                    {contract?.attachments && (
                                        <small className="form-text text-muted mt-2">
                                            <a href={`${API_BASE_URL ?? ""}/${contract?.attachments}`} target="_blank" rel="noopener noreferrer" className="text-primary">
                                                <i className="fas fa-download mr-1"></i>Download current attachment
                                            </a>
                                        </small>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Position Sought Card */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-dark text-white">
                        <h5 className="mb-0"><i className="fas fa-user-md mr-2"></i>Position Sought</h5>
                    </div>
                    <div className="card-body">
                        {positionRows?.length > 0 &&
                          positionRows.map((row, index) => {
                            const selectedCategoryId = watch(`position_soughts.${index}.professional_category_id`);
                            const selectedPositions = watch(`position_soughts.${index}.position_ids`, []);

                            // Get positions for the selected category
                            const categoryPositionsForRow = (positions ?? []).filter(
                              item => Number(item.professional_category_id) === Number(selectedCategoryId)
                            );

                            // Filter positions based on currentProvince (from state)
                            let filteredPositions = [];

                            if (currentProvince) {
                              if (currentProvince === "Quebec") {
                                // Quebec-specific positions
                                filteredPositions = categoryPositionsForRow.filter(position =>
                                  ["Pharmacy Technician (ATP)", "Pharmacist", "Pharmacy Clerk"].includes(position.name)
                                );
                              } else {
                                // All other provinces (non-Quebec)
                                filteredPositions = categoryPositionsForRow.filter(position =>
                                  ["Assistant", "Pharmacist", "Pharmacy Clerk", "Technician"].includes(position.name)
                                );
                              }
                            }

                            console.log("Province filtering debug:", {
                              currentProvince,
                              categoryPositionsCount: categoryPositionsForRow.length,
                              categoryPositions: categoryPositionsForRow.map(p => p.name),
                              filteredPositionsCount: filteredPositions.length,
                              filteredPositions: filteredPositions.map(p => p.name)
                            });

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
                                        {(() => {
                                          // Get province from either state OR directly from form (for edit mode)
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
            </>
        );
    }

export default PharmacyTemporaryForm;