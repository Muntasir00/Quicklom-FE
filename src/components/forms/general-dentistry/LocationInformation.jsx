import React from 'react';
import {Label} from "@components/ui/label";
import {Input} from "@components/ui/input";
import {Button} from "@components/ui/button";
import {
    MapPin, Search, Keyboard, Building,
    Info,
    ChevronRight, Loader2, AlertTriangle
} from "lucide-react";

const LocationInformation = ({
                                 isClinicOrPharmacy, manualEntry, handleManualEntryToggle,
                                 searchQuery, handleInputChange, showDropdown, suggestions,
                                 handleSelectSuggestion, register, errors, // assuming role/user_id from props or session
                             }) => {

    return (
        <div className="w-full mt-8 mb-6">
            {/* Legend Style Wrapper */}
            <div
                className="relative border border-slate-200 rounded-lg p-5 md:p-8 pt-10 bg-white shadow-sm transition-all">

                {/* Top Title (Legend) */}
                <span className="absolute -top-3 left-4 bg-white px-2 text-[15px] text-slate-400 font-normal">
          Location Information
        </span>

                {/* Profile Address Alert for Clinic/Pharmacy */}
                {isClinicOrPharmacy && (
                    <div
                        className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3 animate-in fade-in duration-500">
                        <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"/>
                        <div className="text-[14px] text-blue-800">
                            <span className="font-bold">Address loaded from your profile.</span> To modify this address,
                            please update your{" "}
                            <a
                                href={`/${sessionStorage.getItem('role')}/profile/${sessionStorage.getItem('user_id')}/edit`}
                                className="font-bold underline underline-offset-2 hover:text-blue-600"
                            >
                                institute profile
                            </a>.
                        </div>
                    </div>
                )}

                {/* Action Button: Manual vs Search */}
                {!isClinicOrPharmacy && (
                    <div className="flex justify-end mb-6">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleManualEntryToggle}
                            className="text-slate-500 border-slate-200 hover:bg-slate-50 h-9 rounded-md flex items-center gap-2"
                        >
                            {manualEntry ? <Search className="w-4 h-4"/> : <Keyboard className="w-4 h-4"/>}
                            {manualEntry ? "Use Address Search" : "Enter Manually"}
                        </Button>
                    </div>
                )}

                {/* --- Search Mode UI --- */}
                {!isClinicOrPharmacy && !manualEntry && (
                    <div className="space-y-3 animate-in fade-in duration-300">
                        <div className="space-y-2">
                            <Label className="text-[15px] font-medium text-slate-700">
                                Search Address <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative group">
                                <Input
                                    type="text"
                                    placeholder="Type facility name or address (e.g., Downtown Dental Clinic, Toronto)"
                                    value={searchQuery}
                                    onChange={handleInputChange}
                                    className="h-12 !pl-11 pr-10 border-slate-200 focus-visible:ring-blue-400 rounded-md shadow-sm"
                                    autoComplete="off"
                                />
                                <Search
                                    className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors"/>
                                {searchQuery && (
                                    <Loader2 className="absolute right-4 top-3.5 w-5 h-5 text-slate-300 animate-spin"/>
                                )}
                            </div>

                            {/* Suggestions Dropdown */}
                            {showDropdown && suggestions.length > 0 && (
                                <div
                                    className="absolute z-[1000] mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-2xl max-h-[400px] overflow-y-auto overflow-x-hidden animate-in slide-in-from-top-2">
                                    {suggestions.map((item, idx) => (
                                        <div
                                            key={item.properties.place_id}
                                            onClick={() => handleSelectSuggestion(item)}
                                            className="group flex items-start gap-4 p-4 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-blue-50/50 transition-colors"
                                        >
                                            <div
                                                className="bg-slate-100 p-2 rounded-lg group-hover:bg-blue-100 transition-colors">
                                                <MapPin className="w-5 h-5 text-slate-400 group-hover:text-blue-600"/>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                {item.properties.name && (
                                                    <div
                                                        className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
                                                        <Building className="w-4 h-4 text-blue-500"/>
                                                        {item.properties.name}
                                                    </div>
                                                )}
                                                <div className="text-[13px] text-slate-500 truncate mt-0.5">
                                                    {item.properties.formatted}
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-300 mt-2"/>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* No Results Warning */}
                            {searchQuery.length >= 3 && !showDropdown && suggestions.length === 0 && (
                                <div
                                    className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-500"/>
                                        <p className="text-[14px] text-amber-800 font-medium">No results found for
                                            "{searchQuery}"</p>
                                    </div>
                                    <Button size="sm" variant="outline"
                                            className="bg-white border-amber-200 text-amber-700 hover:bg-amber-100"
                                            onClick={handleManualEntryToggle}>
                                        Enter Manually
                                    </Button>
                                </div>
                            )}
                        </div>

                        <hr className="border-slate-100"/>
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                            <Info size={16}/>
                            <span
                                className="text-[13px] font-medium uppercase tracking-wider">Auto-filled Details</span>
                        </div>
                    </div>
                )}

                {/* --- Main Address Form (Grid) --- */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-y-3 gap-x-8 mt-6">

                    {/* Facility Name - Full width */}
                    <div className="col-span-12 space-y-2">
                        <Label className="text-[15px] font-medium text-slate-700">
                            Facility/ Clinic Name
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            {...register("facility_name")}
                            readOnly={isClinicOrPharmacy || (!manualEntry)}
                            className={`h-11 rounded-md border-slate-200 focus-visible:ring-blue-400 ${
                                (isClinicOrPharmacy || !manualEntry) ? 'bg-slate-50 text-slate-500' : 'bg-white'
                            } ${errors?.facility_name ? 'border-red-500' : ''}`}
                        />
                        {errors?.facility_name &&
                            <p className="text-xs text-red-500 italic mt-1">{errors.facility_name.message}</p>}
                    </div>

                    {/* Street Address */}
                    <div className="col-span-12 md:col-span-6 space-y-2">
                        <Label className="text-[15px] font-medium text-slate-700">
                            Street Address
                            <span className="text-red-500 ml-0.5">*</span>
                        </Label>
                        <Input
                            {...register("street_address")}
                            readOnly={isClinicOrPharmacy || (!manualEntry)}
                            className={`h-11 rounded-md border-slate-200 focus-visible:ring-blue-400 ${(isClinicOrPharmacy || !manualEntry) ? 'bg-slate-50' : ''}`}
                            placeholder="-"
                        />
                    </div>

                    {/* City */}
                    <div className="col-span-12 md:col-span-6 space-y-2">
                        <Label className="text-[15px] font-medium text-slate-700">City <span
                            className="text-red-500">*</span></Label>
                        <Input
                            {...register("city")}
                            readOnly={isClinicOrPharmacy || (!manualEntry)}
                            className={`h-11 rounded-md border-slate-200 focus-visible:ring-blue-400 ${
                                (isClinicOrPharmacy || !manualEntry) ? 'bg-slate-50' : ''
                            } ${errors?.city ? 'border-red-500' : ''}`}
                            placeholder="-"
                        />
                        {errors?.city && <p className="text-xs text-red-500 italic mt-1">{errors.city.message}</p>}
                    </div>

                    {/* Province - Conditional Select or Input */}
                    <div className="col-span-12 md:col-span-4 space-y-2">
                        <Label className="text-[15px] font-medium text-slate-700">Province <span
                            className="text-red-500">*</span></Label>
                        {manualEntry && !isClinicOrPharmacy ? (
                            <select
                                {...register("province")}
                                className={`flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-400 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%20fill%3D%22none%20stroke%3D%22%23cbd5e1%22%20stroke-width%3D%222%20stroke-linecap%3D%22round%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_10px_center] bg-no-repeat ${errors?.province ? 'border-red-500' : ''}`}
                            >
                                <option value="">Select Province</option>
                                <option value="Alberta">Alberta (AB)</option>
                                <option value="British Columbia">British Columbia (BC)</option>
                                <option value="Manitoba">Manitoba (MB)</option>
                                <option value="New Brunswick">New Brunswick (NB)</option>
                                <option value="Newfoundland and Labrador">Newfoundland (NL)</option>
                                <option value="Northwest Territories">Northwest Territories (NT)</option>
                                <option value="Nova Scotia">Nova Scotia (NS)</option>
                                <option value="Nunavut">Nunavut (NU)</option>
                                <option value="Ontario">Ontario (ON)</option>
                                <option value="Prince Edward Island">Prince Edward (PE)</option>
                                <option value="Quebec">Quebec (QC)</option>
                                <option value="Saskatchewan">Saskatchewan (SK)</option>
                                <option value="Yukon">Yukon (YT)</option>
                            </select>
                        ) : (
                            <Input
                                {...register("province")}
                                readOnly
                                className="h-11 rounded-md border-slate-200 bg-slate-50 text-slate-500"
                                placeholder="-"
                            />
                        )}
                        {errors?.province &&
                            <p className="text-xs text-red-500 italic mt-1">{errors.province.message}</p>}
                    </div>

                    {/* Postal Code */}
                    <div className="col-span-12 md:col-span-4 space-y-2">
                        <Label className="text-[15px] font-medium text-slate-700">Postal Code</Label>
                        <Input
                            {...register("postal_code")}
                            readOnly={isClinicOrPharmacy || (!manualEntry)}
                            className={`h-11 rounded-md border-slate-200 focus-visible:ring-blue-400 ${(isClinicOrPharmacy || !manualEntry) ? 'bg-slate-50' : ''}`}
                            placeholder="-"
                        />
                    </div>

                    {/* Country */}
                    <div className="col-span-12 md:col-span-4 space-y-2">
                        <Label className="text-[15px] font-medium text-slate-700">Country</Label>
                        <Input
                            {...register("country")}
                            readOnly
                            className="h-11 rounded-md border-slate-200 bg-slate-50 text-slate-500"
                            value="Canada"
                        />
                    </div>
                </div>

                {/* Hidden Input for Coordinates/Data */}
                <input type="hidden" {...register("contract_location")} />

            </div>
        </div>
    );
};

export default LocationInformation;