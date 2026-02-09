import React from 'react';
import { Label } from "@components/ui/label";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Checkbox } from "@components/ui/checkbox";
import { Progress } from "@components/ui/progress";
import {
    CloudUpload,
    FileText,
    FileImage,
    X,
    Download,
} from "lucide-react";

const AdditionalDetails = ({ register, errors, setValue, watch, selectedFile, setSelectedFile, contract, API_BASE_URL }) => {

    const softwareList = [
        'ABELdent', 'ADSTR A MANAGEMENT', 'AXXIUM X', 'AXXIUM R', 'AXXIUM R+', 'TRACKER',
        'AD2000', 'CADI OPTIMUM', 'WINDENT', 'DEXIS', 'EXCELDENT', 'X TRAC', 'CONSULT PRO',
        'CURVE DMS', 'DENTIMAX', 'DIALOG', 'DOMTRAK', 'ENTERDENT', 'ORYX DENTAL SOFTWARE',
        'POWER PRACTICE', 'AXIUM', 'DOVETAIL', 'GOLD', 'DENTRIX', 'OMSVISION', 'ORTHONOVO',
        'ENDOVISION', 'DENTALVISION ENTREPRISE', 'PERIOVISION', 'IKLYK', 'QUADRA DENTAL SOFTWARE',
        'LIVE DDM', 'DENTONOVO', 'MAXIMUS', 'CLICK', 'MAXIDENT', 'PARADIGM', 'MACPRACTICE DDS',
        'OPEN DENTAL SOFTWARE', 'DENTALWARE', 'EAGLESOFT', 'CLEARDENT', 'PROGIDENT',
        'DENTITEK', 'SENSE', 'TDO', 'AUTOPIA', 'PROGITEK', 'AKITU ONE', 'GID', 'SIDEXIS', 'VISION'
    ];

    const selectedSoftwares = watch("software") || [];

    return (
        <div className="w-full bg-white space-y-8 mt-6">
            {/* Legend Style Header */}
            <div className="relative border border-slate-200 rounded-lg p-4 sm:p-6 pt-7 sm:pt-8 bg-white">
                <span className="absolute -top-3 left-4 bg-white px-2 text-[13px] sm:text-[15px] text-slate-400 font-normal">
                    Additional Details
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2  gap-y-6 md:gap-x-12">
                    {/* Parking Section */}
                    <div className="space-y-3">
                        <Label className="text-[15px] font-medium text-slate-600 flex items-center">
                            Parking
                        </Label>
                        <Input
                            {...register("parking")}
                            placeholder="-"
                            className="h-11 bg-white border-slate-200 text-slate-600 focus-visible:ring-1 focus-visible:ring-blue-400"
                        />
                    </div>

                    {/* Languages Section */}
                    <div className="space-y-3">
                        <Label className="text-[15px] font-medium text-slate-600  !mb-0">
                            Languages <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex flex-wrap items-center gap-4 md:gap-8 min-h-[44px]">
                            {['English', 'French', 'Spanish'].map((lang) => (
                                <div key={lang} className="flex items-center space-x-2 gap-2">
                                    <Checkbox
                                        id={`lang-${lang}`}
                                        value={lang}
                                        {...register("languages")}
                                        onCheckedChange={(checked) => {
                                            const current = watch("languages") || [];
                                            const next = checked
                                                ? [...current, lang]
                                                : current.filter(v => v !== lang);
                                            setValue("languages", next);
                                        }}
                                        className="rounded-lg h-5 w-5 border-slate-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                    />
                                    <label htmlFor={`lang-${lang}`} className="text-sm font-normal text-slate-500 cursor-pointer  !mb-0">
                                        {lang}
                                    </label>
                                </div>
                            ))}
                        </div>
                        {errors?.languages && <p className="text-xs text-red-500 italic mt-1">{errors.languages.message}</p>}
                    </div>
                </div>

                {/* Software Section */}
                <div className="mt-8 space-y-4">
                    <div className="flex justify-between items-center">
                        <Label className="text-[15px] font-medium text-slate-600  !mb-0">
                            Software <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex items-center space-x-2 gap-2">
                            <Checkbox
                                id="select-all-soft"
                                onCheckedChange={(checked) => {
                                    setValue("software", checked ? softwareList : []);
                                }}
                                className="rounded-lg "
                            />
                            <label htmlFor="select-all-soft" className="text-xs text-slate-400 cursor-pointer  !mb-0">Select All</label>
                        </div>
                    </div>

                    <div className="border border-slate-100 rounded-xl p-6 bg-[#fcfcfc] max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-4 gap-x-2">
                            {softwareList.map((software, idx) => (
                                <div key={idx} className="flex items-center space-x-3 gap-2">
                                    <Checkbox
                                        id={`soft-${idx}`}
                                        checked={selectedSoftwares.includes(software)}
                                        onCheckedChange={(checked) => {
                                            const next = checked
                                                ? [...selectedSoftwares, software]
                                                : selectedSoftwares.filter(s => s !== software);
                                            setValue("software", next);
                                        }}
                                        className="rounded-lg h-5 w-5 border-slate-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                    />
                                    <label htmlFor={`soft-${idx}`} className="text-sm font-normal text-slate-500 truncate cursor-pointer  !mb-0">
                                        {software}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    {errors?.software && <p className="text-xs text-red-500 italic mt-1">{errors.software.message}</p>}
                </div>

                {/* Detailed Job Description */}
                <div className="mt-8 space-y-3">
                    <Label className="text-[15px] font-medium text-slate-600">
                        Detailed Job Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                        {...register("detailed_job_description")}
                        placeholder="-"
                        className="min-h-[120px] bg-white border-slate-200 text-slate-600 focus-visible:ring-1 focus-visible:ring-blue-400 placeholder:text-slate-300"
                    />
                    {errors?.detailed_job_description && <p className="text-xs text-red-500 italic">{errors.detailed_job_description.message}</p>}
                </div>

                {/* Additional Info Input */}
                <div className="mt-8 space-y-3">
                    <Label className="text-[15px] font-medium text-slate-600">
                        Additional Information
                    </Label>
                    <Input
                        {...register("additional_info")}
                        placeholder="-"
                        className="h-11 bg-white border-slate-200 text-slate-600 focus-visible:ring-1 focus-visible:ring-blue-400"
                    />
                </div>

                {/* Attachments Section - Horizontal Split */}
                <div className="mt-10 space-y-4">
                    <Label className="text-[15px] font-medium text-slate-600">
                        Attachments
                    </Label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        {/* Upload Zone */}
                        <div
                            onClick={() => document.getElementById('attachments').click()}
                            className="border-2 border-dashed border-slate-200 rounded-xl bg-[#fcfcfc] p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50/50 transition-all group"
                        >
                            <input
                                type="file"
                                id="attachments"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setSelectedFile(file);
                                        setValue("attachments", file);
                                    }
                                }}
                            />
                            <div className="bg-slate-100 p-3 rounded-lg mb-4 group-hover:scale-110 transition-transform">
                                <CloudUpload className="w-6 h-6 text-slate-400" />
                            </div>
                            <p className="text-[15px] text-slate-600">
                                <span className="text-blue-500 font-semibold underline underline-offset-4">Click here</span> to upload or drop files here
                            </p>
                        </div>

                        {/* File Preview List */}
                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin">
                            {selectedFile && (
                                <div className="bg-[#f8fafc] rounded-lg p-4 flex items-center gap-4 animate-in fade-in slide-in-from-right-2">
                                    <div className="bg-blue-100 p-2.5 rounded text-blue-600">
                                        <FileImage size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="text-[13px] font-medium text-slate-700 truncate">{selectedFile.name}</span>
                                            <span className="text-blue-500 text-[11px] font-bold cursor-pointer hover:underline">• Preview</span>
                                        </div>
                                        <Progress value={100} className="h-1.5 bg-slate-200" />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[11px] text-slate-400 font-medium">{(selectedFile.size / (1024 * 1024)).toFixed(1)}MB</span>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedFile(null)}
                                            className="text-slate-300 hover:text-red-500 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Backend Attachment */}
                            {contract?.attachments && !selectedFile && (
                                <div className="bg-[#f8fafc] rounded-lg p-4 flex items-center gap-4">
                                    <div className="bg-slate-100 p-2.5 rounded text-slate-500">
                                        <FileText size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-medium text-slate-700 truncate">{contract.attachments.split('/').pop()}</p>
                                        <a href={`${API_BASE_URL ?? ""}/${contract?.attachments}`} target="_blank" rel="noreferrer" className="text-blue-500 text-[11px] font-bold hover:underline flex items-center mt-1">
                                            <Download className="w-3 h-3 mr-1" /> Download Existing
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdditionalDetails;