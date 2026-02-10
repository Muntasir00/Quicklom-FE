import {useState, useEffect} from 'react';
import {Label} from "@components/ui/label";
import {Input} from "@components/ui/input";
import {Textarea} from "@components/ui/textarea";
import {Checkbox} from "@components/ui/checkbox";
import {Button} from "@components/ui/button";
import {
    UploadCloud,
    FileText,
    X,
    Download,
    AlertTriangle,
} from "lucide-react";

const AdditionalDetails = ({
                               register,
                               errors,
                               setValue,
                               watch,
                               selectedFile,
                               setSelectedFile,
                               contract,
                               API_BASE_URL
                           }) => {

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
    const attachmentWatch = watch("attachments");
    const [previewUrl, setPreviewUrl] = useState("");

    // Attachments: handles preview generation when file is selected
    useEffect(() => {
        if (attachmentWatch && attachmentWatch.length > 0) {
            const file = attachmentWatch[0];
            setSelectedFile(file);
            if (file.type.startsWith("image/")) {
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
                return () => URL.revokeObjectURL(url); // Clean up
            } else {
                setPreviewUrl("");
            }
        }
    }, [attachmentWatch, setSelectedFile]);

    const removeSelectedFile = () => {
        setSelectedFile(null);
        setPreviewUrl("");
        setValue("attachments", null); // Reset file input in form state
    };

    return (
        <div className="w-full bg-white space-y-8 mt-6">
            {/* Legend Style Box for Additional Details */}
            <div className="relative border border-slate-200 rounded-lg p-4 sm:p-6 pt-7 sm:pt-8 bg-white">
                <span
                    className="absolute -top-3 left-4 bg-white px-2 text-[13px] sm:text-[15px] text-slate-400 font-normal">
                    Additional Details
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 md:gap-x-12">
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
                        <Label className="text-[15px] font-medium text-slate-600 !mb-0">
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
                        {errors?.languages &&
                            <p className="text-xs text-red-500 italic mt-1">{errors.languages.message}</p>}
                    </div>
                </div>

                {/* Software Section */}
                <div className="mt-8 space-y-4">
                    <div className="flex justify-between items-center">
                        <Label className="text-[15px] font-medium text-slate-600 !mb-0">
                            Software <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex items-center space-x-2 gap-2">
                            <Checkbox
                                id="select-all-soft"
                                onCheckedChange={(checked) => {
                                    setValue("software", checked ? softwareList : [], {shouldValidate: true});
                                }}
                                className="rounded-lg "
                            />
                            <label htmlFor="select-all-soft" className="text-xs text-slate-400 cursor-pointer !mb-0">Select
                                All</label>
                        </div>
                    </div>

                    <div
                        className="border border-slate-100 rounded-xl p-6 bg-[#fcfcfc] max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
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
                                            setValue("software", next, {shouldValidate: true});
                                        }}
                                        className="rounded-lg h-5 w-5 border-slate-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                    />
                                    <label htmlFor={`soft-${idx}`}
                                           className="text-sm font-normal text-slate-500 truncate cursor-pointer !mb-0">
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
                        placeholder="Describe the duties and environment..."
                        className="min-h-[120px] bg-white border-slate-200 text-slate-600 focus-visible:ring-1 focus-visible:ring-blue-400 placeholder:text-slate-300"
                    />
                    {errors?.detailed_job_description &&
                        <p className="text-xs text-red-500 italic">{errors.detailed_job_description.message}</p>}
                </div>

                {/* Additional Information */}
                <div className="mt-8 space-y-3">
                    <Label className="text-[15px] font-medium text-slate-600">
                        Additional Information
                    </Label>
                    <Input
                        {...register("additional_info")}
                        placeholder="Any extra details..."
                        className="h-11 bg-white border-slate-200 text-slate-600 focus-visible:ring-1 focus-visible:ring-blue-400"
                    />
                </div>

                {/* NEW ATTACHMENTS DESIGN */}
                <div className="mt-10 space-y-4 border-t border-slate-100 pt-6">
                    <div className="relative">
                         <span
                             className="text-[14px] sm:text-[15px] font-medium text-slate-600 flex items-center gap-2">
                            <UploadCloud className="w-4 h-4 text-blue-500"/>
                            Attachments
                        </span>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[13px] font-medium text-slate-500">
                            Upload File (PDF, JPG, PNG)
                        </Label>

                        <Input
                            {...register("attachments")}
                            type="file"
                            accept=".pdf,.jpg,.png,.jpeg"
                            className={`h-11 cursor-pointer file:cursor-pointer ${
                                errors?.attachments ? "border-red-500" : "border-slate-200"
                            }`}
                        />

                        {errors?.attachments && (
                            <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                                <AlertTriangle className="w-3 h-3"/> {errors.attachments.message}
                            </p>
                        )}

                        {/* File Preview Card */}
                        {selectedFile && (
                            <div
                                className="rounded-lg mt-2 border border-slate-200 bg-slate-50 p-3 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-3 min-w-0">
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
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
                                            {selectedFile.type === "application/pdf" ? "PDF Document" : "Image/File"} • {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={removeSelectedFile}
                                    className="gap-2 text-red-600 border-red-200 hover:bg-red-50 h-9"
                                >
                                    <X className="h-4 w-4"/>
                                    Remove
                                </Button>
                            </div>
                        )}

                        {/* Existing File Link */}
                        {contract?.attachments && !selectedFile && (
                            <div className="mt-2">
                                <a
                                    href={`${API_BASE_URL ?? ""}/${contract.attachments}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline bg-blue-50 px-3 py-2 rounded-md"
                                >
                                    <Download className="w-4 h-4"/>
                                    Download current attachment
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdditionalDetails;