import { useState, useEffect } from "react";
import { fetchGeoapifySuggestions } from "../api/geopify";
import { getUserProfileService } from "@services/institute/ProfileService";

// Lucide Icons
import {
    MapPin, Search, Keyboard, Info, ChevronLeft, ChevronRight,
    Stethoscope, Clock, Hammer, FileCheck,
    CircleAlert, Loader2, CalendarDays, MousePointer2, CheckCircle2,
    FileText, AlertTriangle
} from "lucide-react";

// Shadcn UI components
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Button } from "@components/ui/button";
import { Textarea } from "@components/ui/textarea";
import { Checkbox } from "@components/ui/checkbox";
import {Link} from "react-router-dom";

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

    // Local States
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [manualEntry, setManualEntry] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(new Date());
    const [selectedDates, setSelectedDates] = useState([]);
    const [durationMode, setDurationMode] = useState("global");
    const [dateDurations, setDateDurations] = useState({});
    const [isClinicOrPharmacy, setIsClinicOrPharmacy] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

    // Watchers
    const watchCompensationMode = watch("compensation_mode");
    const currentProvince = watch("province");

    // Pre-fill Profile Logic
    useEffect(() => {
        const fetchProfile = async () => {
            if (contract?.id) return;
            try {
                const res = await getUserProfileService();
                const data = res?.data?.data;
                if (data && (String(data.institute_category_id) === "1" || String(data.institute_category_id) === "2")) {
                    setIsClinicOrPharmacy(true);
                    setValue("facility_name", data.name_of_facility);
                    setValue("street_address", data.full_address);
                    setValue("city", data.city);
                    setValue("province", data.province);
                    setValue("postal_code", data.postal_code);
                    setValue("country", "Canada");
                    setManualEntry(true);
                }
            } catch (err) { console.error(err); }
        };
        fetchProfile();
    }, [contract, setValue]);

    // Geoapify Logic
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!searchQuery || searchQuery.length < 3 || manualEntry) return;
            setIsLoadingSuggestions(true);
            try {
                const data = await fetchGeoapifySuggestions(searchQuery);
                setSuggestions(data);
                setShowDropdown(data.length > 0);
            } catch (err) { console.error(err); }
            setIsLoadingSuggestions(false);
        };
        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, manualEntry]);

    const handleSelectSuggestion = (item) => {
        const p = item.properties;
        setValue("facility_name", p.name || p.address_line1 || "");
        setValue("street_address", p.street || p.address_line2 || "");
        setValue("city", p.city || "");
        setValue("province", p.state || p.county || "");
        setValue("postal_code", p.postcode || "");
        setValue("country", p.country || "Canada");
        setSearchQuery("");
        setShowDropdown(false);
    };

    // Calendar Helper functions
    const formatDateLocal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleDateClick = (dateStr) => {
        setSelectedDates(prev => prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]);
    };

    useEffect(() => {
        const sorted = [...selectedDates].sort();
        setValue("selected_dates", JSON.stringify(sorted));
        setValue("start_date", sorted[0] || "");
        setValue("end_date", sorted[sorted.length - 1] || "");
    }, [selectedDates, setValue]);

    return (
        <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="space-y-10 max-w-6xl mx-auto p-4">

            {/* 1. Location Information */}
            <section className="relative border border-slate-200 rounded-lg p-4 sm:p-6 pt-7 sm:pt-8 bg-white shadow-sm">
                <span className="absolute -top-3 left-4 bg-white px-2 text-[13px] sm:text-[15px] text-slate-400 font-normal flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Location Information
                </span>

                {!isClinicOrPharmacy && (
                    <div className="flex justify-end mb-4">
                        <Button
                            variant="outline" size="sm" type="button"
                            onClick={() => {setManualEntry(!manualEntry); setShowDropdown(false);}}
                            className="text-xs border-slate-300 h-8"
                        >
                            {manualEntry ? <><Search className="w-3.5 h-3.5 mr-2"/> Use Search</> : <><Keyboard className="w-3.5 h-3.5 mr-2"/> Enter Manually</>}
                        </Button>
                    </div>
                )}

                {isClinicOrPharmacy && (
                    <div className="mb-6 p-3 rounded-lg bg-blue-50 border border-blue-100 flex items-start gap-3 text-blue-800 text-xs sm:text-sm">
                        <Info className="w-4 h-4 mt-0.5" />
                        <p>Address loaded from your profile. Update it in your
                            <Link to="#" className="underline font-bold">
                                institute profile
                            </Link>.
                        </p>
                    </div>
                )}

                <div className="space-y-6">
                    {!isClinicOrPharmacy && !manualEntry && (
                        <div className="space-y-2 relative">
                            <Label className="text-sm font-medium text-slate-600">Search Address <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    className="!pl-10 h-11 border-slate-200"
                                    placeholder="Type facility name or address..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {isLoadingSuggestions && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-300" />}
                            </div>
                            {showDropdown && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                    {suggestions.map((item) => (
                                        <div
                                            key={item.properties.place_id}
                                            className="p-3 hover:bg-slate-50 cursor-pointer flex items-start gap-3 border-b last:border-0"
                                            onClick={() => handleSelectSuggestion(item)}
                                        >
                                            <MapPin className="w-4 h-4 mt-1 text-blue-500" />
                                            <div className="text-sm">
                                                <p className="font-bold text-slate-700">{item.properties.name || item.properties.address_line1}</p>
                                                <p className="text-slate-500 text-xs">{item.properties.formatted}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">Facility/ Clinic Name <span className="text-red-500">*</span></Label>
                            <Input {...register("facility_name")} readOnly={!manualEntry} className={`h-11 ${!manualEntry ? "bg-slate-50" : ""}`} />
                            {errors?.facility_name && <p className="text-xs text-red-500 mt-1">{errors.facility_name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">Street Address</Label>
                            <Input {...register("street_address")} readOnly={!manualEntry} className={`h-11 ${!manualEntry ? "bg-slate-50" : ""}`} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">City <span className="text-red-500">*</span></Label>
                            <Input {...register("city")} readOnly={!manualEntry} className={`h-11 ${!manualEntry ? "bg-slate-50" : ""}`} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">Province <span className="text-red-500">*</span></Label>
                            {manualEntry && !isClinicOrPharmacy ? (
                                <select {...register("province")} className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none">
                                    <option value="">Select Province</option>
                                    <option value="Ontario">Ontario (ON)</option>
                                    <option value="Quebec">Quebec (QC)</option>
                                    <option value="Alberta">Alberta (AB)</option>
                                    {/* ... more provinces */}
                                </select>
                            ) : (
                                <Input {...register("province")} readOnly className="h-11 bg-slate-50" />
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">Postal Code</Label>
                            <Input {...register("postal_code")} readOnly={!manualEntry} className={`h-11 ${!manualEntry ? "bg-slate-50" : ""}`} />
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Select Dates Section */}
            <section className="relative border border-slate-200 rounded-lg p-4 sm:p-6 pt-7 sm:pt-8 bg-white shadow-sm">
                <span className="absolute -top-3 left-4 bg-white px-2 text-[13px] sm:text-[15px] text-slate-400 font-normal flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" /> Select Dates
                </span>

                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <Button variant="ghost" size="sm" type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}>
                            <ChevronLeft className="w-4 h-4 mr-1"/> Prev
                        </Button>
                        <h4 className="text-sm font-bold text-slate-700">
                            {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h4>
                        <Button variant="ghost" size="sm" type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}>
                            Next <ChevronRight className="w-4 h-4 ml-1"/>
                        </Button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-[11px] font-bold text-slate-400 uppercase py-2">{day}</div>
                        ))}
                        {(() => {
                            const year = calendarMonth.getFullYear();
                            const month = calendarMonth.getMonth();
                            const firstDay = new Date(year, month, 1).getDay();
                            const daysInMonth = new Date(year, month + 1, 0).getDate();
                            const elements = [];

                            for (let i = 0; i < firstDay; i++) elements.push(<div key={`empty-${i}`} />);

                            for (let day = 1; day <= daysInMonth; day++) {
                                const dateStr = formatDateLocal(new Date(year, month, day));
                                const isSelected = selectedDates.includes(dateStr);
                                const isHoliday = CANADA_HOLIDAYS.includes(dateStr);
                                elements.push(
                                    <button
                                        key={dateStr}
                                        type="button"
                                        disabled={isHoliday}
                                        onClick={() => handleDateClick(dateStr)}
                                        className={`h-9 sm:h-11 w-full rounded-md border text-sm transition-all flex items-center justify-center font-medium
                                            ${isHoliday ? 'bg-red-50 border-red-100 text-red-300 cursor-not-allowed' :
                                            isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-md' :
                                                'bg-white border-slate-100 text-slate-600 hover:border-blue-300 hover:bg-blue-50'}
                                        `}
                                    >
                                        {day}
                                    </button>
                                );
                            }
                            return elements;
                        })()}
                    </div>

                    <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <div className="w-3 h-3 rounded bg-blue-600" /> Selected
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <div className="w-3 h-3 rounded bg-red-100" /> Holiday (Blocked)
                        </div>
                    </div>

                    {selectedDates.length > 0 && (
                        <div className="bg-slate-50 p-4 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                            <p className="text-sm font-semibold text-slate-700">
                                <CheckCircle2 className="w-4 h-4 inline mr-2 text-green-500"/>
                                {selectedDates.length} Date(s) selected
                            </p>
                            <Button variant="ghost" size="sm" type="button" onClick={() => setSelectedDates([])} className="text-xs text-red-500 h-7">Clear All</Button>
                        </div>
                    )}
                    {errors?.start_date && <p className="text-xs text-red-500 flex items-center gap-1"><CircleAlert className="w-3 h-3"/> Please select at least one date.</p>}
                </div>
            </section>

            {/* 3. Specialty Details */}
            <section className="relative border border-slate-200 rounded-lg p-4 sm:p-6 pt-7 sm:pt-8 bg-white shadow-sm">
                <span className="absolute -top-3 left-4 bg-white px-2 text-[13px] sm:text-[15px] text-slate-400 font-normal flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5" /> Specialty Details
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-600">Position Title <span className="text-red-500">*</span></Label>
                        <select {...register("position_title")} className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none">
                            <option value="">Select Position</option>
                            <option value="Surgical">Surgical</option>
                            <option value="Complex Evaluation">Complex Evaluation</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors?.position_title && <p className="text-xs text-red-500">{errors.position_title.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-600">Required Specialty <span className="text-red-500">*</span></Label>
                        <Input {...register("required_specialty")} placeholder="e.g. Endodontics" className="h-11 border-slate-200" />
                        {errors?.required_specialty && <p className="text-xs text-red-500">{errors.required_specialty.message}</p>}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Mission Objective / Required Procedure <span className="text-red-500">*</span></Label>
                    <Textarea {...register("mission_objective")} placeholder="Detailed objective of the mission..." className="min-h-[100px] border-slate-200" />
                </div>
            </section>

            {/* 4. Duration & Compensation */}
            <section className="relative border border-slate-200 rounded-lg p-4 sm:p-6 pt-7 sm:pt-8 bg-white shadow-sm">
                <span className="absolute -top-3 left-4 bg-white px-2 text-[13px] sm:text-[15px] text-slate-400 font-normal flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Duration & Compensation
                </span>

                <div className="space-y-8">
                    {/* Duration Mode Toggle */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium text-slate-600">Duration Configuration</Label>
                        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg  w-full">
                            <button
                                type="button"
                                onClick={() => setDurationMode("global")}
                                className={`py-2 text-xs font-bold !rounded-md transition-all ${durationMode === 'global' ? 'bg-white  text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Same for All
                            </button>
                            <button
                                type="button"
                                onClick={() => setDurationMode("per_date")}
                                className={`py-2 text-xs font-bold !rounded-md transition-all ${durationMode === 'per_date' ? 'bg-white  text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Different per Date
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Side: Hours Input */}
                        <div className="space-y-4">
                            {durationMode === "global" ? (
                                <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-xl space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-slate-500">Start Hour</Label>
                                            <Input type="time" {...register("estimated_duration.start_hour")} className="h-10" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-slate-500">End Hour</Label>
                                            <Input type="time" {...register("estimated_duration.end_hour")} className="h-10" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                                    {selectedDates.sort().map(date => (
                                        <div key={date} className="p-3 border border-slate-200 rounded-lg flex items-center gap-4 bg-white shadow-sm">
                                            <span className="text-xs font-bold text-slate-700 min-w-[90px]">{date}</span>
                                            <Input type="time" placeholder="Start" className="h-9 text-xs" />
                                            <Input type="time" placeholder="End" className="h-9 text-xs" />
                                        </div>
                                    ))}
                                    {selectedDates.length === 0 && <p className="text-xs text-slate-400 text-center py-10">Select dates from calendar first.</p>}
                                </div>
                            )}
                        </div>

                        {/* Right Side: Compensation */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-600">Compensation Mode <span className="text-red-500">*</span></Label>
                                <select {...register("compensation_mode")} className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-100">
                                    <option value="">Select Mode</option>
                                    <option value="Per Hour">Per Hour</option>
                                    <option value="Fixed Contract Value">Fixed Contract Value</option>
                                </select>
                            </div>

                            {watchCompensationMode === "Per Hour" && (
                                <div className="space-y-2 animate-in slide-in-from-top-2">
                                    <Label className="text-sm font-medium text-slate-600">Hourly Rate (CAD $)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                                        <Input type="number" step="0.01" {...register("hourly_rate")} className="!pl-8 h-11 border-slate-200" placeholder="0.00" />
                                    </div>
                                </div>
                            )}

                            {watchCompensationMode === "Fixed Contract Value" && (
                                <div className="space-y-4 animate-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-600">Contract Value (CAD $)</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                                            <Input type="number" step="0.01" {...register("contract_value")} className="!pl-8 h-11 border-slate-200" placeholder="0.00" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-600 text-xs font-bold uppercase text-slate-400 tracking-wider">Mission Description</Label>
                                        <Textarea {...register("mission_description")} placeholder="Describe the fixed mission (e.g. 4 wisdom teeth extraction)..." />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Additional Requirements */}
            <section className="relative border border-slate-200 rounded-lg p-4 sm:p-6 pt-7 sm:pt-8 bg-white shadow-sm">
                <span className="absolute -top-3 left-4 bg-white px-2 text-[13px] sm:text-[15px] text-slate-400 font-normal !flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5" /> Requirements
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-600 !flex items-center gap-2"><Hammer className="w-4 h-4 text-slate-400" /> Equipment / Room Provided?</Label>
                        <select {...register("equipment_room")} className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm focus:ring-2 focus:ring-blue-100">
                            <option value="">Select Option</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-600 !flex items-center gap-2"><FileText className="w-4 h-4 text-slate-400" /> Required Consent / Docs?</Label>
                        <select {...register("required_documents")} className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm focus:ring-2 focus:ring-blue-100">
                            <option value="">Select Option</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* 6. Position Sought */}
            <section className="relative border border-slate-200 rounded-lg p-4 sm:p-6 pt-7 sm:pt-8 bg-white shadow-sm">
                <span className="absolute -top-3 left-4 bg-white px-2 text-[13px] sm:text-[15px] text-slate-400 font-normal flex items-center gap-1">
                    <MousePointer2 className="w-3.5 h-3.5" /> Position Sought
                </span>

                {positionRows.map((row, index) => {
                    const selectedPositions = watch(`position_soughts.${index}.position_ids`) || [];
                    const specialistDentistPos = positions?.find(p => p.name === "Specialist Dentist");
                    const isSpecialistSelected = specialistDentistPos && selectedPositions.some(id => Number(id) === Number(specialistDentistPos.id));

                    return (
                        <div key={row.id} className="space-y-8 animate-in fade-in duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-600">Professional Category <span className="text-red-500">*</span></Label>
                                    <Input disabled value="Dental Care" className="h-11 bg-slate-50 border-slate-200" />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                        Position Sought <span className="text-red-500">*</span>
                                    </Label>

                                    {/* Dropdown Select */}
                                    <select
                                        className={`flex h-11 w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                                            errors?.position_soughts?.[index]?.position_ids
                                                ? "border-red-500 focus:ring-red-100"
                                                : "border-slate-200 focus:ring-blue-100"
                                        }`}
                                        value={selectedPositions[0] || ""} // প্রথম আইডি টা ভ্যালু হিসেবে নিচ্ছে
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            // ফর্ম ভ্যালু আপডেট করছে (অ্যারে হিসেবে)
                                            setValue(`position_soughts.${index}.position_ids`, val ? [val] : [], { shouldValidate: true });

                                            // স্পেশালিস্ট চেক লজিক (যদি স্পেশালিস্ট ডেন্টিস্ট সিলেক্ট হয়)
                                            const specialistDentistPos = positions?.find(p => p.name === "Specialist Dentist");
                                            if (specialistDentistPos && Number(val) !== Number(specialistDentistPos.id)) {
                                                setValue(`position_soughts.${index}.specialist_dentist_role`, "");
                                            }
                                        }}
                                    >
                                        <option value="">Select a position...</option>
                                        {(positions || [])
                                            .filter(p => Number(p.professional_category_id) === Number(watch(`position_soughts.${index}.professional_category_id`)))
                                            .map(pos => (
                                                <option key={pos.id} value={pos.id}>
                                                    {pos.name}
                                                </option>
                                            ))
                                        }
                                    </select>

                                    {/* Error Message */}
                                    {errors?.position_soughts?.[index]?.position_ids && (
                                        <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium mt-1">
                                            <AlertTriangle className="w-3 h-3" /> Please select a position.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {isSpecialistSelected && (
                                <div className="  animate-in slide-in-from-left-4">
                                    <div className="flex items-center gap-2 mb-2 text-blue-700 font-bold text-sm">
                                        <Stethoscope className="w-4 h-4"/> Specialist Role
                                        <span className="text-red-500">*</span>
                                    </div>
                                    <select
                                        {...register(`position_soughts.${index}.specialist_dentist_role`)}
                                        className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="">Choose Specialty...</option>
                                        <option value="orthodontist">Orthodontist</option>
                                        <option value="endodontist">Endodontist</option>
                                        <option value="periodontist">Periodontist</option>
                                        <option value="pediatric dentist">Pediatric Dentist</option>
                                        <option value="prosthodontist">Prosthodontist</option>
                                        <option value="oral and maxillofacial surgeon">Oral & Maxillofacial Surgeon</option>
                                    </select>
                                    {errors?.position_soughts?.[index]?.specialist_dentist_role && (
                                        <p className="text-xs text-red-500 mt-2">{errors.position_soughts[index].specialist_dentist_role.message}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </section>
        </form>
    );
}

export default SpecialtyDentistryForm;