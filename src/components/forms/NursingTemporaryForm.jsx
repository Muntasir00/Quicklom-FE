import React, { useState, useEffect } from "react";
import { fetchGeoapifySuggestions } from "../api/geopify";
import { getUserProfileService } from "@services/institute/ProfileService";

const NursingTemporaryForm = ({ ContractFormHook }) => {
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

    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [manualEntry, setManualEntry] = useState(false);
    const [selectedDates, setSelectedDates] = useState([]);
    const [calendarMonth, setCalendarMonth] = useState(new Date());
    const [timeSlots, setTimeSlots] = useState({});
    const [applyToAll, setApplyToAll] = useState(false);
    const [masterTimeSlot, setMasterTimeSlot] = useState({ start_time: "09:00", end_time: "17:00" });
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

    // Load selected dates from contract when editing
    useEffect(() => {
        if (contract?.selected_dates) {
            try {
                const dates = typeof contract.selected_dates === 'string'
                    ? JSON.parse(contract.selected_dates)
                    : contract.selected_dates;

                if (Array.isArray(dates) && dates.length > 0) {
                    setSelectedDates(dates);
                    setValue("selected_dates", JSON.stringify(dates));
                    const firstDate = new Date(dates[0]);
                    setCalendarMonth(firstDate);
                }
            } catch (error) {
                console.error("Error loading selected dates:", error);
            }
        } else if (contract?.start_date && contract?.end_date) {
            const generateRange = (start, end) => {
                const dates = [];
                const startDate = new Date(start);
                const endDate = new Date(end);

                for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
                    const dateStr = formatDateLocal(date);
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
    // Load existing time slots when editing
    useEffect(() => {
        if (contract?.time_slots) {
            try {
                const slots = typeof contract.time_slots === 'string'
                    ? JSON.parse(contract.time_slots)
                    : contract.time_slots;

                if (Array.isArray(slots) && slots.length > 0) {
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
                    console.log("Loaded existing time slots:", slotsObject);

                    // Check if all time slots are identical
                    const timeValues = Object.values(slotsObject);
                    if (timeValues.length > 1) {
                        const firstSlot = timeValues[0];
                        const allIdentical = timeValues.every(slot =>
                            slot.start_time === firstSlot.start_time &&
                            slot.end_time === firstSlot.end_time
                        );

                        if (allIdentical) {
                            setApplyToAll(true);
                            setMasterTimeSlot({
                                start_time: firstSlot.start_time,
                                end_time: firstSlot.end_time
                            });
                        }
                    }
                }
            } catch (error) {
                console.error("Error loading time slots:", error);
            }
        }
    }, [contract?.time_slots]);

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

    // Calendar functions
    const toggleDateSelection = (dateStr) => {
        setSelectedDates(prev => {
            const newDates = prev.includes(dateStr)
                ? prev.filter(d => d !== dateStr)
                : [...prev, dateStr].sort();

            // Don't set values here - let the useEffect handle it
            return newDates;
        });
    };

    // Select all weekdays in current month
    const selectAllWeekdays = () => {
        const year = calendarMonth.getFullYear();
        const month = calendarMonth.getMonth();
        const lastDay = new Date(year, month + 1, 0).getDate();
        const weekdays = [];

        for (let day = 1; day <= lastDay; day++) {
            const date = new Date(year, month, day);
            const dateStr = formatDateLocal(date);
            const dayOfWeek = date.getDay();
            const isHoliday = CANADA_HOLIDAYS.includes(dateStr);

            // Add weekdays (Monday-Friday, i.e., dayOfWeek 1-5) that are not holidays
            if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday) {
                weekdays.push(dateStr);
            }
        }

        setSelectedDates(prev => {
            const combined = [...new Set([...prev, ...weekdays])].sort();
            return combined;
        });
    };

    // Clear all selected dates
    const clearAllDates = () => {
        setSelectedDates([]);
    };

    const isDateSelected = (dateStr) => selectedDates.includes(dateStr);
    const isHoliday = (dateStr) => CANADA_HOLIDAYS.includes(dateStr);

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }
        return days;
    };

    const changeMonth = (increment) => {
        setCalendarMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + increment);
            return newDate;
        });
    };

    const monthYear = calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
    const daysInMonth = getDaysInMonth(calendarMonth);

    // Get nursing positions for the dropdown
    const nursingCategory = professionalCategories?.find(cat => cat.name === "Nursing and Home Care");
    const nursingPositions = nursingCategory
        ? positions?.filter(pos => Number(pos.professional_category_id) === Number(nursingCategory.id))
        : [];

    return (
        <>
        <style>
            {`
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
            `}
        </style>
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
                                    <i className="fas fa-road mr-2"></i>Street Address <span className="text-danger">*</span>
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
                                    <i className="fas fa-mail-bulk mr-2"></i>Postal Code <span className="text-danger">*</span>
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
                                    <i className="fas fa-globe mr-2"></i>Country <span className="text-danger">*</span>
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

            {/* Date Selection Card with Calendar */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-dark text-white">
                    <h5 className="mb-0"><i className="fas fa-calendar-alt mr-2"></i>Select Working Dates</h5>
                </div>
                <div className="card-body">
                    <div className="alert alert-info">
                        <i className="fas fa-info-circle mr-2"></i>
                        <strong>Instructions:</strong> Click on dates to select or deselect working days.
                        Holidays are highlighted in yellow and cannot be selected.
                        <div className="mt-2">
                            <small><strong>Selected Dates:</strong> {selectedDates.length} days</small>
                        </div>
                    </div>

                    <div className="calendar-container">
                        <div className="calendar-header">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => changeMonth(-1)}
                            >
                                <i className="fas fa-chevron-left"></i> Previous
                            </button>
                            <h5 className="mb-0">{monthYear}</h5>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => changeMonth(1)}
                            >
                                Next <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>

                        <div className="calendar-grid">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="calendar-day-header">{day}</div>
                            ))}

                            {daysInMonth.map((date, idx) => {
                                if (!date) {
                                    return <div key={`empty-${idx}`} className="calendar-day disabled"></div>;
                                }

                                const dateStr = formatDateLocal(date);
                                const selected = isDateSelected(dateStr);
                                const holiday = isHoliday(dateStr);

                                return (
                                    <div
                                        key={dateStr}
                                        className={`calendar-day ${selected ? 'selected' : ''} ${holiday ? 'holiday disabled' : ''}`}
                                        onClick={() => !holiday && toggleDateSelection(dateStr)}
                                        title={holiday ? 'Canadian Holiday' : dateStr}
                                    >
                                        {date.getDate()}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-3 d-flex gap-2 justify-content-between">
                            <div>
                                <button
                                    type="button"
                                    className="btn btn-outline-success btn-sm mr-2"
                                    onClick={selectAllWeekdays}
                                >
                                    <i className="fas fa-briefcase mr-1"></i>
                                    Select All Weekdays
                                </button>
                                {selectedDates.length > 0 && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={clearAllDates}
                                    >
                                        <i className="fas fa-times mr-1"></i>
                                        Clear All
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="legend mt-2">
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

                    {errors?.selected_dates && (
                        <small className="text-danger d-block mt-2">
                            <i className="fas fa-exclamation-circle mr-1"></i>
                            {errors.selected_dates.message}
                        </small>
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

                    <input type="hidden" {...register("selected_dates")} />
                    <input type="hidden" {...register("start_date")} />
                    <input type="hidden" {...register("end_date")} />
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

                        <input type="hidden" {...register("time_slots")} />
                    </div>
                </div>
            )}

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
                                    <i className="fas fa-clock mr-2"></i>Shifts <span className="text-danger">*</span>
                                </label>
                                <select {...register("shifts")} className={`form-control ${errors?.shifts ? 'is-invalid' : ''}`} multiple>
                                    <option value="Day">Day</option>
                                    <option value="Evening">Evening</option>
                                    <option value="Night">Night</option>
                                    <option value="Weekend">Weekend</option>
                                    <option value="Rotation">Rotation</option>
                                </select>
                                {errors?.shifts && (
                                    <small className="text-danger d-block mt-1">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.shifts.message}
                                    </small>
                                )}
                            </div>
                        </div>
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
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-4">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-mug-hot mr-2"></i>Break Included
                                </label>
                                <select {...register("break_included")} className="form-control custom-select">
                                    <option value="">Select Option</option>
                                    <option value="yes">✓ Yes (with duration)</option>
                                    <option value="no">✗ No Break</option>
                                </select>
                            </div>
                        </div>
                        <div className={`col-md-4 ${watch("break_included") === "yes" ? "" : "d-none"}`}>
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    Break Duration {watch("break_included") === "yes" && <span className="text-danger">*</span>}
                                </label>
                                <input
                                    {...register("break_duration")}
                                    type="text"
                                    className={`form-control ${errors?.break_duration ? 'is-invalid' : ''}`}
                                    placeholder="e.g., 30 minutes"
                                />
                                {errors?.break_duration && (
                                    <div className="invalid-feedback">{errors.break_duration.message}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="row">
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
                            </div>
                        </div>
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
                    </div>

                    <div className="row">
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
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="control-label font-weight-bold">
                                    <i className="fas fa-dollar-sign mr-2"></i>Compensation Mode <span className="text-danger">*</span>
                                </label>
                                <select {...register("compensation_mode")} className={`form-control ${errors?.compensation_mode ? 'is-invalid' : ''}`}>
                                    <option value="">Select Compensation Mode</option>
                                    <option value="Per Hour">⏰ Per Hour</option>
                                    <option value="Per Day">📅 Per Day</option>
                                    <option value="Fixed Contract Value">💰 Fixed Contract Value</option>
                                </select>
                                {errors?.compensation_mode && (
                                    <small className="text-danger d-block mt-1">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {errors.compensation_mode.message}
                                    </small>
                                )}
                                {watch("compensation_mode") === "Fixed Contract Value" && (
                                    <small className="form-text text-info">
                                        <i className="fas fa-info-circle mr-1"></i>
                                        Use for specific nursing missions (e.g., special assignments, project-based care). The value should represent the total contract value from start date to end date.
                                    </small>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Conditional Compensation Fields */}
                    <div className="row">
                        {watch("compensation_mode") === "Per Hour" && (
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                        <i className="fas fa-money-bill-wave mr-2"></i>Hourly Rate (CAD $) <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        {...register("hourly_rate")}
                                        type="number"
                                        step="0.01"
                                        className={`form-control ${errors?.hourly_rate ? 'is-invalid' : ''}`}
                                        placeholder="Enter hourly rate"
                                    />
                                    {errors?.hourly_rate && (
                                        <small className="text-danger d-block mt-1">
                                            <i className="fas fa-exclamation-circle mr-1"></i>
                                            {errors.hourly_rate.message}
                                        </small>
                                    )}
                                </div>
                            </div>
                        )}
                        {watch("compensation_mode") === "Per Day" && (
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                        <i className="fas fa-money-bill-wave mr-2"></i>Daily Rate (CAD $) <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        {...register("daily_rate")}
                                        type="number"
                                        step="0.01"
                                        className={`form-control ${errors?.daily_rate ? 'is-invalid' : ''}`}
                                        placeholder="Enter daily rate"
                                    />
                                    {errors?.daily_rate && (
                                        <small className="text-danger d-block mt-1">
                                            <i className="fas fa-exclamation-circle mr-1"></i>
                                            {errors.daily_rate.message}
                                        </small>
                                    )}
                                </div>
                            </div>
                        )}
                        {watch("compensation_mode") === "Fixed Contract Value" && (
                            <>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="control-label font-weight-bold">
                                            <i className="fas fa-money-bill-wave mr-2"></i>Contract Value (CAD $) <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            {...register("contract_value")}
                                            type="number"
                                            step="0.01"
                                            className={`form-control ${errors?.contract_value ? 'is-invalid' : ''}`}
                                            placeholder="Enter total contract value"
                                        />
                                        {errors?.contract_value && (
                                            <small className="text-danger d-block mt-1">
                                                <i className="fas fa-exclamation-circle mr-1"></i>
                                                {errors.contract_value.message}
                                            </small>
                                        )}
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <label className="control-label font-weight-bold">
                                            <i className="fas fa-tasks mr-2"></i>Mission Description <span className="text-danger">*</span>
                                        </label>
                                        <textarea
                                            {...register("mission_description")}
                                            className={`form-control ${errors?.mission_description ? 'is-invalid' : ''}`}
                                            rows="3"
                                            placeholder="Describe the specific nursing mission or assignment (e.g., 'Special care assignment for post-operative patients', 'Short-term project-based nursing support')"
                                        ></textarea>
                                        {errors?.mission_description && (
                                            <div className="invalid-feedback">{errors.mission_description.message}</div>
                                        )}
                                        <small className="form-text text-muted">
                                            Provide details about the specific mission or assignment that justifies the fixed contract value.
                                        </small>
                                    </div>
                                </div>
                            </>
                        )}
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
                                    <i className="fas fa-check-circle mr-2"></i>Compliance
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
                                        {...register("compliance.confidentiality")}
                                        type="checkbox"
                                        className="custom-control-input"
                                        id="confidentiality"
                                    />
                                    <label className="custom-control-label" htmlFor="confidentiality">
                                        LPRPDE Confidentiality
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
        </>
    );
}

export default NursingTemporaryForm;