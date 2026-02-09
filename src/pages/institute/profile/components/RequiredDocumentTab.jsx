// RequiredDocumentTab.jsx
import React from "react";
import { useFormContext } from "react-hook-form";

import { Card } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { Separator } from "@components/ui/separator";

import { Download, FileText, Pencil, UploadCloud } from "lucide-react";

const DOCS = [
    {
        key: "proof_of_business_registration",
        label: "Proof of Business Registration",
    },
    {
        key: "proof_of_liability_insurance",
        label: "Proof of Liability Insurance",
    },
    {
        key: "confidentiality_agreement",
        label: "Confidentiality Agreement",
    },
];

export default function RequiredDocumentTab({ isEditing, onSelectFile }) {
    const { watch } = useFormContext();

    const [open, setOpen] = React.useState(false);
    const [activeDocKey, setActiveDocKey] = React.useState(null);

    const openUpload = (docKey) => {
        if (!isEditing) return;
        setActiveDocKey(docKey);
        setOpen(true);
    };

    const handlePickFile = (e) => {
        const file = e.target.files?.[0];
        if (!file || !activeDocKey) return;
        onSelectFile?.(activeDocKey, file);
        setOpen(false);
    };

    const handleDownload = (path) => {
        if (!path) return;
        // If your backend serves files with a base URL, replace below accordingly.
        // For now open relative path:
        window.open(`/${path}`, "_blank");
    };

    return (
        <div className="space-y-5 rounded-xl border border-[#F3F4F6] bg-white p-6">
            <div className="text-sm font-semibold text-slate-900">Required Documents</div>

            <Card className="  !border-none bg-white p-0 shadow-none">
                <div className="space-y-3">
                    {DOCS.map((d) => {
                        const path = watch(d.key); // existing file path string from API

                        return (
                            <div
                                key={d.key}
                                className="flex flex-col gap-3 rounded-xl border border-[#EAF5FE] bg-[#F3F9FE] p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#FFFFFF] text-[#ED354A] ">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="text-base  text-[#374151]">{d.label}</div>
                                        <div className="text-xs text-[#374151]">
                                            {path ? "Uploaded" : "Not uploaded"}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 sm:justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-10 !rounded-md border-slate-200 bg-[#DBEEFF] px-4 text-slate-700 hover:bg-slate-50"
                                        onClick={() => handleDownload(path)}
                                        disabled={!path}
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Download
                                    </Button>

                                    <Button
                                        type="button"
                                        className={[
                                            "h-10 !rounded-md px-4 text-white",
                                            isEditing ? "bg-[#2D8FE3] hover:bg-[#1956df]" : "bg-[#2D8FE3]/60",
                                        ].join(" ")}
                                        disabled={!isEditing}
                                        onClick={() => openUpload(d.key)}
                                    >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/*<Separator className="my-5 bg-slate-200" />*/}

                {/* General Upload dropzone (optional) */}
                <div>
                    <div className="text-xs font-medium text-[#194185]">Upload File</div>

                    <button
                        type="button"
                        disabled={!isEditing}
                        onClick={() => openUpload("proof_of_business_registration")}
                        className={[
                            "mt-3 w-full !rounded-xl border-2 border-dashed px-4 py-10 text-center",
                            "transition-colors",
                            isEditing
                                ? "border-slate-200 bg-white hover:bg-slate-50"
                                : "border-slate-200 bg-white opacity-60 cursor-not-allowed",
                        ].join(" ")}
                    >
                        <div className="mx-auto flex max-w-md flex-col items-center gap-2">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef6ff] text-[#1f63ff]">
                                <UploadCloud className="h-5 w-5" />
                            </div>
                            <div className="text-sm font-semibold text-[#194185]">
                                Choose a file or drag &amp; drop it here
                            </div>
                            <div className="text-xs text-slate-500">
                                JPEG, PNG, PDF, and MP4 formats, up to 50MB
                            </div>
                            <div className="mt-2 inline-flex h-10 items-center justify-center rounded-xl bg-[#eef6ff] px-4 text-sm font-medium text-[#1f63ff]">
                                Browse File
                            </div>
                        </div>
                    </button>
                </div>
            </Card>

            {/* Upload modal */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-xl rounded-2xl border border-slate-200 p-0">
                    <DialogHeader className="px-6 pt-6">
                        <DialogTitle className="text-base font-semibold text-[#194185]">
                            Upload File
                        </DialogTitle>
                        <div className="text-sm text-slate-500">
                            Select and upload the file for this document
                        </div>
                    </DialogHeader>

                    <div className="px-6 pb-6 pt-4">
                        <label className="block w-full cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 bg-white px-4 py-12 text-center hover:bg-slate-50">
                            <input
                                type="file"
                                className="hidden"
                                onChange={handlePickFile}
                                disabled={!isEditing}
                            />
                            <div className="mx-auto flex max-w-md flex-col items-center gap-2">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef6ff] text-[#1f63ff]">
                                    <UploadCloud className="h-5 w-5" />
                                </div>
                                <div className="text-sm font-semibold text-slate-900">
                                    Click to choose a file
                                </div>
                                <div className="text-xs text-slate-500">
                                    JPEG, PNG, PDF, and MP4 formats, up to 50MB
                                </div>
                            </div>
                        </label>

                        <div className="mt-4 flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-10 rounded-xl border-slate-200 bg-white px-4 text-slate-700 hover:bg-slate-50"
                                onClick={() => setOpen(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}


// // RequiredDocumentTab.jsx
// import React from "react";
// import { useFormContext } from "react-hook-form";
//
// import { Card } from "@components/ui/card";
// import { Button } from "@components/ui/button";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@components/ui/dialog";
// import { Separator } from "@components/ui/separator";
//
// import { Download, FileText, Pencil, UploadCloud } from "lucide-react";
//
// /**
//  * IMPORTANT:
//  * - Download always enabled
//  * - Edit enabled ONLY when isEditing === true
//  * - Upload dropzone disabled unless isEditing
//  * - Upload dialog opens ONLY when isEditing
//  */
//
// export default function RequiredDocumentTab({ isEditing }) {
//     const { watch } = useFormContext();
//     const docs = watch("requiredDocuments.documents") || [];
//
//     const [open, setOpen] = React.useState(false);
//
//     const openUpload = () => {
//         if (!isEditing) return;
//         setOpen(true);
//     };
//
//     return (
//         <div className="space-y-5">
//             <div className="text-sm font-semibold text-slate-900">Required Documents</div>
//
//             <Card className="rounded-2xl border border-slate-200 bg-white p-4 shadow-none sm:p-5">
//                 <div className="space-y-3">
//                     {docs.map((d) => (
//                         <div
//                             key={d.id}
//                             className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-[#f7fbff] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
//                         >
//                             <div className="flex items-center gap-3">
//                                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#e11d48] shadow-sm">
//                                     <FileText className="h-5 w-5" />
//                                 </div>
//                                 <div>
//                                     <div className="text-sm font-semibold text-slate-900">{d.name}</div>
//                                     <div className="text-xs text-slate-500">{d.sizeMb} MB</div>
//                                 </div>
//                             </div>
//
//                             <div className="flex gap-2 sm:justify-end">
//                                 <Button
//                                     type="button"
//                                     variant="outline"
//                                     className="h-10 rounded-xl border-slate-200 bg-white px-4 text-slate-700 hover:bg-slate-50"
//                                     onClick={() => {
//                                         // Download always enabled - wire backend later
//                                         console.log("Download:", d.id);
//                                     }}
//                                 >
//                                     <Download className="mr-2 h-4 w-4" />
//                                     Download
//                                 </Button>
//
//                                 <Button
//                                     type="button"
//                                     className={[
//                                         "h-10 rounded-xl px-4 text-white",
//                                         isEditing ? "bg-[#1f63ff] hover:bg-[#1956df]" : "bg-[#1f63ff]/60",
//                                     ].join(" ")}
//                                     disabled={!isEditing}
//                                     onClick={() => {
//                                         console.log("Edit document:", d.id);
//                                     }}
//                                 >
//                                     <Pencil className="mr-2 h-4 w-4" />
//                                     Edit
//                                 </Button>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//
//                 <Separator className="my-5 bg-slate-200" />
//
//                 {/* Upload section */}
//                 <div>
//                     <div className="text-xs font-medium text-slate-600">Upload File</div>
//
//                     <button
//                         type="button"
//                         onClick={openUpload}
//                         disabled={!isEditing}
//                         className={[
//                             "mt-3 w-full rounded-2xl border-2 border-dashed px-4 py-10 text-center",
//                             "transition-colors",
//                             isEditing
//                                 ? "border-slate-200 bg-white hover:bg-slate-50"
//                                 : "border-slate-200 bg-white opacity-60 cursor-not-allowed",
//                         ].join(" ")}
//                     >
//                         <div className="mx-auto flex max-w-md flex-col items-center gap-2">
//                             <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef6ff] text-[#1f63ff]">
//                                 <UploadCloud className="h-5 w-5" />
//                             </div>
//                             <div className="text-sm font-semibold text-slate-900">
//                                 Choose a file or drag &amp; drop it here
//                             </div>
//                             <div className="text-xs text-slate-500">
//                                 JPEG, PNG, PDF, and MP4 formats, up to 50MB
//                             </div>
//                             <div className="mt-2 inline-flex h-10 items-center justify-center rounded-xl bg-[#eef6ff] px-4 text-sm font-medium text-[#1f63ff]">
//                                 Browse File
//                             </div>
//                         </div>
//                     </button>
//                 </div>
//             </Card>
//
//             {/* Upload modal */}
//             <Dialog open={open} onOpenChange={setOpen}>
//                 <DialogContent className="max-w-xl rounded-2xl border border-slate-200 p-0">
//                     <DialogHeader className="px-6 pt-6">
//                         <DialogTitle className="text-base font-semibold text-slate-900">
//                             Upload File
//                         </DialogTitle>
//                         <div className="text-sm text-slate-500">Select and upload the files of your choice</div>
//                     </DialogHeader>
//
//                     <div className="px-6 pb-6 pt-4">
//                         <button
//                             type="button"
//                             className="w-full rounded-2xl border-2 border-dashed border-slate-200 bg-white px-4 py-12 text-center hover:bg-slate-50"
//                             onClick={() => {
//                                 console.log("Browse (mock) upload");
//                             }}
//                         >
//                             <div className="mx-auto flex max-w-md flex-col items-center gap-2">
//                                 <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef6ff] text-[#1f63ff]">
//                                     <UploadCloud className="h-5 w-5" />
//                                 </div>
//                                 <div className="text-sm font-semibold text-slate-900">
//                                     Choose a file or drag &amp; drop it here
//                                 </div>
//                                 <div className="text-xs text-slate-500">
//                                     JPEG, PNG, PDF, and MP4 formats, up to 50MB
//                                 </div>
//                                 <div className="mt-2 inline-flex h-10 items-center justify-center rounded-xl bg-[#eef6ff] px-4 text-sm font-medium text-[#1f63ff]">
//                                     Browse File
//                                 </div>
//                             </div>
//                         </button>
//
//                         <div className="mt-4 flex justify-end gap-2">
//                             <Button
//                                 type="button"
//                                 variant="outline"
//                                 className="h-10 rounded-xl border-slate-200 bg-white px-4 text-slate-700 hover:bg-slate-50"
//                                 onClick={() => setOpen(false)}
//                             >
//                                 Close
//                             </Button>
//                         </div>
//                     </div>
//                 </DialogContent>
//             </Dialog>
//         </div>
//     );
// }
