import React, {useEffect, useMemo, useState} from "react";
import {fetchGeoapifySuggestions} from "../api/geopify";
import {getUserProfileService} from "@services/institute/ProfileService";

import {
    MapPin,
    Search,
    Keyboard,
    Info,
    ChevronDown,
    AlertTriangle,
    FileText,
    Calendar as CalendarIcon,
    Star,
    Clock,
    CircleDollarSign,
    Trophy,
    Gift,
    Paperclip,
    UploadCloud,
    Download,
    AlertCircle,
    X,
} from "lucide-react";

// ✅ shadcn/ui (আপনার প্রজেক্টে path আলাদা হলে শুধু এই imports change করবেন)
import {Label} from "@components/ui/label";
import {Input} from "@components/ui/input";
import {Textarea} from "@components/ui/textarea";
import {Checkbox} from "@components/ui/checkbox";

const shiftOptions = ["Day", "Evening", "Night", "Weekend"];

const PermanentStaffingDentalForm = ({ContractFormHook}) => {
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
    // আপনার component এর উপরে state গুলো যোগ করুন
    const [selectedFile, setSelectedFile] = useState(null); // File
    const [previewUrl, setPreviewUrl] = useState(""); // image url
    const attachmentWatch = watch("attachments"); // RHF watch

    // ======= Derived selections (for chip/checkbox UI) =======
    const selectedBenefits = watch("benefits") || [];
    const selectedShifts = watch("working_shifts") || [];

    // ======= Profile prefill for Clinics(1)/Pharmacies(2) =======
    useEffect(() => {
        const fetchProfileAndPrefillAddress = async () => {
            if (contract?.id) return; // edit হলে prefill না

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
                    setManualEntry(true); // prefilled হলে manual fields show
                }
            } catch (error) {
                console.error("Error fetching profile for address pre-fill:", error);
            }
        };

        fetchProfileAndPrefillAddress();
    }, [contract, setValue]);

    // ======= Default professional category to Dental =======
    useEffect(() => {
        if (professionalCategories?.length && positionRows?.length) {
            const dentalCategory = professionalCategories.find(
                (cat) =>
                    cat.name === "Dental" ||
                    cat.name === "Dentistry" ||
                    cat.name === "Dental Care" ||
                    cat.name.toLowerCase().includes("dent")
            );

            if (dentalCategory && positionRows[0]) {
                setValue(`position_soughts.0.professional_category_id`, dentalCategory.id);
            }
        }
    }, [professionalCategories, positionRows, setValue]);

    // ======= Geoapify suggestions debounce =======
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

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleSelectSuggestion = (item) => {
        const props = item?.properties || {};
        const facilityName = props.name || props.address_line1 || "";

        if (facilityName) setValue("facility_name", facilityName);
        setValue("street_address", props.street || props.address_line2 || "");
        setValue("city", props.city || "");
        setValue("province", props.state || props.county || "");
        setValue("postal_code", props.postcode || "");
        setValue("country", props.country || "");

        setSearchQuery("");
        setShowDropdown(false);
    };

    const handleManualEntryToggle = () => {
        setManualEntry((prev) => !prev);
        // manual on করলে search clean
        setSearchQuery("");
        setSuggestions([]);
        setShowDropdown(false);
    };



    useEffect(() => {
        // attachments field থেকে ফাইল ধরবো
        const value = attachmentWatch;

        // যদি user remove করে বা empty হয়
        if (!value || (value instanceof FileList && value.length === 0)) {
            setSelectedFile(null);
            setPreviewUrl("");
            return;
        }

        // FileList থেকে file
        if (value instanceof FileList && value.length > 0) {
            const file = value[0];
            setSelectedFile(file);

            // image হলে preview url
            if (file && file.type?.startsWith("image/")) {
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
                return () => URL.revokeObjectURL(url);
            } else {
                setPreviewUrl("");
            }
        }
    }, [attachmentWatch]);

    const removeSelectedFile = () => {
        // RHF field clear
        setValue("attachments", null, { shouldValidate: true });

        // UI state clear
        setSelectedFile(null);
        setPreviewUrl("");
    };


    return (
        <form
            id={formId}
            className="space-y-6"
            onSubmit={handleSubmit(
                (data) => onSubmit(data),
                (errs) => {
                    console.log("Validation errors:", errs);
                }
            )}
        >
            {/* ===================== Location Information ===================== */}
            <div className="relative border border-slate-200 rounded-lg p-4 sm:p-6 pt-7 sm:pt-8 bg-white">
        <span
            className="absolute -top-3 left-4 bg-white px-2 text-[13px] sm:text-[15px] text-slate-400 font-normal flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5"/> Location Information
        </span>

                {/* Top Right Action */}
                {!isClinicOrPharmacy && (
                    <div className="flex justify-end mb-4">
                        <button
                            type="button"
                            onClick={handleManualEntryToggle}
                            className="flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 transition px-4 py-2 rounded-md text-sm font-semibold text-slate-600"
                        >
                            <Keyboard className="w-4 h-4 text-slate-500"/>
                            Enter Manually
                        </button>
                    </div>
                )}

                {/* Profile prefill info */}
                {isClinicOrPharmacy && (
                    <div className="mb-5 p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-2">
                        <Info className="w-4 h-4 text-slate-400 mt-0.5"/>
                        <div className="text-sm text-slate-600">
                            <p className="font-semibold text-slate-700 !mb-0">Address loaded from your profile.</p>
                            <p className="text-[12px] text-slate-500 !mb-0">
                                To modify this address, please update your institute profile.
                            </p>
                        </div>
                    </div>
                )}

                {/* Search Address */}
                {!isClinicOrPharmacy && !manualEntry && (
                    <div className="space-y-2">
                        <Label
                            className="text-[14px] sm:text-[15px] font-medium text-slate-600 flex items-center gap-2">
                            Search Address <span className="text-red-500">*</span>
                        </Label>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <Search className="w-4 h-4 text-slate-400"/>
                            </div>

                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Type facility name or address (e.g., Downtown Dental Clinic, Toronto)"
                                className="h-11 !pl-10 transition-all focus:ring-2 border-slate-200 focus:ring-blue-100"
                            />

                            {showDropdown && suggestions.length > 0 && (
                                <div
                                    className="absolute z-50 mt-2 w-full rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden">
                                    <ul className="max-h-72 overflow-auto">
                                        {suggestions.map((item, idx) => (
                                            <li
                                                key={idx}
                                                onClick={() => handleSelectSuggestion(item)}
                                                className="px-4 py-3 cursor-pointer hover:bg-slate-50"
                                            >
                                                <p className="text-sm font-semibold text-slate-700 !mb-0">
                                                    {item.properties?.name || item.properties?.address_line1}
                                                </p>
                                                <p className="text-[12px] text-slate-500 !mb-0">{item.properties?.formatted}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="my-6 border-t border-slate-200"/>

                <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-400 tracking-wide mb-5">
                    <Info className="w-4 h-4"/>
                    AUTO-FILLED DETAILS
                </div>

                {/* Fields */}
                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">
                            Facility/ Clinic Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            {...register("facility_name")}
                            readOnly={isClinicOrPharmacy || !manualEntry}
                            className={`h-11 transition-all focus:ring-2 ${
                                errors?.facility_name ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:ring-blue-100"
                            } ${isClinicOrPharmacy || !manualEntry ? "bg-slate-50" : ""}`}
                            placeholder="Enter facility name"
                        />
                        {errors?.facility_name && (
                            <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                                <AlertTriangle className="w-3 h-3"/> {errors.facility_name.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">
                                Street Address <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                {...register("street_address")}
                                readOnly={isClinicOrPharmacy || !manualEntry}
                                className={`h-11 transition-all focus:ring-2 ${
                                    errors?.street_address
                                        ? "border-red-500 focus:ring-red-100"
                                        : "border-slate-200 focus:ring-blue-100"
                                } ${isClinicOrPharmacy || !manualEntry ? "bg-slate-50" : ""}`}
                                placeholder="Enter street address"
                            />
                            {errors?.street_address && (
                                <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                                    <AlertTriangle className="w-3 h-3"/> {errors.street_address.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">
                                City <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                {...register("city")}
                                readOnly={isClinicOrPharmacy || !manualEntry}
                                className={`h-11 transition-all focus:ring-2 ${
                                    errors?.city ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:ring-blue-100"
                                } ${isClinicOrPharmacy || !manualEntry ? "bg-slate-50" : ""}`}
                                placeholder="Enter city"
                            />
                            {errors?.city && (
                                <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                                    <AlertTriangle className="w-3 h-3"/> {errors.city.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">
                                Province <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                {...register("province")}
                                readOnly={isClinicOrPharmacy || !manualEntry}
                                className={`h-11 transition-all focus:ring-2 ${
                                    errors?.province ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:ring-blue-100"
                                } ${isClinicOrPharmacy || !manualEntry ? "bg-slate-50" : ""}`}
                                placeholder="Enter province"
                            />
                            {errors?.province && (
                                <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                                    <AlertTriangle className="w-3 h-3"/> {errors.province.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">Postal Code</Label>
                            <Input
                                {...register("postal_code")}
                                readOnly={isClinicOrPharmacy || !manualEntry}
                                className={`h-11 transition-all focus:ring-2 ${
                                    errors?.postal_code
                                        ? "border-red-500 focus:ring-red-100"
                                        : "border-slate-200 focus:ring-blue-100"
                                } ${isClinicOrPharmacy || !manualEntry ? "bg-slate-50" : ""}`}
                                placeholder="Enter postal code"
                            />
                            {errors?.postal_code && (
                                <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                                    <AlertTriangle className="w-3 h-3"/> {errors.postal_code.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">Country</Label>
                            <Input
                                {...register("country")}
                                readOnly={isClinicOrPharmacy || !manualEntry}
                                className={`h-11 transition-all focus:ring-2 ${
                                    errors?.country ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:ring-blue-100"
                                } ${isClinicOrPharmacy || !manualEntry ? "bg-slate-50" : ""}`}
                                placeholder="Enter country"
                            />
                            {errors?.country && (
                                <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                                    <AlertTriangle className="w-3 h-3"/> {errors.country.message}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ===================== Contract Details ===================== */}
            <div className="relative border border-slate-200 rounded-lg p-4 sm:p-6 pt-7 sm:pt-8 bg-white">
        <span
            className="absolute -top-3 left-4 bg-white px-2 text-[13px] sm:text-[15px] text-slate-400 font-normal flex items-center gap-1">
          <FileText className="w-3.5 h-3.5"/> Contract Details
        </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Start Date */}
                    <div className="space-y-2">
                        <Label
                            className="text-[14px] sm:text-[15px] font-medium text-slate-600 flex items-center gap-2">
                            Start Date <span className="text-red-500">*</span>
                        </Label>

                        <div className="relative group">
                            <input
                                {...register("start_date")}
                                type="date"
                                className={`flex h-11 w-full rounded-md border bg-white pl-2.5 pr-10 py-2 text-sm transition-all focus:outline-none focus:ring-2 cursor-pointer
                  ${errors?.start_date ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:ring-blue-100 hover:border-slate-300"}
                  [&::-webkit-calendar-picker-indicator]:absolute
                  [&::-webkit-calendar-picker-indicator]:right-0
                  [&::-webkit-calendar-picker-indicator]:w-full
                  [&::-webkit-calendar-picker-indicator]:h-full
                  [&::-webkit-calendar-picker-indicator]:opacity-0
                  [&::-webkit-calendar-picker-indicator]:cursor-pointer
                `}
                            />
                            <div className="absolute right-3 top-3.5 pointer-events-none">
                                <CalendarIcon className="w-4 h-4 text-blue-500"/>
                            </div>
                        </div>

                        {errors?.start_date && (
                            <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1 font-medium">
                                <AlertCircle className="w-3 h-3"/> {errors.start_date.message}
                            </p>
                        )}
                    </div>

                    {/* Experience */}
                    <div className="space-y-2">
                        <Label
                            className="text-[14px] sm:text-[15px] font-medium text-slate-600 !flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-500"/> Experience Level <span
                            className="text-red-500">*</span>
                        </Label>

                        <div className="relative">
                            <select
                                {...register("required_experience")}
                                className={`flex h-11 w-full rounded-md border bg-white px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 transition-all ${
                                    errors?.required_experience ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:ring-blue-100"
                                }`}
                            >
                                <option value="">Select Experience Level</option>
                                <option value="Less than 1 year">Less than 1 year</option>
                                <option value="1–3 years">1–3 years</option>
                                <option value="3–5 years">3–5 years</option>
                                <option value="5–10 years">5–10 years</option>
                                <option value="More than 10 years">More than 10 years</option>
                                <option value="No preference">No preference</option>
                            </select>
                            <ChevronDown
                                className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none"/>
                        </div>

                        {errors?.required_experience && (
                            <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1 font-medium">
                                <AlertCircle className="w-3 h-3"/>
                                {errors.required_experience.message}
                            </p>
                        )}
                    </div>

                    {/* Working Shifts - chips */}
                    <div className="col-span-1 md:col-span-2 space-y-3 pt-2">
                        <Label
                            className="text-[14px] sm:text-[15px] font-medium text-slate-600 !flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-500"/> Working Shifts <span
                            className="text-red-500">*</span>
                        </Label>

                        <div className="flex flex-wrap gap-3">
                            {shiftOptions.map((shift) => {
                                const isChecked = Array.isArray(selectedShifts) && selectedShifts.includes(shift);

                                return (
                                    <button
                                        key={shift}
                                        type="button"
                                        onClick={() => {
                                            const updated = isChecked
                                                ? selectedShifts.filter((s) => s !== shift)
                                                : [...selectedShifts, shift];
                                            setValue("working_shifts", updated, {shouldValidate: true});
                                        }}
                                        className={`px-4 py-2 !rounded-md border text-xs sm:text-sm font-semibold transition-all flex items-center gap-2
_latest_
                      ${
                                            isChecked
                                                ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                                                : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-500"
                                        }`}
                                    >
                                        {isChecked &&
                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"/>}
                                        {shift}
                                    </button>
                                );
                            })}
                        </div>

                        {errors?.working_shifts && (
                            <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1 font-medium">
                                <AlertCircle className="w-3 h-3"/> {errors.working_shifts.message}
                            </p>
                        )}

                        {/* RHF register hidden (chips UI uses setValue) */}
                        <input type="hidden" {...register("working_shifts")} />
                    </div>

                    {/* Job Description */}
                    <div className="col-span-1 md:col-span-2 space-y-2">
                        <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">
                            Detailed Job Description <span className="text-red-500">*</span>
                        </Label>

                        <Textarea
                            {...register("job_description")}
                            placeholder="Describe the job duties and environment..."
                            className={`min-h-[140px] transition-all focus:ring-2 ${
                                errors?.job_description ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:ring-blue-100"
                            }`}
                        />

                        {errors?.job_description && (
                            <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1 font-medium">
                                <AlertCircle className="w-3 h-3"/> {errors.job_description.message}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ===================== Compensation & Benefits ===================== */}
            <div className="relative border border-slate-200 rounded-lg p-4 sm:p-6 pt-7 sm:pt-8 bg-white">
        <span
            className="absolute -top-3 left-4 bg-white px-2 text-[13px] sm:text-[15px] text-slate-400 font-normal flex items-center gap-1">
          <CircleDollarSign className="w-3.5 h-3.5"/> Compensation & Benefits
        </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    {/* Salary */}
                    <div className="space-y-2">
                        <Label
                            className="text-[14px] sm:text-[15px] font-medium text-slate-600 flex items-center gap-2">
                            Gross Annual Salary <span className="text-red-500">*</span>
                        </Label>

                        <div className="relative group">
                            <div
                                className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none border-r border-slate-200 pr-2 my-2">
                                <span className="text-slate-500 font-bold text-xs">CAD $</span>
                            </div>

                            <Input
                                {...register("annual_salary")}
                                type="text"
                                placeholder="e.g., 120000"
                                className={`!pl-20 h-11 transition-all focus:ring-2 ${
                                    errors?.annual_salary ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:ring-blue-100"
                                }`}
                            />
                        </div>

                        {errors?.annual_salary ? (
                            <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                                <AlertTriangle className="w-3 h-3"/> {errors.annual_salary.message}
                            </p>
                        ) : (
                            <p className="text-[11px] text-blue-500 flex items-center gap-1 font-medium">
                                <Info className="w-3 h-3"/> Enter total gross annual salary.
                            </p>
                        )}
                    </div>

                    {/* Additional Bonus */}
                    <div className="space-y-2">
                        <Label
                            className="text-[14px] sm:text-[15px] font-medium text-slate-600 !flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-500"/> Additional Bonus / Incentives
                        </Label>

                        <select
                            {...register("additional_bonus")}
                            className={`flex h-11 w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all ${
                                errors?.additional_bonus ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:ring-blue-100"
                            }`}
                        >
                            <option value="">Select Option</option>
                            <option value="yes">Yes, Included</option>
                            <option value="no">No, Not Included</option>
                        </select>
                    </div>

                    {/* Benefits (modern multi) */}
                    <div className="col-span-1 md:col-span-2 space-y-2">
                        <Label
                            className="text-[14px] sm:text-[15px] font-medium text-slate-600 !flex items-center gap-2">
                            <Gift className="w-4 h-4 text-purple-500"/> Benefits <span className="text-red-500">*</span>
                        </Label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {["In-kind", "Monetary"].map((benefit) => (
                                <label
                                    key={benefit}
                                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                                        selectedBenefits.includes(benefit) ? "border-blue-500 bg-blue-50/50" : "border-slate-200 bg-slate-50/30"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id={`benefit-${benefit}`}
                                            className="w-5 h-5 !rounded-sm"
                                            checked={selectedBenefits.includes(benefit)}
                                            onCheckedChange={(checked) => {
                                                const updated = checked
                                                    ? [...selectedBenefits, benefit]
                                                    : selectedBenefits.filter((b) => b !== benefit);
                                                setValue("benefits", updated, {shouldValidate: true});
                                            }}
                                        />
                                        <span className="text-sm font-semibold text-slate-700">{benefit}</span>
                                    </div>
                                </label>
                            ))}
                        </div>

                        {errors?.benefits && (
                            <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium !mb-0">
                                <AlertTriangle className="w-3 h-3"/> {errors.benefits.message}
                            </p>
                        )}
                    </div>

                    {/* Urgent Need */}
                    <div className="col-span-1 md:col-span-2">
                        <div
                            className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
                                watch("urgent_need")
                                    ? "bg-orange-50 border-orange-200 shadow-sm"
                                    : "bg-slate-50 border-slate-100 opacity-80"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`p-2 rounded-full ${watch("urgent_need") ? "bg-orange-500" : "bg-slate-300"}`}>
                                    <AlertTriangle className="w-4 h-4 text-white"/>
                                </div>
                                <div>
                                    <h4 className={`text-sm !mb-0 font-bold ${watch("urgent_need") ? "text-orange-900" : "text-slate-700"}`}>
                                        Urgent Need
                                    </h4>
                                    <p className="text-[11px] !mb-0 text-slate-500 font-medium">
                                        Mark this if you need someone immediately.
                                    </p>
                                </div>
                            </div>

                            <Checkbox
                                id="urgentNeed"
                                checked={!!watch("urgent_need")}
                                onCheckedChange={(checked) => setValue("urgent_need", checked, {shouldValidate: true})}
                                className="w-6 h-6 !rounded-sm border-slate-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                            />

                            {/* RHF consistency */}
                            <input type="hidden" {...register("urgent_need")} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ===================== Attachments ===================== */}
            <div className="relative border border-slate-200 rounded-lg p-4 sm:p-6 pt-7 sm:pt-8 bg-white">
  <span className="absolute -top-3 left-4 bg-white px-2 text-[13px] sm:text-[15px] text-slate-400 font-normal flex items-center gap-1">
    <Paperclip className="w-3.5 h-3.5" /> Attachments
  </span>

                <div className="space-y-3">
                    <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600 !flex items-center gap-2">
                        <UploadCloud className="w-4 h-4 text-blue-500" />
                        Upload File
                    </Label>

                    {/* Upload input */}
                    <Input
                        {...register("attachments")}
                        type="file"
                        accept=".pdf,.jpg,.png"
                        className={`h-11 cursor-pointer transition-all focus:ring-2 ${
                            errors?.attachments
                                ? "border-red-500 focus:ring-red-100"
                                : "border-slate-200 focus:ring-blue-100"
                        }`}
                    />

                    {/* Error */}
                    {errors?.attachments && (
                        <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                            <AlertTriangle className="w-3 h-3" /> {errors.attachments.message}
                        </p>
                    )}

                    {/* Selected File Preview */}
                    {selectedFile && (
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 mt-2 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                {/* Image preview */}
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Attachment preview"
                                        className="h-12 w-12 rounded-md object-cover border border-slate-200 bg-white"
                                    />
                                ) : (
                                    <div className="h-12 w-12 rounded-md border border-slate-200 bg-white flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-slate-400" />
                                    </div>
                                )}

                                {/* File meta */}
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-700 truncate !mb-0">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-[11px] text-slate-500 !mb-0">
                                        {selectedFile.type === "application/pdf"
                                            ? "PDF Document"
                                            : selectedFile.type?.startsWith("image/")
                                                ? "Image File"
                                                : "File"}
                                    </p>
                                </div>
                            </div>

                            {/* Remove button */}
                            <button
                                type="button"
                                onClick={removeSelectedFile}
                                className="shrink-0 inline-flex items-center gap-2 rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                            >
                                <X className="w-4 h-4" />
                                Remove
                            </button>
                        </div>
                    )}

                    {/* Existing file download (edit mode) */}
                    {contract?.data?.attachments && (
                        <a
                            href={`${API_BASE_URL}/${contract.data.attachments}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
                        >
                            <Download className="w-4 h-4" />
                            Download existing file
                        </a>
                    )}
                </div>
            </div>

            {/*    <div className="relative border border-slate-200 rounded-lg p-4 sm:p-6 pt-7 sm:pt-8 bg-white">*/}
        {/*<span*/}
        {/*    className="absolute -top-3 left-4 bg-white px-2 text-[13px] sm:text-[15px] text-slate-400 font-normal flex items-center gap-1">*/}
        {/*  <Paperclip className="w-3.5 h-3.5"/> Attachments*/}
        {/*</span>*/}

        {/*        <div className="space-y-2">*/}
        {/*            <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600 flex items-center gap-2">*/}
        {/*                <UploadCloud className="w-4 h-4 text-blue-500"/>*/}
        {/*                Upload File*/}
        {/*            </Label>*/}

        {/*            <Input*/}
        {/*                {...register("attachments")}*/}
        {/*                type="file"*/}
        {/*                accept=".pdf,.jpg,.png"*/}
        {/*                className={`h-11 cursor-pointer transition-all focus:ring-2 ${*/}
        {/*                    errors?.attachments ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:ring-blue-100"*/}
        {/*                }`}*/}
        {/*            />*/}

        {/*            {errors?.attachments && (*/}
        {/*                <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium">*/}
        {/*                    <AlertTriangle className="w-3 h-3"/> {errors.attachments.message}*/}
        {/*                </p>*/}
        {/*            )}*/}

        {/*            {contract?.data?.attachments && (*/}
        {/*                <a*/}
        {/*                    href={`${API_BASE_URL}/${contract.data.attachments}`}*/}
        {/*                    target="_blank"*/}
        {/*                    rel="noopener noreferrer"*/}
        {/*                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline mt-2"*/}
        {/*                >*/}
        {/*                    <Download className="w-4 h-4"/>*/}
        {/*                    Download existing file*/}
        {/*                </a>*/}
        {/*            )}*/}
        {/*        </div>*/}
        {/*    </div>*/}

            {/* ===================== Position Sought ===================== */}
            {positionRows?.length > 0 &&
                positionRows.map((row, index) => {
                    const selectedCategoryId = watch(`position_soughts.${index}.professional_category_id`);
                    const selectedPositions = watch(`position_soughts.${index}.position_ids`, []);

                    const specialistDentistPosition = positions?.find((p) => p.name === "Specialist Dentist");
                    const showSpecialistRole =
                        specialistDentistPosition &&
                        Array.isArray(selectedPositions) &&
                        selectedPositions.length > 0 &&
                        selectedPositions.some((posId) => Number(posId) === Number(specialistDentistPosition.id));

                    const categoryPositionsForRow = (positions ?? []).filter(
                        (item) => Number(item.professional_category_id) === Number(selectedCategoryId)
                    );

                    useEffect(() => {
                        if (!showSpecialistRole) {
                            setValue(`position_soughts.${index}.specialist_dentist_role`, "");
                        }
                    }, [showSpecialistRole]); // eslint-disable-line react-hooks/exhaustive-deps

                    return (
                        <div key={row.id}
                             className="relative border border-slate-200 rounded-lg p-4 sm:p-6 pt-7 sm:pt-8 bg-white mb-6">
              <span
                  className="absolute -top-3 left-4 bg-white px-2 text-[13px] sm:text-[15px] text-slate-400 font-normal">
                Position Sought
              </span>

                            <div className="grid grid-cols-12 gap-4 sm:gap-8 items-start">
                                {/* Left Side */}
                                <div className="col-span-12 md:col-span-5 space-y-2">
                                    <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">
                                        Professional Category <span className="text-red-700">*</span>
                                    </Label>

                                    <div className="relative">
                                        <select
                                            className={`flex h-11 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm appearance-none disabled:cursor-not-allowed disabled:opacity-70 ${
                                                errors?.position_soughts?.[index]?.professional_category_id ? "border-red-500" : "border-slate-200"
                                            }`}
                                            {...register(`position_soughts.${index}.professional_category_id`)}
                                            disabled
                                        >
                                            <option value="">Select category</option>
                                            {Array.isArray(professionalCategories) &&
                                                professionalCategories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                        </select>

                                        <div
                                            className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                            <ChevronDown className="h-4 w-4 text-slate-400"/>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side */}
                                <div className="col-span-12 md:col-span-7 space-y-3">
                                    <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">
                                        Position Sought <span className="text-red-700">*</span>
                                    </Label>

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

                                                const isSpecialist = specialistDentistPosition && Number(val) === Number(specialistDentistPosition.id);

                                                if (!val || !isSpecialist) {
                                                    setValue(`position_soughts.${index}.specialist_dentist_role`, "");
                                                }
                                            }}
                                        >
                                            <option value="">Select a position</option>
                                            {categoryPositionsForRow.map((position) => (
                                                <option key={position.id} value={position.id}>
                                                    {position.name}
                                                </option>
                                            ))}
                                        </select>

                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>

                                    {/* Error Message */}
                                    {errors?.position_soughts?.[index]?.position_ids && (
                                        <p className="text-[11px] sm:text-xs text-red-500 flex items-center gap-1 font-medium italic mt-2">
                                            <AlertTriangle className="w-3 h-3" />
                                            {errors.position_soughts[index].position_ids.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Specialist Role */}
                            {showSpecialistRole && (
                                <div
                                    className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="w-full max-w-md space-y-2">
                                        <Label
                                            className="text-[14px] sm:text-[15px] font-medium text-slate-600 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                            Specialist Dentist Role <span className="text-red-500">*</span>
                                        </Label>

                                        <select
                                            className={`flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                                                errors?.position_soughts?.[index]?.specialist_dentist_role ? "border-red-500" : ""
                                            }`}
                                            {...register(`position_soughts.${index}.specialist_dentist_role`)}
                                        >
                                            <option value="">Choose Specialty...</option>
                                            <option value="orthodontist">🦷 Orthodontist - Braces & Alignment</option>
                                            <option value="endodontist">🦷 Endodontist - Root Canals</option>
                                            <option value="periodontist">🦷 Periodontist - Gums & Supporting Structures
                                            </option>
                                            <option value="pediatric dentist">👶 Pediatric Dentist - Children's Dental
                                                Care
                                            </option>
                                            <option value="prosthodontist">🦷 Prosthodontist - Prosthetics &
                                                Restoration
                                            </option>
                                            <option value="oral and maxillofacial surgeon">⚕️ Oral & Maxillofacial
                                                Surgeon - Surgery
                                            </option>
                                        </select>

                                        {errors?.position_soughts?.[index]?.specialist_dentist_role && (
                                            <p className="text-xs text-red-500 mt-1 italic">
                                                {errors.position_soughts[index].specialist_dentist_role.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
        </form>
    );
};

export default PermanentStaffingDentalForm;
