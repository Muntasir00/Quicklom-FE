import React, { useState } from 'react';
import {
    Building2, Users, Eye, Edit3, ShieldCheck, AlertCircle,
    MapPin, Phone, Mail, Globe, Briefcase, FileText,
    Download, UploadCloud, Stethoscope, Pill, Home, GraduationCap
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Badge } from "@components/ui/badge";
import { Card, CardContent } from "@components/ui/card";
import { Alert, AlertDescription } from "@components/ui/alert";

const InstituteProfilePage = () => {
    const [activeTab, setActiveTab] = useState("category");

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Top Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Building2 className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Institute Profile</h1>
                            <p className="text-sm text-slate-500">Manage your institute details and settings</p>
                        </div>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-6 rounded-lg transition-all">
                        <Edit3 className="w-4 h-4" /> Edit Profile
                    </Button>
                </div>

                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InfoCard label="Category" value="Recruitment Agency" icon={<Building2 className="w-5 h-5 text-blue-600" />} />
                    <InfoCard label="Specialties" value="Not Set" icon={<Users className="w-5 h-5 text-blue-600" />} />
                    <InfoCard label="Mode" value="Viewing" icon={<Eye className="w-5 h-5 text-blue-600" />} isMode />
                </div>

                {/* Main Content Tabs */}
                <Card className="border-none shadow-sm overflow-hidden rounded-xl">
                    <Tabs defaultValue="category" className="w-full" onValueChange={setActiveTab}>
                        <div className="bg-white border-b overflow-x-auto scrollbar-hide">
                            <TabsList className="bg-transparent h-14 justify-start px-4 gap-6">
                                <TabTrigger value="category" icon={<Building2 className="w-4 h-4" />} label="Institute Category & Details" />
                                <TabTrigger value="contact" icon={<Users className="w-4 h-4" />} label="Contact Information" />
                                <TabTrigger value="service" icon={<FileText className="w-4 h-4" />} label="Service Details" />
                                <TabTrigger value="billing" icon={<Briefcase className="w-4 h-4" />} label="Billing Information" />
                                <TabTrigger value="document" icon={<FileText className="w-4 h-4" />} label="Required Document" />
                            </TabsList>
                        </div>

                        <CardContent className="p-6 bg-white">
                            {/* Tab 1: Category & Details */}
                            <TabsContent value="category" className="mt-0 space-y-8">
                                <div className="space-y-4">
                                    <h3 className="font-bold text-slate-800">Institute Category</h3>
                                    <div className="flex items-center justify-between p-4 bg-[#F0F7FF] rounded-xl border border-blue-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                <Briefcase className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium">Category</p>
                                                <p className="font-bold text-blue-900">Recruitment Agency</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-[#22C55E] hover:bg-[#22C55E] text-white px-3 py-1 flex items-center gap-1 border-none font-medium">
                                            <ShieldCheck className="w-4 h-4" /> Verified
                                        </Badge>
                                    </div>
                                    <Alert variant="warning" className="bg-[#FFF4F4] border-[#FFE2E2] text-[#E11D48] rounded-xl">
                                        <AlertCircle className="h-4 w-4 text-[#E11D48]" />
                                        <AlertDescription className="text-sm">
                                            Institute Category cannot be changed once saved. Contact support if you need to modify this.
                                        </AlertDescription>
                                    </Alert>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="font-bold text-slate-800">Agency Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <FormInput label="Agency Name" value="agency 01" icon={<Building2 />} required />
                                        <FormInput label="Business Name" value="0258963kjh" icon={<FileText />} required />
                                        <FormInput label="Head Office Address" value="Baker street, canada" icon={<MapPin />} required />
                                        <FormInput label="City" value="Bridgewater" required />
                                        <FormInput label="Province" value="Nova Scotia" required />
                                        <FormInput label="Postal Code" value="B4V 2NB" required />
                                        <FormInput label="Phone Number" value="(+880) 1516184764" icon={<Phone />} required />
                                        <FormInput label="Email Address" value="agency.hr@gmail.com" icon={<Mail />} required />
                                        <FormInput label="Website" value="https://www.example.com" icon={<Globe />} required />
                                    </div>
                                    <Button className="bg-blue-600 px-8 py-6 rounded-lg font-bold">Edit Details</Button>
                                </div>
                            </TabsContent>

                            {/* Tab 2: Contact Info */}
                            <TabsContent value="contact" className="mt-0 space-y-8">
                                <div className="space-y-6">
                                    <h3 className="font-bold text-slate-800">Primary Contact Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <FormInput label="Full Name" value="Hamza El Mazouzi" icon={<Users />} required />
                                        <FormInput label="Position" value="CTO" icon={<FileText />} required />
                                        <FormInput label="Email Address" value="hamzaelmazouzi@gmail.com" icon={<Mail />} required />
                                        <FormInput label="Phone Number" value="(+880) 1516184764" icon={<Phone />} required />
                                    </div>
                                    <Button className="bg-blue-600 px-8 py-6 rounded-lg font-bold">Edit Details</Button>
                                </div>
                            </TabsContent>

                            {/* Tab 3: Service Details */}
                            <TabsContent value="service" className="mt-0 space-y-8">
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <p className="text-sm font-bold text-slate-700">Specialties Covered <span className="text-red-500">*</span></p>
                                        <div className="flex flex-wrap gap-3">
                                            <SelectionBadge label="General Medicine" icon={<Stethoscope />} />
                                            <SelectionBadge label="Dental Care" icon={<Users />} active />
                                            <SelectionBadge label="Pharmacy" icon={<Pill />} />
                                            <SelectionBadge label="Nursing & Home Care" icon={<Home />} />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-sm font-bold text-slate-700">Region Served <span className="text-red-500">*</span></p>
                                        <div className="flex flex-wrap gap-2">
                                            {["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Nova Scotia", "Ontario", "Quebec", "Saskatchewan"].map(region => (
                                                <Badge key={region} variant={["British Columbia", "New Brunswick", "Nova Scotia", "Ontario", "Quebec", "Prince Edward Island"].includes(region) ? "default" : "secondary"}
                                                       className={`px-4 py-2 rounded-lg font-medium ${["British Columbia", "New Brunswick", "Nova Scotia", "Ontario", "Quebec"].includes(region) ? "bg-blue-600" : "bg-slate-100 text-slate-600"}`}>
                                                    {region}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                                        <FormInput label="Years of Experience" value="11" icon={<FileText />} required />
                                        <FormInput label="Number of Recruiters" value="12" icon={<Users />} required />
                                        <FormInput label="Licensing/ Accreditation" value="11" required />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Recruitment Process Description <span className="text-red-500">*</span></label>
                                        <Textarea className="min-h-[120px] bg-slate-50 border-slate-200 rounded-xl" defaultValue="Bridgewater" />
                                    </div>

                                    <Button className="bg-blue-600 px-8 py-6 rounded-lg font-bold">Edit Details</Button>
                                </div>
                            </TabsContent>

                            {/* Tab 5: Required Documents */}
                            <TabsContent value="document" className="mt-0 space-y-8">
                                <div className="space-y-6">
                                    <h3 className="font-bold text-slate-700 text-sm">Required Documents</h3>
                                    <div className="space-y-3">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-[#F8FAFC] rounded-xl border border-slate-100 gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-red-50 p-3 rounded-lg">
                                                        <FileText className="w-6 h-6 text-red-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-700">Sample Document 01</p>
                                                        <p className="text-xs text-slate-400">12 MB</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" className="flex-1 md:flex-none gap-2 text-blue-600 border-blue-100 bg-blue-50/50 hover:bg-blue-100">
                                                        <Download className="w-4 h-4" /> Download
                                                    </Button>
                                                    <Button variant="outline" className="flex-1 md:flex-none gap-2 text-white bg-blue-600 hover:bg-blue-700 border-none">
                                                        <Edit3 className="w-4 h-4" /> Edit
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-10 p-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-4 bg-slate-50/30">
                                        <div className="p-4 bg-white rounded-full shadow-sm">
                                            <UploadCloud className="w-10 h-10 text-slate-400" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-slate-700">Choose a file or drag & drop it here</p>
                                            <p className="text-sm text-slate-400">JPEG, PNG, PDF, and MP4 formats, up to 50MB</p>
                                        </div>
                                        <Button variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 px-8">Browse File</Button>
                                    </div>

                                    <Button className="bg-blue-600 px-8 py-6 rounded-lg font-bold">Edit Details</Button>
                                </div>
                            </TabsContent>

                        </CardContent>
                    </Tabs>
                </Card>
            </div>
        </div>
    );
};

// --- Sub-components for cleaner code ---

const InfoCard = ({ label, value, icon, isMode }) => (
    <Card className="bg-white border-none shadow-sm rounded-xl">
        <CardContent className="p-4 flex items-center justify-between">
            <div>
                <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
                <p className="font-bold text-blue-900">{value}</p>
            </div>
            <div className={`p-2.5 rounded-lg ${isMode ? 'bg-blue-50 border border-blue-100' : 'bg-blue-50'}`}>
                {icon}
            </div>
        </CardContent>
    </Card>
);

const TabTrigger = ({ value, icon, label }) => (
    <TabsTrigger
        value={value}
        className="data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-14 px-2 flex items-center gap-2 text-slate-500 font-bold whitespace-nowrap"
    >
        {icon} {label}
    </TabsTrigger>
);

const FormInput = ({ label, value, icon, required }) => (
    <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            {icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4">
                    {React.cloneElement(icon, { className: "w-4 h-4" })}
                </div>
            )}
            <Input
                readOnly
                value={value}
                className={`bg-[#F8FAFC] border-slate-200 rounded-lg h-12 ${icon ? 'pl-10' : 'pl-4'} text-slate-600 focus-visible:ring-blue-500`}
            />
        </div>
    </div>
);

const SelectionBadge = ({ label, icon, active }) => (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-bold text-sm transition-all cursor-pointer ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'}`}>
        {icon && React.cloneElement(icon, { className: "w-4 h-4" })}
        {label}
    </div>
);

export default InstituteProfilePage;