import React, {useState, useEffect} from "react";
import {fetchGeoapifySuggestions} from "../api/geopify";
import {getUserProfileService} from "@services/institute/ProfileService";

// Lucide Icons
import {
    MapPin, Search, Keyboard, Info,
    FileText, CalendarDays, Star, AlignLeft, CircleDollarSign, Gift, Trophy,
    AlertTriangle, Paperclip, UploadCloud, UserRound, CheckCircle2,
    ChevronRight, Loader2, X, Download, Briefcase, ChevronDown
} from "lucide-react";

// Shadcn UI components
import {Input} from "@components/ui/input";
import {Label} from "@components/ui/label";
import {Button} from "@components/ui/button";
import {Textarea} from "@components/ui/textarea";
import {Checkbox} from "@components/ui/checkbox";
import {Link} from "react-router-dom";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@components/ui/select.jsx";

const PermanentStaffingPharmacyForm = ({ContractFormHook}) => {
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
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

    // File upload states for preview
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Watchers for reactive UI
    const currentProvince = watch("province");
    const selectedBenefits = watch("benefits") || [];
    const watchAttachments = watch("attachments");

    // Handle File Change & Preview
    useEffect(() => {
        if (watchAttachments && watchAttachments.length > 0) {
            const file = watchAttachments[0];
            setSelectedFile(file);
            if (file.type.startsWith("image/")) {
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
                return () => URL.revokeObjectURL(url);
            } else {
                setPreviewUrl(null);
            }
        }
    }, [watchAttachments]);

    const removeSelectedFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setValue("attachments", null);
    };

    // Original Logic: Fetch profile and prefill
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
            } catch (err) {
                console.error(err);
            }
        };
        fetchProfile();
    }, [contract, setValue]);

    // Geoapify Logic
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!searchQuery || searchQuery.length < 3) {
                setSuggestions([]);
                setShowDropdown(false);
                return;
            }
            setIsLoadingSuggestions(true);
            try {
                const data = await fetchGeoapifySuggestions(searchQuery);
                setSuggestions(data);
                setShowDropdown(data.length > 0);
            } catch (err) {
                console.error(err);
            }
            setIsLoadingSuggestions(false);
        };
        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

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

    return (
        <form id={formId ?? ""} onSubmit={handleSubmit(onSubmit, onError)} className="space-y-10">

            {/* 1. Location Information Section */}
            <section className="relative border border-slate-200 rounded-lg p-4 sm:p-6 pt-7 sm:pt-8 bg-white">
                <span
                    className="absolute -top-3 left-4 bg-white px-2 text-[13px] sm:text-[15px] text-slate-400 font-normal flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5"/> Location Information
                </span>

                {!isClinicOrPharmacy && (
                    <div className="flex justify-end mb-4">
                        <Button
                            variant="outline" size="sm" type="button"
                            onClick={() => setManualEntry(!manualEntry)}
                            className="text-xs border-slate-300 h-8"
                        >
                            {manualEntry ? <><Search className="w-3.5 h-3.5 mr-2"/> Use Search</> : <><Keyboard
                                className="w-3.5 h-3.5 mr-2"/> Enter Manually</>}
                        </Button>
                    </div>
                )}

                {isClinicOrPharmacy && (
                    <div
                        className="mb-6 p-3 rounded-lg bg-blue-50 border border-blue-100 flex items-start gap-3 text-blue-800 text-xs sm:text-sm">
                        <Info className="w-4 h-4 mt-0.5"/>
                        <p>Address loaded from your profile. To modify, update your
                            <Link
                                to="#"
                                className="underline font-bold">
                                institute
                                profile
                            </Link>
                        </p>
                    </div>
                )}

                <div className="space-y-6">
                    {!isClinicOrPharmacy && !manualEntry && (
                        <div className="space-y-2 relative">
                            <Label className="text-sm font-medium text-slate-600">Search Address <span
                                className="text-red-500">*</span></Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                                <Input
                                    className="!pl-10 h-11 border-slate-200 focus:ring-blue-100"
                                    placeholder="Type facility name or address..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {isLoadingSuggestions && <Loader2
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-300"/>}
                            </div>
                            {showDropdown && (
                                <div
                                    className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                                    {suggestions.map((item) => (
                                        <div
                                            key={item.properties.place_id}
                                            className="p-3 hover:bg-slate-50 cursor-pointer flex items-start gap-3 border-b last:border-0"
                                            onClick={() => handleSelectSuggestion(item)}
                                        >
                                            <MapPin className="w-4 h-4 mt-1 text-blue-500"/>
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
                            <Label className="text-sm font-medium text-slate-600">Facility/ Clinic Name <span
                                className="text-red-500">*</span></Label>
                            <Input {...register("facility_name")} readOnly={!manualEntry}
                                   className={`h-11 ${!manualEntry ? "bg-slate-50" : ""}`}/>
                            {errors?.facility_name &&
                                <p className="text-[11px] text-red-500 mt-1">{errors.facility_name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">Street Address</Label>
                            <Input {...register("street_address")} readOnly={!manualEntry}
                                   className={`h-11 ${!manualEntry ? "bg-slate-50" : ""}`}/>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">City <span
                                className="text-red-500">*</span></Label>
                            <Input {...register("city")} readOnly={!manualEntry}
                                   className={`h-11 ${!manualEntry ? "bg-slate-50" : ""}`}/>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">Province <span
                                className="text-red-500">*</span></Label>
                            <Input {...register("province")} readOnly={!manualEntry}
                                   className={`h-11 ${!manualEntry ? "bg-slate-50" : ""}`}/>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">Postal Code</Label>
                            <Input {...register("postal_code")} readOnly={!manualEntry}
                                   className={`h-11 ${!manualEntry ? "bg-slate-50" : ""}`}/>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Contract Details Section */}
            <section className="relative border border-slate-200 rounded-lg p-4 sm:p-6 pt-7 sm:pt-8 bg-white">
                <span
                    className="absolute -top-3 left-4 bg-white px-2 text-[13px] sm:text-[15px] text-slate-400 font-normal flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5"/> Contract Details
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            Start Date <span className="text-red-500">*</span>
                        </Label>
                        <Input type="date" {...register("start_date")} className="h-11 border-slate-200"/>
                        {errors?.start_date && <p className="text-[11px] text-red-500">{errors.start_date.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-600 !flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500"/> Experience Level <span
                            className="text-red-500">*</span>
                        </Label>
                        <select
                            {...register("required_experience")}
                            className="flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                        >
                            <option value="">Select Experience Level</option>
                            <option value="Less than 1 year">Less than 1 year</option>
                            <option value="1–3 years">1–3 years</option>
                            <option value="3–5 years">3–5 years</option>
                            <option value="More than 10 years">More than 10 years</option>
                        </select>
                        {errors?.required_experience &&
                            <p className="text-[11px] text-red-500">{errors.required_experience.message}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Detailed Job Description <span
                        className="text-red-500">*</span></Label>
                    <Textarea
                        {...register("job_description")}
                        placeholder="Describe the job duties and environment..."
                        className="min-h-[120px] border-slate-200 focus:ring-blue-100"
                    />
                    {errors?.job_description &&
                        <p className="text-[11px] text-red-500">{errors.job_description.message}</p>}
                </div>
            </section>

            {/* 3. Compensation & Benefits Section */}
            <section className="relative border border-slate-200 rounded-lg p-4 sm:p-6 pt-7 sm:pt-8 bg-white">
                <span
                    className="absolute -top-3 left-4 bg-white px-2 text-[13px] sm:text-[15px] text-slate-400 font-normal flex items-center gap-1">
                  <CircleDollarSign className="w-3.5 h-3.5"/> Compensation & Benefits
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                    {/* Gross Annual Salary */}
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

                    {/* Benefits */}
                    <div className="col-span-1 md:col-span-2 space-y-2 mt-2">
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
                            <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                                <AlertTriangle className="w-3 h-3"/> {errors.benefits.message}
                            </p>
                        )}
                    </div>

                    {/* Fees (Added back here) */}
                    <div className="col-span-1">
                        <Label
                            className="text-[14px] sm:text-[15px] font-medium text-slate-600 flex items-center gap-2">
                            Fees (CAD $)
                        </Label>
                        <div className="relative group">
                            <div
                                className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none border-r border-slate-200 pr-2 my-2">
                                <span className="text-slate-500 font-bold text-xs">CAD $</span>
                            </div>
                            <Input
                                {...register("fees")}
                                type="text"
                                placeholder="Enter fees in CAD"
                                className={`!pl-20 h-11 transition-all focus:ring-2 ${
                                    errors?.fees ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:ring-blue-100"
                                }`}
                            />
                        </div>
                        {errors?.fees && (
                            <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                                <AlertTriangle className="w-3 h-3"/> {errors.fees.message}
                            </p>
                        )}
                    </div>

                    {/* Urgent Need */}
                    <div className="col-span-1 ">
                        <div className={`px-2 py-4 rounded-lg border transition-all flex items-center justify-between ${
                            watch("urgent_need") ? "bg-orange-50 border-orange-200 shadow-sm" : "bg-slate-50 border-slate-100 opacity-80"
                        }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`p-2 rounded-full ${watch("urgent_need") ? "bg-orange-500" : "bg-slate-300"}`}>
                                    <AlertTriangle className="w-4 h-4 text-white"/>
                                </div>
                                <div>
                                    <h4 className={`text-sm !mb-0 font-bold ${watch("urgent_need") ? "text-orange-900" : "text-slate-700"}`}>Urgent
                                        Need</h4>
                                    <p className="text-[11px] !mb-0 text-slate-500 font-medium">Mark this if you need
                                        someone immediately.</p>
                                </div>
                            </div>
                            <Checkbox
                                id="urgentNeed"
                                checked={!!watch("urgent_need")}
                                onCheckedChange={(checked) => setValue("urgent_need", checked, {shouldValidate: true})}
                                className="w-6 h-6 !rounded-sm border-slate-300 data-[state=checked]:bg-orange-500"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Attachments Section (AS PER YOUR SNIPPET) */}
            <section className="relative border border-slate-200 rounded-lg p-4 sm:p-6 pt-7 sm:pt-8 bg-white">
                <span
                    className="absolute -top-3 left-4 bg-white px-2 text-[13px] sm:text-[15px] text-slate-400 font-normal flex items-center gap-1">
                  <UploadCloud className="w-3.5 h-3.5"/> Attachments
                </span>

                <div className="space-y-3">
                    <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600 flex items-center gap-2">
                        <UploadCloud className="w-4 h-4 text-blue-500"/> Upload File
                    </Label>

                    <Input
                        {...register("attachments")}
                        type="file"
                        accept=".pdf,.jpg,.png"
                        className={`h-11 cursor-pointer ${errors?.attachments ? "border-red-500" : "border-slate-200"}`}
                    />

                    {errors?.attachments && (
                        <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                            <AlertTriangle className="w-3 h-3"/> {errors.attachments.message}
                        </p>
                    )}

                    {selectedFile && (
                        <div
                            className="rounded-lg mt-2 border border-slate-200 bg-slate-50 p-3 flex items-center justify-between gap-3 shadow-sm">
                            <div className="flex items-center gap-3 min-w-0">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview"
                                         className="h-12 w-12 rounded-md object-cover border border-slate-200 bg-white"/>
                                ) : (
                                    <div
                                        className="h-12 w-12 rounded-md border border-slate-200 bg-white flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-slate-400"/>
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-700 truncate !mb-0">{selectedFile.name}</p>
                                    <p className="text-[11px] text-slate-500 !mb-0">{selectedFile.type === "application/pdf" ? "PDF Document" : "Image File"}</p>
                                </div>
                            </div>
                            <Button type="button" variant="outline" onClick={removeSelectedFile}
                                    className="gap-2 text-red-600 border-red-200 hover:bg-red-50 h-9">
                                <X className="h-4 w-4"/> Remove
                            </Button>
                        </div>
                    )}

                    {contract?.attachments && (
                        <a
                            href={`${API_BASE_URL ?? ""}/${contract.attachments}`}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline mt-2"
                        >
                            <Download className="w-4 h-4"/> Download current attachment
                        </a>
                    )}
                </div>
            </section>

            {/* 5. Position Sought Section */}
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
}

export default PermanentStaffingPharmacyForm;