import React, {useEffect, useMemo, useState} from "react";
import {fetchGeoapifySuggestions} from "../api/geopify";
import {getUserProfileService} from "@services/institute/ProfileService";

import {Button} from "@components/ui/button";
import {Input} from "@components/ui/input";
import {Label} from "@components/ui/label";
import {Textarea} from "@components/ui/textarea";
import {Checkbox} from "@components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/ui/select";
import {Separator} from "@components/ui/separator";

import {
    MapPin,
    Search,
    Keyboard,
    Building2,
    Landmark,
    Mailbox,
    Globe2,
    Info,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Copy,
    Clock,
    Briefcase,
    FileText,
    DollarSign,
    Download,
    UploadCloud,
    X,
    AlertTriangle, ChevronDown,
} from "lucide-react";

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

    // Canadian holidays (same as your list)
    const CANADA_HOLIDAYS = useMemo(
        () => [
            "2025-01-01",
            "2025-04-18",
            "2025-04-21",
            "2025-05-19",
            "2025-06-24",
            "2025-07-01",
            "2025-08-04",
            "2025-09-01",
            "2025-09-30",
            "2025-10-13",
            "2025-11-11",
            "2025-12-25",
            "2025-12-26",
            "2026-01-01",
            "2026-04-03",
            "2026-04-06",
            "2026-05-18",
            "2026-06-24",
            "2026-07-01",
            "2026-08-03",
            "2026-09-07",
            "2026-09-30",
            "2026-10-12",
            "2026-11-11",
            "2026-12-25",
            "2026-12-26",
        ],
        []
    );

    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [manualEntry, setManualEntry] = useState(false);

    const [calendarMonth, setCalendarMonth] = useState(new Date());
    const [selectedDates, setSelectedDates] = useState([]);
    const [timeSlots, setTimeSlots] = useState({});
    const [applyToAll, setApplyToAll] = useState(false);
    const [masterTimeSlot, setMasterTimeSlot] = useState({
        start_time: "09:00",
        end_time: "17:00",
    });
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const [isClinicOrPharmacy, setIsClinicOrPharmacy] = useState(false);
    const [currentProvince, setCurrentProvince] = useState("");

    // ========= Attachments: preview + remove =========
    const attachmentWatch = watch("attachments");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    useEffect(() => {
        const value = attachmentWatch;

        if (!value || (value instanceof FileList && value.length === 0)) {
            setSelectedFile(null);
            setPreviewUrl("");
            return;
        }

        if (value instanceof FileList && value.length > 0) {
            const file = value[0];
            setSelectedFile(file);

            if (file?.type?.startsWith("image/")) {
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
                return () => URL.revokeObjectURL(url);
            } else {
                setPreviewUrl("");
            }
        }
    }, [attachmentWatch]);

    const removeSelectedFile = () => {
        setValue("attachments", null, {shouldValidate: true});
        setSelectedFile(null);
        setPreviewUrl("");
    };

    // ========= Profile prefill =========
    useEffect(() => {
        const fetchProfileAndPrefillAddress = async () => {
            if (contract?.id) return; // only create mode

            try {
                const profileResponse = await getUserProfileService();
                const profileData = profileResponse?.data?.data;

                if (!profileData) return;

                const categoryId = String(profileData.institute_category_id);

                if (categoryId === "1" || categoryId === "2") {
                    setIsClinicOrPharmacy(true);

                    if (profileData.name_of_facility) setValue("facility_name", profileData.name_of_facility);
                    if (profileData.full_address) setValue("street_address", profileData.full_address);
                    if (profileData.city) setValue("city", profileData.city);
                    if (profileData.province) setValue("province", profileData.province);
                    if (profileData.postal_code) setValue("postal_code", profileData.postal_code);

                    setValue("country", "Canada");
                    setManualEntry(true);
                }
            } catch (error) {
                console.error("Error fetching profile for address pre-fill:", error);
            }
        };

        fetchProfileAndPrefillAddress();
    }, [contract, setValue]);

    // ========= Helpers =========
    const formatDateLocal = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    const formatDateDisplay = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric"});
    };

    const groupConsecutiveDates = (dates) => {
        if (!dates?.length) return [];
        const sorted = [...dates].sort();
        const groups = [];
        let current = [sorted[0]];
        for (let i = 1; i < sorted.length; i++) {
            const prev = new Date(sorted[i - 1]);
            const curr = new Date(sorted[i]);
            const diff = (curr - prev) / (1000 * 60 * 60 * 24);
            if (diff === 1) current.push(sorted[i]);
            else {
                groups.push(current);
                current = [sorted[i]];
            }
        }
        groups.push(current);
        return groups;
    };

    const handleClearAllDates = () => {
        setSelectedDates([]);
        setValue("selected_dates", "");
    };

    const handleRemoveDate = (dateToRemove) => {
        const updated = selectedDates.filter((d) => d !== dateToRemove);
        setSelectedDates(updated);
        setValue("selected_dates", updated.length ? JSON.stringify(updated) : "");
    };

    // ========= Geo suggestions =========
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
                setShowDropdown(Array.isArray(data) && data.length > 0);
            } catch (err) {
                console.error("Error fetching location suggestions:", err);
            }
        };

        const t = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const handleSelectSuggestion = (item) => {
        const props = item?.properties ?? {};
        const facilityName = props.name || props.address_line1 || "";

        if (facilityName) setValue("facility_name", facilityName);
        setValue("street_address", props.street || props.address_line2 || "");
        setValue("city", props.city || "");
        setValue("province", props.state || props.county || "");
        setValue("postal_code", props.postcode || "");
        setValue("country", props.country || "Canada");
        setValue("contract_location", props.formatted || "");

        setSearchQuery("");
        setSuggestions([]);
        setShowDropdown(false);
        setManualEntry(false);
    };

    const toggleManualEntry = () => {
        setManualEntry((p) => !p);
        setShowDropdown(false);
        setSearchQuery("");

        // reset if switching to search mode
        if (manualEntry) return;

        setValue("facility_name", "");
        setValue("street_address", "");
        setValue("city", "");
        setValue("province", "");
        setValue("postal_code", "");
        setValue("contract_location", "");
    };

    // ========= Sync selected dates -> form fields =========
    useEffect(() => {
        if (selectedDates.length > 0) {
            const sorted = [...selectedDates].sort();
            const shouldValidate = !isInitialLoad;

            setValue("start_date", sorted[0], {shouldValidate, shouldDirty: !isInitialLoad});
            setValue("end_date", sorted[sorted.length - 1], {shouldValidate, shouldDirty: !isInitialLoad});
            setValue("selected_dates", JSON.stringify(sorted), {shouldValidate: false, shouldDirty: !isInitialLoad});
        } else {
            setValue("start_date", "", {shouldValidate: false});
            setValue("end_date", "", {shouldValidate: false});
            setValue("selected_dates", "", {shouldValidate: false});
        }
    }, [selectedDates, setValue, isInitialLoad]);

    // ========= Sync timeSlots -> form =========
    useEffect(() => {
        if (Object.keys(timeSlots).length > 0) {
            const slotsArray = Object.entries(timeSlots).map(([date, times]) => ({
                date,
                start_time: times.start_time,
                end_time: times.end_time,
            }));
            setValue("time_slots", JSON.stringify(slotsArray), {shouldValidate: false});
        } else {
            setValue("time_slots", "", {shouldValidate: false});
        }
    }, [timeSlots, setValue]);

    // init time slots for selected dates
    useEffect(() => {
        if (selectedDates.length > 0) {
            setTimeSlots((prev) => {
                const next = {...prev};
                selectedDates.forEach((date) => {
                    if (!next[date]) next[date] = applyToAll ? {...masterTimeSlot} : {
                        start_time: "09:00",
                        end_time: "17:00"
                    };
                });
                Object.keys(next).forEach((d) => {
                    if (!selectedDates.includes(d)) delete next[d];
                });
                return next;
            });
        } else setTimeSlots({});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDates]);

    useEffect(() => {
        if (applyToAll && selectedDates.length > 0) {
            const next = {};
            selectedDates.forEach((d) => (next[d] = {...masterTimeSlot}));
            setTimeSlots(next);
        }
    }, [applyToAll, masterTimeSlot, selectedDates]);

    // ========= Category set Pharmacy =========
    useEffect(() => {
        if (professionalCategories?.length > 0) {
            const pharmacy = professionalCategories.find((c) => c.name === "Pharmacy");
            if (pharmacy) {
                positionRows.forEach((_, index) => {
                    setValue(`position_soughts.${index}.professional_category_id`, pharmacy.id);
                });
            }
        }
    }, [professionalCategories, positionRows, setValue]);

    // ========= Province watch (and clear positions) =========
    useEffect(() => {
        const sub = watch((value, {name}) => {
            if (name === "province") {
                setCurrentProvince(value?.province || "");
                positionRows.forEach((_, index) => setValue(`position_soughts.${index}.position_ids`, []));
            }
        });
        return () => sub.unsubscribe();
    }, [watch, positionRows, setValue]);

    useEffect(() => {
        const p = watch("province");
        if (p) setCurrentProvince(p);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ========= Load selected dates/time slots on edit =========
    useEffect(() => {
        if (contract?.selected_dates) {
            try {
                const dates = typeof contract.selected_dates === "string" ? JSON.parse(contract.selected_dates) : contract.selected_dates;
                if (Array.isArray(dates) && dates.length > 0) {
                    setSelectedDates(dates);
                    setCalendarMonth(new Date(dates[0]));
                    setTimeout(() => setIsInitialLoad(false), 200);
                }
            } catch (e) {
                console.error("Error loading selected dates:", e);
            }
        }
    }, [contract?.selected_dates]);

    useEffect(() => {
        if (contract?.time_slots) {
            try {
                const slots = typeof contract.time_slots === "string" ? JSON.parse(contract.time_slots) : contract.time_slots;
                if (Array.isArray(slots) && slots.length > 0) {
                    const obj = {};
                    slots.forEach((s) => {
                        if (s.date) obj[s.date] = {start_time: s.start_time, end_time: s.end_time};
                    });
                    setTimeSlots(obj);

                    const unique = [...new Set(slots.map((s) => `${s.start_time}-${s.end_time}`))];
                    if (unique.length === 1 && slots.length > 1) {
                        setApplyToAll(true);
                        setMasterTimeSlot({start_time: slots[0].start_time, end_time: slots[0].end_time});
                    } else setApplyToAll(false);
                }
            } catch (e) {
                console.error("Error loading time slots:", e);
            }
        }
    }, [contract?.time_slots]);

    // ========= Derived: calendar cells =========
    const calendarCells = useMemo(() => {
        const current = calendarMonth;
        const year = current.getFullYear();
        const month = current.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDow = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        const cells = [];

        for (let i = 0; i < startDow; i++) cells.push({type: "empty", key: `e-${i}`});

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = formatDateLocal(date);
            const isSelected = selectedDates.includes(dateStr);
            const isToday = dateStr === formatDateLocal(new Date());
            const isHoliday = CANADA_HOLIDAYS.includes(dateStr);
            cells.push({type: "day", key: dateStr, dateStr, day, isSelected, isToday, isHoliday});
        }

        return cells;
    }, [calendarMonth, selectedDates, CANADA_HOLIDAYS]);

    // ========= Province options =========
    const provinceOptions = useMemo(
        () => [
            {v: "Alberta", label: "Alberta (AB)"},
            {v: "British Columbia", label: "British Columbia (BC)"},
            {v: "Manitoba", label: "Manitoba (MB)"},
            {v: "New Brunswick", label: "New Brunswick (NB)"},
            {v: "Newfoundland and Labrador", label: "Newfoundland and Labrador (NL)"},
            {v: "Northwest Territories", label: "Northwest Territories (NT)"},
            {v: "Nova Scotia", label: "Nova Scotia (NS)"},
            {v: "Nunavut", label: "Nunavut (NU)"},
            {v: "Ontario", label: "Ontario (ON)"},
            {v: "Prince Edward Island", label: "Prince Edward Island (PE)"},
            {v: "Quebec", label: "Quebec (QC)"},
            {v: "Saskatchewan", label: "Saskatchewan (SK)"},
            {v: "Yukon", label: "Yukon (YT)"},
        ],
        []
    );

    const SOFTWARE_OPTIONS = [
        "AssystRx", "Mentor", "PrioRx", "RxPro", "Ubik", "ReflexRx (XDRx)", "CGSI/Gesphar", "Syphac Option",
        "L'Ordonnance (Logipharm)", "Kroll", "Aucun", "Synmed (Dispill)", "Paratamax (Vial)", "Paratamax2 (Vial)",
        "Paratamini (Vial)", "CountAssist", "AccuCount", "EzCount", "Pacmed (Sachet)", "ScriptPro (Vial)", "Pharmaclik",
    ];


    return (
        <form id={FORM_ID ?? ""} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Header (edit mode) */}
            {contract && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600"/>
                        <h3 className="text-base font-semibold text-slate-800">
                            {contract.contract_name || "Pharmacy Temporary Contract"}
                        </h3>
                    </div>
                </div>
            )}

            {/* Location */}
            <section className="relative border border-slate-200 rounded-lg p-4 sm:p-6 pt-7 sm:pt-8 bg-white">
                <span
                    className="absolute -top-3 left-4 bg-white px-2 text-[13px] sm:text-[15px] text-slate-400 font-normal flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5"/> Location Information
                </span>

                {isClinicOrPharmacy && (
                    <div
                        className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 flex items-start gap-2">
                        <Info className="h-4 w-4 mt-0.5"/>
                        <div>
                            <span className="font-semibold">Address loaded from your profile.</span>{" "}
                            To modify, update your institute profile.
                        </div>
                    </div>
                )}

                {!isClinicOrPharmacy && (
                    <div className="flex justify-end">
                        <Button type="button" variant="outline" size="sm" onClick={toggleManualEntry} className="gap-2">
                            {manualEntry ? <Search className="h-4 w-4"/> : <Keyboard className="h-4 w-4"/>}
                            {manualEntry ? "Use Address Search" : "Enter Manually"}
                        </Button>
                    </div>
                )}

                {!isClinicOrPharmacy && !manualEntry && (
                    <div className="mt-4 space-y-2">
                        <Label
                            className="text-[14px] sm:text-[15px] font-medium text-slate-600 !flex items-center gap-2">
                            <Search className="h-4 w-4 text-blue-500"/>
                            Search Address <span className="text-red-500">*</span>
                        </Label>

                        <div className="relative">
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Type pharmacy name or address (e.g., PharmaChoice, Toronto)"
                                className="h-11"
                                autoComplete="off"
                            />
                            {showDropdown && suggestions?.length > 0 && (
                                <div
                                    className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                                    <div className="max-h-[320px] overflow-auto">
                                        {suggestions.map((item) => (
                                            <button
                                                type="button"
                                                key={item?.properties?.place_id ?? Math.random()}
                                                onClick={() => handleSelectSuggestion(item)}
                                                className="w-full text-left px-4 py-3 hover:bg-slate-50 transition flex gap-3 border-b last:border-b-0"
                                            >
                                                <MapPin className="h-5 w-5 text-blue-600 mt-0.5"/>
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-slate-800 truncate">
                                                        {item?.properties?.name || item?.properties?.address_line1 || "Selected location"}
                                                    </div>
                                                    <div className="text-xs text-slate-500 truncate">
                                                        {item?.properties?.formatted}
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-slate-400 mt-1 ml-auto shrink-0"/>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <input type="hidden" {...register("contract_location")} />
                    </div>
                )}

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <Label
                            className="text-[14px] sm:text-[15px] font-medium text-slate-600 !flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-blue-500"/>
                            Facility/Pharmacy Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            {...register("facility_name")}
                            readOnly={isClinicOrPharmacy || !manualEntry}
                            className={`h-11 ${errors?.facility_name ? "border-red-500" : ""} ${isClinicOrPharmacy ? "bg-slate-50" : ""}`}
                            placeholder="Enter pharmacy or facility name"
                        />
                        {errors?.facility_name && (
                            <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                                <AlertTriangle className="w-3 h-3"/> {errors.facility_name.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label
                            className="text-[14px] sm:text-[15px] font-medium text-slate-600 !flex items-center gap-2">
                            <Landmark className="h-4 w-4 text-blue-500"/>
                            Street Address
                        </Label>
                        <Input
                            {...register("street_address")}
                            readOnly={isClinicOrPharmacy || !manualEntry}
                            className={`h-11 ${errors?.street_address ? "border-red-500" : ""} ${isClinicOrPharmacy ? "bg-slate-50" : ""}`}
                            placeholder="123 Main Street"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label
                            className="text-[14px] sm:text-[15px] font-medium text-slate-600 !flex items-center gap-2">
                            <Landmark className="h-4 w-4 text-blue-500"/>
                            City <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            {...register("city")}
                            readOnly={isClinicOrPharmacy || !manualEntry}
                            className={`h-11 ${errors?.city ? "border-red-500" : ""} ${isClinicOrPharmacy ? "bg-slate-50" : ""}`}
                            placeholder="Toronto"
                        />
                        {errors?.city && (
                            <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                                <AlertTriangle className="w-3 h-3"/> {errors.city.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">
                            Province <span className="text-red-500">*</span>
                        </Label>

                        {/* Province: shadcn Select */}
                        <Select
                            value={watch("province") || ""}
                            onValueChange={(v) => setValue("province", v, {shouldValidate: true})}
                            disabled={isClinicOrPharmacy}
                        >
                            <SelectTrigger
                                className={`!h-11 w-full !rounded-lg  ${errors?.province ? "border-red-500" : ""} ${isClinicOrPharmacy ? "bg-slate-50" : ""}`}>
                                <SelectValue placeholder="Select Province"/>
                            </SelectTrigger>
                            <SelectContent>
                                {provinceOptions.map((p) => (
                                    <SelectItem key={p.v} value={p.v}>
                                        {p.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {errors?.province && (
                            <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                                <AlertTriangle className="w-3 h-3"/> {errors.province.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label
                            className="text-[14px] sm:text-[15px] font-medium text-slate-600 !flex items-center gap-2">
                            <Mailbox className="h-4 w-4 text-blue-500"/>
                            Postal Code
                        </Label>
                        <Input
                            {...register("postal_code")}
                            readOnly={isClinicOrPharmacy || !manualEntry}
                            className={`h-11 ${errors?.postal_code ? "border-red-500" : ""} ${isClinicOrPharmacy ? "bg-slate-50" : ""}`}
                            placeholder="M5H 2N2"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label
                            className="text-[14px] sm:text-[15px] font-medium text-slate-600 !flex items-center gap-2">
                            <Globe2 className="h-4 w-4 text-blue-500"/>
                            Country
                        </Label>
                        <Input
                            {...register("country")}
                            readOnly
                            className="h-11 bg-slate-50"
                            value="Canada"
                        />
                    </div>
                </div>

                <input type="hidden" {...register("contract_location")} />
            </section>

            {/* Contract Duration + Calendar */}
            <section className="relative border border-slate-200 rounded-lg p-4 sm:p-6 pt-7 sm:pt-8 bg-white">
                  <span
                      className="absolute -top-3 left-4 bg-white px-2 text-[13px] sm:text-[15px] text-slate-400 font-normal flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5"/> Contract Duration
                  </span>

                <div className="space-y-4">
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                        <Info className="h-4 w-4 mt-0.5"/>
                        <div>Click calendar days to select/deselect. Holidays are blocked.</div>
                    </div>

                    {/* Calendar wrapper like screenshot */}
                    <div className="w-full rounded-lg border border-slate-200 bg-white">
                        {/* Header */}
                        <div
                            className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100">
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-9 w-9 p-0 text-slate-500 hover:text-slate-700"
                                onClick={() => {
                                    const d = new Date(calendarMonth);
                                    d.setMonth(d.getMonth() - 1);
                                    setCalendarMonth(d);
                                }}
                            >
                                <ChevronLeft className="h-5 w-5"/>
                            </Button>

                            <div className="text-sm sm:text-base font-semibold text-slate-700">
                                {calendarMonth.toLocaleDateString("en-US", {month: "long", year: "numeric"})}
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                className="h-9 w-9 p-0 text-slate-500 hover:text-slate-700"
                                onClick={() => {
                                    const d = new Date(calendarMonth);
                                    d.setMonth(d.getMonth() + 1);
                                    setCalendarMonth(d);
                                }}
                            >
                                <ChevronRight className="h-5 w-5"/>
                            </Button>
                        </div>

                        {/* Week header */}
                        <div
                            className="grid grid-cols-7 px-4 sm:px-6 pt-4 text-[11px] sm:text-xs font-semibold text-slate-400">
                            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
                                <div key={d} className="text-center py-2">
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Cells */}
                        <div className="grid grid-cols-7 gap-y-3 px-4 sm:px-6 pb-5">
                            {calendarCells.map((c) => {
                                if (c.type === "empty") return <div key={c.key}/>;

                                const isSelected = c.isSelected;
                                const isHoliday = c.isHoliday;

                                const base =
                                    "h-10 sm:h-11 flex items-center justify-center rounded-lg text-sm font-medium transition-all select-none";

                                // screenshot style:
                                // holiday = solid red pill
                                const holidayClass = "bg-rose-500 text-white cursor-not-allowed opacity-95";

                                // selected = light blue + blue border
                                const selectedClass = "bg-sky-100/70 border border-sky-400 text-slate-700";

                                // available = normal hover
                                const availableClass =
                                    "bg-transparent text-slate-600 hover:bg-slate-50 border border-transparent";

                                const todayRing = c.isToday ? "ring-1 ring-slate-200" : "";

                                return (
                                    <button
                                        key={c.key}
                                        type="button"
                                        disabled={isHoliday}
                                        title={isHoliday ? "Canadian Holiday (Blocked)" : c.dateStr}
                                        className={[
                                            base,
                                            todayRing,
                                            isHoliday ? holidayClass : isSelected ? selectedClass : availableClass,
                                        ].join(" ")}
                                        onClick={() => {
                                            if (isHoliday) return;

                                            if (isSelected) handleRemoveDate(c.dateStr);
                                            else {
                                                const updated = [...selectedDates, c.dateStr].sort();
                                                setSelectedDates(updated);
                                                setValue("selected_dates", JSON.stringify(updated));
                                            }
                                        }}
                                    >
                                        {c.day}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Footer: legend + actions like screenshot */}
                        <div
                            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-t border-slate-100 px-4 sm:px-6 py-4">
                            {/* Legend */}
                            <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500">
                                <div className="flex items-center gap-2">
                                    <span className="h-5 w-5 rounded-md bg-sky-100 border border-sky-400"/>
                                    <span>Selected</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="h-5 w-5 rounded-md bg-rose-500"/>
                                    <span>Holiday (Blocked)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="h-5 w-5 rounded-md bg-white border border-slate-200"/>
                                    <span>Available</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex !flex-wrap items-center gap-3 justify-start lg:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const current = calendarMonth;
                                        const year = current.getFullYear();
                                        const month = current.getMonth();
                                        const lastDay = new Date(year, month + 1, 0).getDate();
                                        const weekdays = [];

                                        for (let day = 1; day <= lastDay; day++) {
                                            const date = new Date(year, month, day);
                                            const dateStr = formatDateLocal(date);
                                            const dow = date.getDay();
                                            const isHoliday = CANADA_HOLIDAYS.includes(dateStr);
                                            if (dow !== 0 && dow !== 6 && !isHoliday) weekdays.push(dateStr);
                                        }

                                        const updated = [...new Set([...selectedDates, ...weekdays])].sort();
                                        setSelectedDates(updated);
                                        setValue("selected_dates", JSON.stringify(updated));
                                    }}
                                    className="gap-2"
                                >
                                    <Briefcase className="h-4 w-4"/>
                                    Select All Weekdays
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const current = calendarMonth;
                                        const year = current.getFullYear();
                                        const month = current.getMonth();
                                        const lastDay = new Date(year, month + 1, 0).getDate();
                                        const all = [];

                                        for (let day = 1; day <= lastDay; day++) {
                                            const date = new Date(year, month, day);
                                            const dateStr = formatDateLocal(date);
                                            if (!CANADA_HOLIDAYS.includes(dateStr)) all.push(dateStr);
                                        }

                                        const updated = [...new Set([...selectedDates, ...all])].sort();
                                        setSelectedDates(updated);
                                        setValue("selected_dates", JSON.stringify(updated));
                                    }}
                                    className="gap-2"
                                >
                                    <CalendarDays className="h-4 w-4"/>
                                    Select Entire Month
                                </Button>

                                {selectedDates.length > 0 && (
                                    <Button type="button" variant="destructive" size="sm" onClick={handleClearAllDates}
                                            className="gap-2 ml-auto">
                                        <Trash2 className="h-4 w-4"/>
                                        Clear All
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Selected summary (your existing block can stay) */}
                    {selectedDates.length > 0 ? (
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <div className="text-sm font-semibold text-slate-700">
                                Selected Dates ({selectedDates.length})
                            </div>

                            <div className="mt-2 flex flex-wrap gap-2 max-h-40 overflow-auto">
                                {groupConsecutiveDates(selectedDates).map((group, idx) => {
                                    const label =
                                        group.length === 1
                                            ? formatDateDisplay(group[0])
                                            : `${formatDateDisplay(group[0])} → ${formatDateDisplay(group[group.length - 1])} (${group.length})`;

                                    return (
                                        <div
                                            key={idx}
                                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                                        >
                                            {label}
                                            <button
                                                type="button"
                                                className="text-slate-500 hover:text-red-600"
                                                onClick={() => {
                                                    if (group.length === 1) handleRemoveDate(group[0]);
                                                    else group.forEach((d) => handleRemoveDate(d));
                                                }}
                                                title="Remove"
                                            >
                                                <X className="h-3.5 w-3.5"/>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div
                            className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 mt-0.5"/>
                            <div>
                                <span className="font-semibold">No dates selected yet.</span> Please select at least one
                                date.
                            </div>
                        </div>
                    )}

                    {/* hidden fields */}
                    <input type="hidden" {...register("selected_dates")} />
                    <input type="hidden" {...register("start_date")} />
                    <input type="hidden" {...register("end_date")} />

                    {(errors?.selected_dates || errors?.start_date || errors?.end_date) && (
                        <div className="pt-2 space-y-1">
                            {errors?.selected_dates &&
                                <p className="text-xs text-red-500">{errors.selected_dates.message}</p>}
                            {errors?.start_date && <p className="text-xs text-red-500">{errors.start_date.message}</p>}
                            {errors?.end_date && <p className="text-xs text-red-500">{errors.end_date.message}</p>}
                        </div>
                    )}
                </div>
            </section>

            {/* Time Slots */}
            {selectedDates.length > 0 && (
                <section className="relative border border-slate-200 rounded-lg p-4 sm:p-6 pt-7 sm:pt-8 bg-white">
                  <span
                      className="absolute -top-3 left-4 bg-white px-2 text-[13px] sm:text-[15px] text-slate-400 font-normal flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5"/> Time Slots
                  </span>

                    <div className="space-y-4">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Copy className="h-4 w-4 text-blue-600"/>
                                    Apply the same time slot to all selected dates
                                </div>
                                <Checkbox
                                    checked={applyToAll}
                                    onCheckedChange={(checked) => setApplyToAll(!!checked)}
                                    className="h-5 w-5"
                                />
                            </div>

                            {applyToAll && (
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm text-slate-600">Start Time</Label>
                                        <Input
                                            type="time"
                                            value={masterTimeSlot.start_time}
                                            onChange={(e) => {
                                                const next = {...masterTimeSlot, start_time: e.target.value};
                                                setMasterTimeSlot(next);
                                                const obj = {};
                                                selectedDates.forEach((d) => (obj[d] = {...next}));
                                                setTimeSlots(obj);
                                            }}
                                            className="h-11"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm text-slate-600">End Time</Label>
                                        <Input
                                            type="time"
                                            value={masterTimeSlot.end_time}
                                            onChange={(e) => {
                                                const next = {...masterTimeSlot, end_time: e.target.value};
                                                setMasterTimeSlot(next);
                                                const obj = {};
                                                selectedDates.forEach((d) => (obj[d] = {...next}));
                                                setTimeSlots(obj);
                                            }}
                                            className="h-11"
                                        />
                                    </div>
                                    <div
                                        className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900 flex items-start gap-2 md:mt-7">
                                        <Info className="h-4 w-4 mt-0.5"/>
                                        <div>
                                            Applying <span
                                            className="font-semibold">{masterTimeSlot.start_time}</span> to{" "}
                                            <span className="font-semibold">{masterTimeSlot.end_time}</span> for
                                            all{" "}
                                            <span className="font-semibold">{selectedDates.length}</span> dates.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {!applyToAll && (
                            <div className="rounded-xl border border-slate-200 overflow-hidden">
                                <div className="bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                                    Set Time Slots for Each Date
                                </div>

                                <div className="overflow-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-white">
                                        <tr className="border-b border-slate-200">
                                            <th className="text-left px-4 py-3 w-[40%]">Date</th>
                                            <th className="text-left px-4 py-3 w-[25%]">Start</th>
                                            <th className="text-left px-4 py-3 w-[25%]">End</th>
                                            <th className="text-center px-4 py-3 w-[10%]">Copy</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {groupConsecutiveDates(selectedDates).flatMap((group) =>
                                            group.map((date, idx) => {
                                                const slot = timeSlots[date] || {
                                                    start_time: "09:00",
                                                    end_time: "17:00"
                                                };
                                                return (
                                                    <tr key={date}
                                                        className="border-b last:border-b-0 border-slate-100">
                                                        <td className="px-4 py-3 font-semibold text-slate-700">{formatDateDisplay(date)}</td>
                                                        <td className="px-4 py-3">
                                                            <Input
                                                                type="time"
                                                                value={slot.start_time}
                                                                onChange={(e) =>
                                                                    setTimeSlots((prev) => ({
                                                                        ...prev,
                                                                        [date]: {
                                                                            ...prev[date],
                                                                            start_time: e.target.value
                                                                        },
                                                                    }))
                                                                }
                                                                className="h-10"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Input
                                                                type="time"
                                                                value={slot.end_time}
                                                                onChange={(e) =>
                                                                    setTimeSlots((prev) => ({
                                                                        ...prev,
                                                                        [date]: {
                                                                            ...prev[date],
                                                                            end_time: e.target.value
                                                                        },
                                                                    }))
                                                                }
                                                                className="h-10"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {idx > 0 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={() => {
                                                                        const prevDate = group[idx - 1];
                                                                        const prevSlot = timeSlots[prevDate];
                                                                        if (prevSlot) {
                                                                            setTimeSlots((prev) => ({
                                                                                ...prev,
                                                                                [date]: {...prevSlot}
                                                                            }));
                                                                        }
                                                                    }}
                                                                    title="Copy previous"
                                                                >
                                                                    <Copy className="h-4 w-4"/>
                                                                </Button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <input type="hidden" {...register("time_slots")} />
                    </div>
                </section>
            )}

            {/* Work Schedule */}
            <section className="relative border border-slate-200 rounded-lg p-4 sm:p-6 pt-7 sm:pt-8 bg-white">
                <span
                    className="absolute -top-3 left-4 bg-white px-2 text-[13px] sm:text-[15px] text-slate-400 font-normal flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5"/> Work Schedule
                </span>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    <div className="md:col-span-6 space-y-2">
                        <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">
                            Specific Time Slots <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            {...register("work_schedule")}
                            placeholder="e.g., Monday-Friday, 9AM-5PM"
                            className={`h-11 ${errors?.work_schedule ? "border-red-500" : ""}`}
                        />
                        {errors?.work_schedule && (
                            <p className="text-xs text-red-500">{errors.work_schedule.message}</p>
                        )}
                    </div>

                    <div className="md:col-span-3 space-y-2">
                        <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">Break Included</Label>
                        <Select
                            value={watch("break_included") || ""}
                            onValueChange={(v) => setValue("break_included", v)}
                        >
                            <SelectTrigger className="!h-11 w-full !rounded-lg ">
                                <SelectValue placeholder="Select Option"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Yes (with duration)</SelectItem>
                                <SelectItem value="no">No Break</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {watch("break_included") === "yes" && (
                        <div className="md:col-span-3 space-y-2">
                            <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">Break
                                Duration</Label>
                            <Input {...register("break_duration")} placeholder="30 minutes" className="h-11"/>
                        </div>
                    )}
                </div>
            </section>

            {/* Compensation */}
            <section className="relative border border-slate-200 rounded-lg p-4 sm:p-6 pt-7 sm:pt-8 bg-white">
                <span
                    className="absolute -top-3 left-4 bg-white px-2 text-[13px] sm:text-[15px] text-slate-400 font-normal flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5"/> Compensation & Requirements
                </span>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    <div className="md:col-span-6 space-y-2">
                        <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">
                            Required Experience Level <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={watch("required_experience") || ""}
                            onValueChange={(v) => setValue("required_experience", v, {shouldValidate: true})}
                        >
                            <SelectTrigger
                                className={`!h-11 w-full !rounded-lg ${errors?.required_experience ? "border-red-500" : ""}`}>
                                <SelectValue placeholder="Select Experience Level"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="less1">Less than 1 year</SelectItem>
                                <SelectItem value="1-3">1-3 years</SelectItem>
                                <SelectItem value="3-5">3-5 years</SelectItem>
                                <SelectItem value="5-10">5-10 years</SelectItem>
                                <SelectItem value="10plus">More than 10 years</SelectItem>
                                <SelectItem value="noPreference">No preference</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors?.required_experience && (
                            <p className="text-xs text-red-500">{errors.required_experience.message}</p>
                        )}
                    </div>

                    <div className="md:col-span-3 space-y-2">
                        <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">Compensation
                            Mode</Label>
                        <Select
                            value={watch("compensation_mode") || ""}
                            onValueChange={(v) => setValue("compensation_mode", v)}
                        >
                            <SelectTrigger className="!h-11 w-full !rounded-lg ">
                                <SelectValue placeholder="Select Mode"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Per Day">Per Day</SelectItem>
                                <SelectItem value="Per Hour">Per Hour</SelectItem>
                                <SelectItem value="Fixed Contract Value">Fixed Contract Value</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {watch("compensation_mode") === "Per Day" && (
                        <div className="md:col-span-3 space-y-2">
                            <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">Daily Rate
                                (CAD)</Label>
                            <Input {...register("daily_rate")} placeholder="500" className="h-11"/>
                        </div>
                    )}

                    {watch("compensation_mode") === "Per Hour" && (
                        <div className="md:col-span-3 space-y-2">
                            <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">Hourly Rate
                                (CAD)</Label>
                            <Input {...register("hourly_rate")} placeholder="50" className="h-11"/>
                        </div>
                    )}

                    {watch("compensation_mode") === "Fixed Contract Value" && (
                        <div className="md:col-span-3 space-y-2">
                            <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">Contract Value
                                (CAD)</Label>
                            <Input {...register("contract_value")} placeholder="5000" className="h-11"/>
                        </div>
                    )}
                </div>

                {watch("compensation_mode") === "Fixed Contract Value" && (
                    <div className="mt-5 space-y-2">
                        <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">
                            Mission Description <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            {...register("mission_description")}
                            placeholder="Describe the specific mission..."
                            className={`min-h-[110px] ${errors?.mission_description ? "border-red-500" : ""}`}
                        />
                        {errors?.mission_description && (
                            <p className="text-xs text-red-500">{errors.mission_description.message}</p>
                        )}
                    </div>
                )}

                <Separator className="my-5"/>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-baseline">
                    <div className="space-y-2">
                        <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">
                            Bonus / Incentives
                        </Label>
                        <Select
                            value={watch("bonus_incentives") || ""}
                            onValueChange={(v) => setValue("bonus_incentives", v)}
                        >
                            <SelectTrigger className="!h-11 w-full !rounded-lg">
                                <SelectValue placeholder="Select Option"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">Yes - Bonuses Available</SelectItem>
                                <SelectItem value="no">No Bonuses</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">Fees</Label>
                        <Input {...register("fees")} placeholder="e.g., License renewal, insurance" className="h-11"/>
                    </div>
                </div>
            </section>

            {/* Additional Details */}
            <section className="relative border border-slate-200 rounded-lg p-4 sm:p-6 pt-7 sm:pt-8 bg-white">
                <span
                    className="absolute -top-3 left-4 bg-white px-2 text-[13px] sm:text-[15px] text-slate-400 font-normal flex items-center gap-1">
                  <Info className="w-3.5 h-3.5"/>
                    Additional Details
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">Parking</Label>
                        <Input {...register("parking")} placeholder="Available on-site" className="h-11"/>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">
                            Languages <span className="text-red-500">*</span>
                        </Label>

                        <div className="flex flex-wrap gap-8 pt-1">
                            {["English", "French", "Spanish"].map((lang) => {
                                const selected = (watch("languages") || []).includes(lang);

                                return (
                                    <label key={lang}
                                           className="!flex !items-center !gap-2 cursor-pointer select-none !mb-0">
                                        <Checkbox
                                            className="h-5 w-5 !rounded-[4px]"
                                            checked={selected}
                                            onCheckedChange={(checked) => {
                                                const current = watch("languages") || [];
                                                const next = checked
                                                    ? [...new Set([...current, lang])]
                                                    : current.filter((x) => x !== lang);

                                                setValue("languages", next, {shouldValidate: true, shouldDirty: true});
                                            }}
                                        />
                                        <span className="text-[15px] font-semibold text-slate-600 !mb-0">{lang}</span>
                                    </label>
                                );
                            })}
                        </div>

                        {errors?.languages && (
                            <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                                <AlertTriangle className="w-3 h-3"/> {errors.languages.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-3 col-span-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">
                                Software <span className="text-red-500">*</span>
                            </Label>

                            <label className="!flex !items-center !gap-2 cursor-pointer select-none !mb-0">
                                <Checkbox
                                    className="h-5 w-5 !rounded-[4px]"
                                    checked={(watch("software") || []).length === SOFTWARE_OPTIONS.length}
                                    onCheckedChange={(checked) => {
                                        setValue("software", checked ? SOFTWARE_OPTIONS : [], {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                        });
                                    }}
                                />
                                <span className="text-sm font-semibold text-slate-400 !mb-0">Select All</span>
                            </label>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-6">
                                {SOFTWARE_OPTIONS.map((name) => {
                                    const selected = (watch("software") || []).includes(name);

                                    return (
                                        <label key={name}
                                               className="!flex !items-center !gap-3 cursor-pointer select-none !mb-0">
                                            <Checkbox
                                                className="h-5 w-5 !rounded-[4px]"
                                                checked={selected}
                                                onCheckedChange={(checked) => {
                                                    const current = watch("software") || [];
                                                    const next = checked
                                                        ? [...new Set([...current, name])]
                                                        : current.filter((x) => x !== name);

                                                    setValue("software", next, {
                                                        shouldValidate: true,
                                                        shouldDirty: true
                                                    });
                                                }}
                                            />
                                            <span
                                                className="text-[14px] font-semibold text-slate-600 !mb-0">{name}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {errors?.software && (
                            <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                                <AlertTriangle className="w-3 h-3"/> {errors.software.message}
                            </p>
                        )}
                    </div>


                    <div className="space-y-2 col-span-2">
                        <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">
                            Detailed Job Description <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            {...register("detailed_job_description")}
                            className={`w-full min-h-[170px] ${errors?.detailed_job_description ? "border-red-500" : "border-slate-200"}`}
                            placeholder="Provide comprehensive job description..."
                        />
                        {errors?.detailed_job_description && (
                            <p className="text-xs text-red-500">{errors.detailed_job_description.message}</p>
                        )}
                    </div>

                    <div className="space-y-2 col-span-2">
                        <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">Additional
                            Information</Label>
                        <Input {...register("additional_info")} placeholder="e.g., Dress code, PPE required"
                               className="h-11"/>
                    </div>
                </div>
            </section>

            {/* Attachments */}
            <section className="relative border border-slate-200 rounded-lg p-4 sm:p-6 pt-7 sm:pt-8 bg-white">
                <span
                    className="absolute -top-3 left-4 bg-white px-2 text-[13px] sm:text-[15px] text-slate-400 font-normal !flex !items-center !gap-1 !mb-0"
                >
                  <UploadCloud className="w-3.5 h-3.5"/>
                    Attachments
                </span>

                <div className="space-y-3">
                    <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600 !flex !items-center !gap-2">
                        <UploadCloud className="w-4 h-4 text-blue-500"/>
                        Upload File
                    </Label>

                    <Input
                        {...register("attachments")}
                        type="file"
                        accept=".pdf,.jpg,.png"
                        className={`h-11 cursor-pointer ${
                            errors?.attachments ? "border-red-500" : "border-slate-200"
                        }`}
                    />

                    {errors?.attachments && (
                        <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                            <AlertTriangle className="w-3 h-3"/> {errors.attachments.message}
                        </p>
                    )}

                    {selectedFile && (
                        <div
                            className="rounded-lg mt-2 border border-slate-200 bg-slate-50 p-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Attachment preview"
                                        className="h-12 w-12 rounded-md object-cover border border-slate-200 bg-white"
                                    />
                                ) : (
                                    <div
                                        className="h-12 w-12 rounded-md border border-slate-200 bg-white flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-slate-400"/>
                                    </div>
                                )}

                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-700 truncate !mb-0">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-[11px] text-slate-500 !mb-0">
                                        {selectedFile.type === "application/pdf" ? "PDF Document" : "Image/File"}
                                    </p>
                                </div>
                            </div>

                            <Button type="button" variant="outline" onClick={removeSelectedFile}
                                    className="gap-2 text-red-600 border-red-200 hover:bg-red-50">
                                <X className="h-4 w-4"/>
                                Remove
                            </Button>
                        </div>
                    )}

                    {contract?.attachments && (
                        <a
                            href={`${API_BASE_URL ?? ""}/${contract.attachments}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
                        >
                            <Download className="w-4 h-4"/>
                            Download current attachment
                        </a>
                    )}
                </div>
            </section>

            {/* Position Sought */}
            <section className="relative border border-slate-200 rounded-lg p-4 sm:p-6 pt-7 sm:pt-8 bg-white">
                <span
                    className="absolute -top-3 left-4 bg-white px-2 text-[13px] sm:text-[15px] text-slate-400 font-normal flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5"/> Position Sought
                </span>

                <div className="space-y-4">
                    {positionRows?.map((row, index) => {
                        const selectedCategoryId = watch(`position_soughts.${index}.professional_category_id`);
                        const selectedPositions = watch(`position_soughts.${index}.position_ids`, []);

                        const categoryPositionsForRow = (positions ?? []).filter(
                            (item) => Number(item.professional_category_id) === Number(selectedCategoryId)
                        );

                        const provinceValue = currentProvince || watch("province");

                        let positionsToShow = [];
                        if (provinceValue) {
                            if (provinceValue === "Quebec") {
                                positionsToShow = categoryPositionsForRow.filter((p) =>
                                    ["Pharmacy Technician (ATP)", "Pharmacist", "Pharmacy Clerk"].includes(p.name)
                                );
                            } else {
                                positionsToShow = categoryPositionsForRow.filter((p) =>
                                    ["Assistant", "Pharmacist", "Pharmacy Clerk", "Technician"].includes(p.name)
                                );
                            }
                        }

                        return (
                            <div key={row.id} className="">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                    <div className="md:col-span-5 space-y-2">
                                        <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">
                                            Professional Category <span className="text-red-500">*</span>
                                        </Label>
                                        <Select value={String(selectedCategoryId || "")} disabled>
                                            <SelectTrigger className="!h-11 w-full !rounded-lg">
                                                <SelectValue placeholder="Category"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(professionalCategories || []).map((c) => (
                                                    <SelectItem key={c.id} value={String(c.id)}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors?.position_soughts?.[index]?.professional_category_id && (
                                            <p className="text-xs text-red-500">
                                                {errors.position_soughts[index].professional_category_id.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="md:col-span-7 space-y-2">
                                        <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">
                                            Position Sought <span className="text-red-500">*</span>
                                        </Label>

                                        {/* Content Area */}
                                        <div className="bg-white">
                                            {!provinceValue ? (
                                                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs sm:text-sm text-amber-900">
                                                    <AlertTriangle className="h-4 w-4 shrink-0" />
                                                    <span>Please select a province first.</span>
                                                </div>
                                            ) : positionsToShow.length === 0 ? (
                                                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs sm:text-sm text-amber-900">
                                                    <AlertTriangle className="h-4 w-4 shrink-0" />
                                                    <span>No positions available for {provinceValue}.</span>
                                                </div>
                                            ) : (
                                                <div className="relative group">
                                                    <select
                                                        className={`flex h-11 w-full rounded-md border bg-white px-3 py-2 text-sm transition-all cursor-pointer appearance-none outline-none focus:ring-2 ${
                                                            errors?.position_soughts?.[index]?.position_ids
                                                                ? "border-red-500 focus:ring-red-100"
                                                                : "border-slate-200 focus:ring-blue-100 group-hover:border-slate-300"
                                                        }`}
                                                        value={selectedPositions?.[0] || ""}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            setValue(`position_soughts.${index}.position_ids`, val ? [String(val)] : [], {
                                                                shouldValidate: true,
                                                            });
                                                        }}
                                                    >
                                                        <option value="">Select a position</option>
                                                        {positionsToShow.map((p) => (
                                                            <option key={p.id} value={p.id}>{p.name}</option>
                                                        ))}
                                                    </select>

                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Single Error Message Handler */}
                                        {errors?.position_soughts?.[index]?.position_ids && (
                                            <p className="text-[11px] sm:text-xs text-red-500 flex items-center gap-1 font-medium animate-in fade-in slide-in-from-top-1">
                                                <AlertTriangle className="w-3 h-3" />
                                                {errors.position_soughts[index].position_ids.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

        </form>
    );
};

export default PharmacyTemporaryForm;
