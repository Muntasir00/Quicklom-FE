import React, {useState, useEffect} from "react";
import {fetchGeoapifySuggestions} from "../api/geopify";
import {getUserProfileService} from "@services/institute/ProfileService";
import PositionSoughtSection from "@components/forms/general-dentistry/PositionSoughtSection.jsx";
import AdditionalDetails from "@components/forms/general-dentistry/AdditionalDetails.jsx";
import CompensationSection from "@components/forms/general-dentistry/CompensationSection.jsx";
import WorkScheduleSection from "@components/forms/general-dentistry/WorkScheduleSection.jsx";
import ContractDurationSection from "@components/forms/general-dentistry/ContractDurationSection.jsx";
import LocationInformation from "@components/forms/general-dentistry/LocationInformation.jsx";

const GeneralDentistryTemporaryForm = ({ContractFormHook}) => {

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
    useEffect(() => {
        const subscription = watch((value, {name}) => {
            if (name === 'compensation_mode') {
                // Clear all rate fields when compensation mode changes
                setValue('daily_rate', '');
                setValue('hourly_rate', '');
                setValue('contract_value', '');
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, setValue]);
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [manualEntry, setManualEntry] = useState(false);
    const [selectedDates, setSelectedDates] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [timeSlots, setTimeSlots] = useState({});
    const [applyToAll, setApplyToAll] = useState(false);
    const [masterTimeSlot, setMasterTimeSlot] = useState({start_time: "09:00", end_time: "17:00"});
    const [isClinicOrPharmacy, setIsClinicOrPharmacy] = useState(false);
    const [addressPreFilled, setAddressPreFilled] = useState(false);

    const [calendarMonth, setCalendarMonth] = useState(new Date());

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

    // Load selected dates from contract when editing
    useEffect(() => {
        if (contract?.data?.selected_dates) {
            try {
                // If selected_dates is a string (JSON), parse it
                const dates = typeof contract.data.selected_dates === 'string'
                    ? JSON.parse(contract.data.selected_dates)
                    : contract.data.selected_dates;

                if (Array.isArray(dates) && dates.length > 0) {
                    setSelectedDates(dates);
                    setValue("selected_dates", JSON.stringify(dates));

                    // Set calendar to show the first selected date's month
                    const firstDate = new Date(dates[0]);
                    setCalendarMonth(firstDate);

                    console.log("Loaded existing selected dates:", dates);
                }
            } catch (error) {
                console.error("Error loading selected dates:", error);
            }
        } else if (contract?.data?.start_date && contract?.data?.end_date) {
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

            const dates = generateRange(contract.data.start_date, contract.data.end_date);
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
            setValue("time_slots", jsonString, {shouldValidate: false});
            console.log("Time slots synced to form:", jsonString);
        } else {
            setValue("time_slots", "", {shouldValidate: false});
            console.log("Time slots cleared from form");
        }
    }, [timeSlots, setValue]);

    // Initialize time slots for newly selected dates
    useEffect(() => {
        if (selectedDates.length > 0) {
            setTimeSlots(prevSlots => {
                const newSlots = {...prevSlots};
                selectedDates.forEach(date => {
                    if (!newSlots[date]) {
                        newSlots[date] = applyToAll ? {...masterTimeSlot} : {start_time: "09:00", end_time: "17:00"};
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
                newSlots[date] = {...masterTimeSlot};
            });
            setTimeSlots(newSlots);
        }
    }, [applyToAll, masterTimeSlot]);
    // Load existing time slots when editing
    useEffect(() => {
        if (contract?.data?.time_slots) {
            try {
                const slots = typeof contract.data.time_slots === 'string'
                    ? JSON.parse(contract.data.time_slots)
                    : contract.data.time_slots;

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

                    // Check if all time slots are the same
                    const uniqueSlots = new Set(
                        slots.map(slot => `${slot.start_time}-${slot.end_time}`)
                    );

                    // If all time slots have the same times, enable "apply to all"
                    if (uniqueSlots.size === 1 && slots.length > 0) {
                        const firstSlot = slots[0];
                        setApplyToAll(true);
                        setMasterTimeSlot({
                            start_time: firstSlot.start_time,
                            end_time: firstSlot.end_time
                        });
                        console.log("All time slots are the same - enabled 'apply to all'");
                    }
                }
            } catch (error) {
                console.error("Error loading time slots:", error);
            }
        }
    }, [contract?.data?.time_slots]);
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

    // Function to generate date range

    // Remove a specific date
    const handleRemoveDate = (dateToRemove) => {
        const updatedDates = selectedDates.filter(date => date !== dateToRemove);
        setSelectedDates(updatedDates);
        setValue("selected_dates", JSON.stringify(updatedDates));
    };

    // Clear all dates
    const handleClearAllDates = () => {
        setSelectedDates([]);
        setValue("selected_dates", "");
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

    // Sync selected dates with start_date and end_date for form compatibility
    useEffect(() => {
        if (selectedDates.length > 0) {
            const sortedDates = [...selectedDates].sort();

            // Set start_date and end_date with proper validation flags
            setValue("start_date", sortedDates[0], {shouldValidate: true, shouldDirty: true});
            setValue("end_date", sortedDates[sortedDates.length - 1], {shouldValidate: true, shouldDirty: true});
            setValue("selected_dates", JSON.stringify(sortedDates), {shouldValidate: false, shouldDirty: true});

            // Log for debugging
            console.log("Selected dates updated:", {
                selected_dates: sortedDates,
                start_date: sortedDates[0],
                end_date: sortedDates[sortedDates.length - 1]
            });
        } else {
            // Clear the fields if no dates selected
            setValue("start_date", "", {shouldValidate: false});
            setValue("end_date", "", {shouldValidate: false});
            setValue("selected_dates", "", {shouldValidate: false});
        }
    }, [selectedDates, setValue]);

    useEffect(() => {
        if (professionalCategories?.length > 0) {
            const dental = professionalCategories.find((c) => c.name === "Dental Care");
            if (dental) {
                positionRows.forEach((_, index) => {
                    setValue(`position_soughts.${index}.professional_category_id`, dental.id);
                });
            }
        }
    }, [professionalCategories, positionRows]);

    // Note: Removed auto-selection of all positions - user should manually select position

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

    return (
        <>
            <form id={FORM_ID ?? ""} onSubmit={handleSubmit(
                (data) => {
                    console.log("=== FORM SUBMISSION DATA ===");
                    console.log("Full form data:", data);
                    console.log("selected_dates:", data.selected_dates);
                    console.log("start_date:", data.start_date);
                    console.log("end_date:", data.end_date);
                    if (data.selected_dates) {
                        console.log("Parsed selected_dates:", JSON.parse(data.selected_dates));
                    }
                    console.log("attachments:", data.attachments);
                    console.log("additional_info:", data.additional_info);
                    console.log("============================");
                    return onSubmit(data);
                },
                (errors) => {
                    console.log("=== FORM VALIDATION ERRORS ===");
                    console.log("Validation errors:", errors);
                    console.log("Error fields:", Object.keys(errors));
                    Object.keys(errors).forEach(field => {
                        console.log(`${field}:`, errors[field].message);
                    });
                    console.log("============================");
                }
            )}>
                {/* Location Information Card */}

                <LocationInformation
                    register={register}
                    errors={errors}
                    searchQuery={searchQuery}
                    handleInputChange={handleInputChange}
                    showDropdown={showDropdown}
                    handleManualEntryToggle={handleManualEntryToggle}
                    manualEntry={manualEntry}
                    suggestions={suggestions}
                    handleSelectSuggestion={handleSelectSuggestion}
                    isClinicOrPharmacy={isClinicOrPharmacy}
                />

                {/* Contract Dates Card */}
                <ContractDurationSection
                    contract={contract} errors={errors} register={register}
                    setValue={setValue} watch={watch} applyToAll={applyToAll} setApplyToAll={setApplyToAll}
                    calendarMonth={calendarMonth} CANADA_HOLIDAYS={CANADA_HOLIDAYS} setCalendarMonth={setCalendarMonth}
                    selectedDates={selectedDates}
                    timeSlots={timeSlots}
                    formatDateDisplay={formatDateDisplay}
                    formatDateLocal={formatDateLocal}
                    groupConsecutiveDates={groupConsecutiveDates}
                    handleClearAllDates={handleClearAllDates}
                    handleRemoveDate={handleRemoveDate}
                    masterTimeSlot={masterTimeSlot}
                    setTimeSlots={setTimeSlots}
                    setMasterTimeSlot={setMasterTimeSlot}
                    setSelectedDates={setSelectedDates}
                />

                {/* Work Schedule Card */}
                <WorkScheduleSection errors={errors} watch={watch} register={register}/>

                {/* Compensation Card */}
                <CompensationSection register={register} setValue={setValue} errors={errors} watch={watch}/>

                {/* Additional Details Card */}
                <AdditionalDetails
                    watch={watch} errors={errors} register={register} setValue={setValue}
                    API_BASE_URL={API_BASE_URL}
                    contract={contract}
                    selectedFile={selectedFile} setSelectedFile={setSelectedFile}/>

                {/* Position Sought Card */}
                <PositionSoughtSection
                    errors={errors?.errors}
                    positionRows={positionRows} positions={positions} setValue={setValue} watch={watch}
                    register={register} professionalCategories={professionalCategories}
                />

            </form>
        </>
    );
}

export default GeneralDentistryTemporaryForm;