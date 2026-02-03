import {Card, CardContent, CardHeader, CardTitle} from "@components/ui/card.jsx";
import {Label} from "@components/ui/label.jsx";
import {Building2} from "lucide-react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@components/ui/select.jsx";

const ProfessionalCategoryRole = () => {
    return (
        <Card className="shadow-sm border border-[#F3F4F6] mb-6 rounded-lg py-6 gap-2">
            <CardHeader>
                <CardTitle className="text-[#194185] text-sm font-bold flex items-center gap-2">
                    Professional Category & Role
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">


                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Professional Category */}
                    <div className="space-y-2 text-left">
                        <Label htmlFor="category" className="text-[#4B5563] text-sm">
                            Professional Category <span className="text-red-500">*</span>
                        </Label>

                        <div className="relative group">
                            {/* আইকনটিকে এখানে Absolute করে বসানো হয়েছে */}
                            <div
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563] z-10 pointer-events-none">
                                <Building2 size={18}/>
                            </div>

                            <Select
                                id="category"
                                value={watchedCategoryId?.toString()}
                                onValueChange={(value) => {
                                    setValue("professional_category_id", value);
                                    setValue("professional_role_ids", []);
                                    setValue("specialist_dentist_role", "");
                                }}
                            >
                                {/* pl-10 এখানে আইকন এবং টেক্সটের মাঝে গ্যাপ তৈরি করবে */}
                                <SelectTrigger
                                    className="w-full bg-[#f1f4f9] !border-none focus:ring-1 focus:ring-blue-400 h-12 !pl-10 pr-4 rounded-lg text-gray-600 outline-none"
                                >
                                    <SelectValue placeholder="Select Professional Category"/>
                                </SelectTrigger>

                                <SelectContent>
                                    {categories?.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {errors.professional_category_id && (
                            <p className="text-xs text-red-500 mt-1">
                                {errors.professional_category_id.message}
                            </p>
                        )}
                    </div>

                    {/* Professional Role */}
                    <div className="space-y-2">
                        <Label className="text-[#4B5563] text-sm">
                            Professional Role <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <Select
                                disabled={!selectedCategory}
                                value={watchedRoleIds?.[0]?.toString()}
                                onValueChange={(value) => {
                                    setValue("professional_role_ids", [value]);
                                    setValue("specialist_dentist_role", "");
                                }}
                            >
                                <SelectTrigger
                                    className="w-full bg-[#f8f9fc] border-gray-200 h-12 rounded-lg focus:ring-1 focus:ring-blue-400">
                                    <SelectValue placeholder="Select Professional Role"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedCategory?.professional_roles.map((role) => (
                                        <SelectItem key={role.id} value={role.id.toString()}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {errors.professional_role_ids && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.professional_role_ids.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Specialist Dentist Role Section */}
                {selectedRoleIds.length > 0 &&
                    selectedCategory?.professional_roles
                        ?.find((r) => r.id === selectedRoleIds[0])
                        ?.name.toLowerCase() === "specialist dentist" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="text-[#194185] font-bold text-sm mt-4">
                                Specialist Dentist Selected
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="specialty" className="text-[#4B5563] text-sm">
                                    Dental Specialty <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Select id="specialty"
                                            value={watchedSpecialty}
                                            onValueChange={(value) => setValue("specialist_dentist_role", value)}
                                    >
                                        <SelectTrigger
                                            className="w-full bg-[#f8f9fc] border-gray-200 h-12 rounded-lg !pl-10 focus:ring-1 focus:ring-blue-400">
                                            <div
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                <Building2 size={18}/>
                                            </div>
                                            <SelectValue placeholder="Select Specialty"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="orthodontist">Orthodontics</SelectItem>
                                            <SelectItem value="endodontist">Endodontics</SelectItem>
                                            <SelectItem value="periodontist">Periodontics</SelectItem>
                                            <SelectItem value="pediatric dentist">Pediatric Dentist</SelectItem>
                                            <SelectItem value="prosthodontist">Prosthodontics</SelectItem>
                                            <SelectItem value="oral and maxillofacial surgeon">Oral &
                                                Maxillofacial
                                                Surgeon</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {errors.specialist_dentist_role && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.specialist_dentist_role.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
            </CardContent>
        </Card>
    );
};

export default ProfessionalCategoryRole;