import React, { useState, useEffect } from "react";
import { fetchGeoapifySuggestions } from "../api/geopify";
import { getUserProfileService } from "@services/institute/ProfileService";

const GeneralPracticeTemporaryForm = ({ ContractFormHook }) => {
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
        "2025-01-01", "2025-04-18", "2025-04-21", "2025-05-19", "2025-06-24",
        "2025-07-01", "2025-08-04", "2025-09-01", "2025-09-30", "2025-10-13",
        "2025-11-11", "2025-12-25", "2025-12-26", "2026-01-01", "2026-04-03",
        "2026-04-06", "2026-05-18", "2026-06-24", "2026-07-01", "2026-08-03",
        "2026-09-07", "2026-09-30", "2026-10-12", "2026-11-11", "2026-12-25",
        "2026-12-26",
    ];

    // Watch compensation mode for dynamic label and reset
    const compensationMode = watch("compensation_mode");

    // Get dynamic label based on compensation mode
    const getRateLabel = () => {
        switch(compensationMode) {
            case "Fixed Contract Value":
                return "Contract Value";
            case "Per Hour":
                return "Hourly Rate";
            case "Per Day":
                return "Daily Rate";
            default:
                return "Rate Amount";
        }
    };

    // Checkbox states for multi-select fields
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedSoftware, setSelectedSoftware] = useState([]);
    const [selectedLanguages, setSelectedLanguages] = useState([]);

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

    // Calendar states
    const [calendarMonth, setCalendarMonth] = useState(new Date());
    const [selectedDates, setSelectedDates] = useState([]);
    const [timeSlots, setTimeSlots] = useState({});
    const [applyToAll, setApplyToAll] = useState(false);
    const [masterTimeSlot, setMasterTimeSlot] = useState({ start_time: "09:00", end_time: "17:00" });
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Helper function to format date as YYYY-MM-DD
    const formatDateLocal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
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

    // Handle remove date
    const handleRemoveDate = (dateStr) => {
        const updatedDates = selectedDates.filter(d => d !== dateStr);
        setSelectedDates(updatedDates);
        setValue("selected_dates", JSON.stringify(updatedDates));
    };

    // Clear all dates
    const handleClearAllDates = () => {
        setSelectedDates([]);
        setValue("selected_dates", "");
        setValue("start_date", "");
        setValue("end_date", "");
    };

    // Fetch address suggestions
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

    // Sync selected dates with start_date and end_date
    useEffect(() => {
        if (selectedDates.length > 0) {
            const sortedDates = [...selectedDates].sort();
            // Don't validate during initial load to prevent false validation errors
            const shouldValidate = !isInitialLoad;
            setValue("start_date", sortedDates[0], { shouldValidate, shouldDirty: !isInitialLoad });
            setValue("end_date", sortedDates[sortedDates.length - 1], { shouldValidate, shouldDirty: !isInitialLoad });
            setValue("selected_dates", JSON.stringify(sortedDates), { shouldValidate: false, shouldDirty: !isInitialLoad });
        } else {
            setValue("start_date", "", { shouldValidate: false });
            setValue("end_date", "", { shouldValidate: false });
            setValue("selected_dates", "", { shouldValidate: false });
        }
    }, [selectedDates, setValue, isInitialLoad]);
    // Reset all rate fields when compensation mode changes
    useEffect(() => {
        if (compensationMode && contract?.compensation_mode !== compensationMode) {
            setValue("hourly_rate", "");
            setValue("contract_value", "");
            setValue("daily_rate", "");
        }
    }, [compensationMode, contract?.compensation_mode, setValue]);
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

                    // Mark initial load as complete after a short delay
                    setTimeout(() => {
                        setIsInitialLoad(false);
                    }, 200);
                }
            } catch (error) {
                console.error("Error loading selected dates:", error);
            }
        }
    }, [contract, setValue]);

    // Initialize checkbox states from contract
    useEffect(() => {
        if (contract) {
            if (contract.required_skills) {
                const skills = Array.isArray(contract.required_skills) ? contract.required_skills : [];
                setSelectedSkills(skills);
            }
            if (contract.software_skills) {
                const software = Array.isArray(contract.software_skills) ? contract.software_skills : [];
                setSelectedSoftware(software);
            }
            if (contract.languages) {
                const langs = Array.isArray(contract.languages) ? contract.languages : [];
                setSelectedLanguages(langs);
            }
        }
    }, [contract]);

    // Load time slots from contract when editing
    useEffect(() => {
        if (contract?.time_slots) {
            try {
                const slots = typeof contract.time_slots === 'string'
                    ? JSON.parse(contract.time_slots)
                    : contract.time_slots;

                if (Array.isArray(slots) && slots.length > 0) {
                    // Convert array to object format: { "2025-11-13": { start_time: "09:00", end_time: "17:00" } }
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

                    // Check if all time slots are identical
                    const timeValues = Object.values(slotsObject);
                    if (timeValues.length > 1) {
                        const firstSlot = timeValues[0];
                        const allIdentical = timeValues.every(slot =>
                            slot.start_time === firstSlot.start_time &&
                            slot.end_time === firstSlot.end_time
                        );

                        if (allIdentical) {
                            // All time slots are the same, so set applyToAll to true
                            setApplyToAll(true);
                            setMasterTimeSlot({
                                start_time: firstSlot.start_time,
                                end_time: firstSlot.end_time
                            });
                            console.log("✅ Detected identical time slots - Apply to all enabled:", firstSlot);
                        }
                    }

                    console.log("✅ Time slots loaded:", slotsObject);
                }
            } catch (error) {
                console.error("Error loading time slots:", error);
            }
        }
    }, [contract, setValue]);

    // Sync checkbox states with form
    useEffect(() => {
        setValue("required_skills", selectedSkills);
    }, [selectedSkills, setValue]);

    useEffect(() => {
        setValue("software_skills", selectedSoftware);
    }, [selectedSoftware, setValue]);

    useEffect(() => {
        setValue("languages", selectedLanguages);
    }, [selectedLanguages, setValue]);

    // Toggle functions for checkboxes
    const toggleSkill = (skill) => {
        setSelectedSkills(prev =>
            prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
        );
    };

    const toggleSoftware = (software) => {
        setSelectedSoftware(prev =>
            prev.includes(software) ? prev.filter(s => s !== software) : [...prev, software]
        );
    };

    const toggleLanguage = (language) => {
        setSelectedLanguages(prev =>
            prev.includes(language) ? prev.filter(l => l !== language) : [...prev, language]
        );
    };

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
                    console.log("Loaded existing time slots:", slotsObject);
                }
            } catch (error) {
                console.error("Error loading time slots:", error);
            }
        }
    }, [contract?.time_slots]);

    // Handle address selection
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

    // Auto-set General Medicine category and Family Physician position
    useEffect(() => {
        if (professionalCategories?.length > 0 && positions?.length > 0) {
            const generalMedicine = professionalCategories.find((c) =>
                c.name === "General Medicine" || c.name === "General Practice"
            );

            if (generalMedicine) {
                setValue(`position_soughts.0.professional_category_id`, generalMedicine.id.toString());

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

                .badge-custom {
                    font-size: 0.85rem;
                    padding: 0.5rem 0.75rem;
                    display: inline-flex;
                    align-items: center;
                }

                .card {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                .card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .card {
                    animation: fadeIn 0.3s ease;
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
                {/* Contract Name Header */}
                <div className="card shadow-sm mb-4 border-primary">
                    <div className="card-header bg-gradient-primary text-white">
                        <h4 className="mb-0">
                            <i className="fas fa-file-contract mr-2"></i>
                            General Practice - Temporary Staffing Contract
                        </h4>
                    </div>
                </div>

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
                                            placeholder="Type facility name or address (e.g., Toronto Medical Clinic)"
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
                                        <i className="fas fa-clinic-medical mr-2"></i>Facility Name
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
                                        <i className="fas fa-clinic-medical mr-2"></i>Facility Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        {...register("facility_name")}
                                        type="text"
                                        className={`form-control ${isClinicOrPharmacy ? 'bg-light' : ''} ${errors?.facility_name ? 'is-invalid' : ''}`}
                                        placeholder="Enter facility name"
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
                                                <option value="Newfoundland and Labrador">🐟 Newfoundland and Labrador (NL)</option>
                                                <option value="Northwest Territories">❄️ Northwest Territories (NT)</option>
                                                <option value="Nova Scotia">⚓ Nova Scotia (NS)</option>
                                                <option value="Nunavut">🐻‍❄️ Nunavut (NU)</option>
                                                <option value="Ontario">🏙️ Ontario (ON)</option>
                                                <option value="Prince Edward Island">🥔 Prince Edward Island (PE)</option>
                                                <option value="Quebec">⚜️ Quebec (QC)</option>
                                                <option value="Saskatchewan">🌻 Saskatchewan (SK)</option>
                                                <option value="Yukon">🏔️ Yukon (YT)</option>
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
                                                placeholder="A1A 1A1"
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
                            </>
                        )}
                    </div>
                </div>

                {/* Contract Dates Card with Calendar */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-success text-white">
                        <h5 className="mb-0"><i className="fas fa-calendar-alt mr-2"></i>Contract Duration</h5>
                    </div>
                    <div className="card-body">
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
                                                    // Select all weekdays in current month
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
                                                        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday) {
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
                                                    // Select entire month
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

                                        {/* Hidden inputs for form submission */}
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

                {/* Schedule & Breaks Card */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-warning text-dark">
                        <h5 className="mb-0"><i className="fas fa-mug-hot mr-2"></i>Break Information</h5>
                    </div>
                    <div className="card-body">
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
                    </div>
                </div>

                {/* Skills & Requirements Card */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-info text-white">
                        <h5 className="mb-0"><i className="fas fa-clipboard-list mr-2"></i>Skills & Requirements</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                        <i className="fas fa-stethoscope mr-2"></i>Required Skills <span className="text-danger">*</span>
                                    </label>
                                    <div className="border rounded p-3 bg-light">
                                        {["First Line", "Minor Emergencies", "Chronic Disease Follow-up", "Geriatrics", "Pediatrics"].map((skill) => (
                                            <div key={skill} className="custom-control custom-checkbox mb-2">
                                                <input
                                                    type="checkbox"
                                                    className="custom-control-input"
                                                    id={`skill-${skill.replace(/\s+/g, '-')}`}
                                                    checked={selectedSkills.includes(skill)}
                                                    onChange={() => toggleSkill(skill)}
                                                />
                                                <label className="custom-control-label" htmlFor={`skill-${skill.replace(/\s+/g, '-')}`}>
                                                    {skill}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors?.required_skills && (
                                        <div className="text-danger small mt-2">
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
                                    <div className="border rounded p-3 bg-light">
                                        {["Omnimed", "Medesync", "Telus PS Suite", "Oscar EMR", "Medesys", "Nightingale", "Plexia"].map((software) => (
                                            <div key={software} className="custom-control custom-checkbox mb-2">
                                                <input
                                                    type="checkbox"
                                                    className="custom-control-input"
                                                    id={`software-${software.replace(/\s+/g, '-')}`}
                                                    checked={selectedSoftware.includes(software)}
                                                    onChange={() => toggleSoftware(software)}
                                                />
                                                <label className="custom-control-label" htmlFor={`software-${software.replace(/\s+/g, '-')}`}>
                                                    {software}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors?.software_skills && (
                                        <div className="text-danger small mt-2">
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
                                        <i className="fas fa-user-clock mr-2"></i>Minimum Experience <span className="text-danger">*</span>
                                    </label>
                                    <select {...register("minimum_experience")} className={`form-control custom-select ${errors?.minimum_experience ? 'is-invalid' : ''}`} style={{height: "45px"}}>
                                        <option value="">Select Experience</option>
                                        <option value="1 year">1 year</option>
                                        <option value="2 years">2 years</option>
                                        <option value="5 years">5 years</option>
                                        <option value="10+ years">10+ years</option>
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
                                        <i className="fas fa-language mr-2"></i>Languages <span className="text-danger">*</span>
                                    </label>
                                    <div className="border rounded p-3 bg-light">
                                        {["French", "English", "Bilingual FR-EN", "Other"].map((language) => (
                                            <div key={language} className="custom-control custom-checkbox mb-2">
                                                <input
                                                    type="checkbox"
                                                    className="custom-control-input"
                                                    id={`language-${language.replace(/\s+/g, '-')}`}
                                                    checked={selectedLanguages.includes(language)}
                                                    onChange={() => toggleLanguage(language)}
                                                />
                                                <label className="custom-control-label" htmlFor={`language-${language.replace(/\s+/g, '-')}`}>
                                                    {language}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors?.languages && (
                                        <div className="text-danger small mt-2">
                                            <i className="fas fa-exclamation-circle mr-1"></i>
                                            {errors.languages.message}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Compensation Card */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-success text-white">
                        <h5 className="mb-0"><i className="fas fa-dollar-sign mr-2"></i>Compensation</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                        <i className="fas fa-credit-card mr-2"></i>Compensation Mode <span className="text-danger">*</span>
                                    </label>
                                    <select {...register("compensation_mode")} className={`form-control custom-select ${errors?.compensation_mode ? 'is-invalid' : ''}`} style={{height: "45px"}}>
                                        <option value="">Select Compensation Mode</option>
                                        <option value="Per Hour">⏰ Per Hour</option>
                                        <option value="Per Day">📅 Per Day</option>
                                        <option value="Fixed Contract Value">💰 Fixed Contract Value</option>
                                    </select>
                                    {errors?.compensation_mode && (
                                        <div className="invalid-feedback">
                                            <i className="fas fa-exclamation-circle mr-1"></i>
                                            {errors.compensation_mode.message}
                                        </div>
                                    )}
                                    {compensationMode === "Fixed Contract Value" && (
                                        <small className="form-text text-info">
                                            <i className="fas fa-info-circle mr-1"></i>
                                            Use for specific missions (e.g., specialized procedures, consultations). The value should represent the total contract value from start date to end date.
                                        </small>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label font-weight-bold">
                                        <i className="fas fa-money-bill-wave mr-2"></i>{getRateLabel()} <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text">$</span>
                                        </div>
                                        <input
                                            {...register(
                                                compensationMode === "Fixed Contract Value" ? "contract_value" :
                                                compensationMode === "Per Day" ? "daily_rate" :
                                                "hourly_rate"
                                            )}
                                            type="text"
                                            className={`form-control ${
                                                (compensationMode === "Fixed Contract Value" && errors?.contract_value) ||
                                                (compensationMode === "Per Day" && errors?.daily_rate) ||
                                                (compensationMode === "Per Hour" && errors?.hourly_rate) ||
                                                (!compensationMode && errors?.hourly_rate)
                                                ? 'is-invalid' : ''
                                            }`}
                                            placeholder={`Enter ${getRateLabel().toLowerCase()}`}
                                        />
                                        {((compensationMode === "Fixed Contract Value" && errors?.contract_value) ||
                                          (compensationMode === "Per Day" && errors?.daily_rate) ||
                                          (compensationMode === "Per Hour" && errors?.hourly_rate) ||
                                          (!compensationMode && errors?.hourly_rate)) && (
                                            <div className="invalid-feedback">
                                                <i className="fas fa-exclamation-circle mr-1"></i>
                                                {errors?.contract_value?.message || errors?.daily_rate?.message || errors?.hourly_rate?.message}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mission Description - only shown for Fixed Contract Value */}
                        {compensationMode === "Fixed Contract Value" && (
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <label className="control-label font-weight-bold">
                                            <i className="fas fa-tasks mr-2"></i>Mission Description <span className="text-danger">*</span>
                                        </label>
                                        <textarea
                                            {...register("mission_description")}
                                            className={`form-control ${errors?.mission_description ? 'is-invalid' : ''}`}
                                            rows="3"
                                            placeholder="Describe the specific mission or procedure (e.g., 'Specialized consultation for complex case', 'Specific medical procedure')"
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
                        )}

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

export default GeneralPracticeTemporaryForm;