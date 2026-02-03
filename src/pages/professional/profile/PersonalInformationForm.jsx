import React from "react";
import {
    UserCircle, Mail, Phone, Calendar,
    Languages, UploadCloud, Search, ChevronDown
} from "lucide-react";
import {Card, CardContent} from "@components/ui/card";
import {Input} from "@components/ui/input";
import {Button} from "@components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@components/ui/popover";
import {Checkbox} from "@components/ui/checkbox";
import {Command, CommandInput, CommandItem, CommandList} from "@components/ui/command.jsx";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@components/ui/form";

const PersonalInformationForm = ({
                                     form, // The entire form object from useForm()
                                     profileData,
                                     profilePhotoName,
                                     handlePhoneChange,
                                     handleProfilePhotoChange,
                                     API_BASE_URL,
                                 }) => {
    const {control, setValue} = form;

    // const selectedLanguages = watch("languages") || [];
    const languageOptions = [
        {id: "English", label: "GB English"},
        {id: "French", label: "FR French"},
        {id: "Spanish", label: "ES Spanish"},
        {id: "Mandarin", label: "CN Mandarin"},
        {id: "Arabic", label: "SA Arabic"},
        {id: "Hindi", label: "IN Hindi"},
        {id: "Bangla", label: "IN Bangla"},
    ];

    const toggleLanguage = (currentLanguages,langId) => {
        const current = Array.isArray(currentLanguages) ? [...currentLanguages] : [];
        const index = current.indexOf(langId);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(langId);
        }
        setValue("languages", current, { shouldValidate: true });
    };

    return (
        <Card className="shadow-sm border border-[#F3F4F6] mb-6 rounded-lg py-6 gap-2">
            <CardContent className="space-y-6">

                {/* --- Primary Contact Information --- */}
                <section className="space-y-6">
                    <h3 className="text-[#194185] font-bold text-md">Primary Contact Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* First Name */}
                        <FormField
                            control={control}
                            name="first_name"
                            render={({field}) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-gray-600">First Name<span
                                        className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <UserCircle
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                                size={18}/>
                                            <Input
                                                {...field}
                                                className="!pl-10 bg-[#f1f4f9] border-none h-12 rounded-lg"
                                                placeholder="Hamza El Mazouzi"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-xs"/>
                                </FormItem>
                            )}
                        />

                        {/* Last Name */}
                        <FormField
                            control={control}
                            name="last_name"
                            render={({field}) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-gray-600">Last Name<span
                                        className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <UserCircle
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                                size={18}/>
                                            <Input {...field}
                                                   className="!pl-10 bg-[#f1f4f9] border-none h-12 rounded-lg"
                                                   placeholder="Mazouzi"/>
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-xs"/>
                                </FormItem>
                            )}
                        />

                        {/* Email */}
                        <FormField
                            control={control}
                            name="email"
                            render={({field}) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-gray-600">Email Address<span
                                        className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                                  size={18}/>
                                            <Input {...field} type="email"
                                                   className="!pl-10 bg-[#f1f4f9] border-none h-12 rounded-lg"
                                                   placeholder="hamza@gmail.com"/>
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-xs"/>
                                </FormItem>
                            )}
                        />

                        {/* Phone Number */}
                        <FormField
                            control={control}
                            name="phone_number"
                            render={({field}) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-gray-600">Phone Number<span
                                        className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                                   size={18}/>
                                            <Input
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    handlePhoneChange?.(e);
                                                }}
                                                className="!pl-10 bg-[#f1f4f9] border-none h-12 rounded-lg"
                                                placeholder="(+880) 1516184764"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-xs"/>
                                </FormItem>
                            )}
                        />

                        {/* Date of Birth */}
                        <FormField
                            control={control}
                            name="dob"
                            render={({field}) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-gray-600">Date of Birth<span
                                        className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                                      size={18}/>
                                            <Input {...field} type="date"
                                                   className="!pl-10 bg-[#f1f4f9] border-none h-12 rounded-lg"/>
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-xs"/>
                                </FormItem>
                            )}
                        />

                        {/* Profile Photo Upload */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <FormLabel className="text-gray-600">Profile Photo<span
                                    className="text-red-500">*</span></FormLabel>
                                {profileData?.profile_photo && (
                                    <a href={`${API_BASE_URL}/${profileData.profile_photo}`} target="_blank"
                                       rel="noreferrer" className="text-[10px] text-gray-500 underline">View Current
                                        Photo</a>
                                )}
                            </div>
                            <div className="relative flex items-center bg-[#f1f4f9] rounded-lg h-12 px-3">
                                <UploadCloud className="text-gray-400 mr-2" size={18}/>
                                <span
                                    className="text-gray-400 text-sm flex-1 truncate">{profilePhotoName || "Upload a photo"}</span>
                                <input type="file" className="hidden" id="photo-upload" accept="image/*"
                                       onChange={handleProfilePhotoChange}/>
                                <Button asChild size="sm"
                                        className="bg-[#3b82f6] hover:bg-blue-600 h-8 rounded-md px-4">
                                    <label htmlFor="photo-upload" className="cursor-pointer">Upload</label>
                                </Button>
                            </div>
                        </div>

                        {/* Gender Select */}
                        <FormField
                            control={control}
                            name="gender"
                            render={({field}) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-gray-600">Gender<span
                                        className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger
                                                className="bg-[#f1f4f9] border-none h-12 rounded-lg !pl-10 relative w-full">
                                                <UserCircle
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                                    size={18}/>
                                                <SelectValue placeholder="Select Gender"/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-xs"/>
                                </FormItem>
                            )}
                        />


                        {/* Language Multi-Select */}
                        <FormField
                            control={control}
                            name="languages"
                            render={({ field }) => {
                                // Safely get the current array of languages
                                const currentVals = Array.isArray(field.value) ? field.value : [];

                                return (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-gray-600">Language Spoken<span className="text-red-500">*</span></FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" className="w-full bg-[#f1f4f9] border-none h-12 rounded-lg pl-10 justify-between text-gray-600 font-normal hover:bg-[#f1f4f9]">
                                                        <Languages className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                        <span className="truncate">
                              {currentVals.length > 0 ? currentVals.join(", ") : "Select Languages"}
                            </span>
                                                        <ChevronDown size={16} className="text-gray-400" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="p-0 w-[250px]" align="start">
                                                <div className="p-3 border-b">
                                                    <p className="text-xs font-semibold text-gray-400 mb-2 uppercase">Language Selection</p>
                                                    <div className="relative">
                                                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                                        <Input className="pl-8 h-8 bg-gray-50 border-none text-xs" placeholder="Search" />
                                                    </div>
                                                </div>
                                                <div className="max-h-[250px] overflow-y-auto p-2">
                                                    {languageOptions.map((lang) => (
                                                        <div
                                                            key={lang.id}
                                                            className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                                                            onClick={() => toggleLanguage(currentVals, lang.id)}
                                                        >
                                                            <Checkbox
                                                                checked={currentVals.includes(lang.id)}
                                                                onCheckedChange={() => toggleLanguage(currentVals, lang.id)}
                                                                className="border-blue-500 data-[state=checked]:bg-blue-500"
                                                            />
                                                            <span className="text-sm text-gray-700">{lang.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />
                    </div>
                </section>

                {/* --- Address Information --- */}
                <section className="space-y-6">
                    <h3 className="text-[#194185] font-bold text-md">Address Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        <FormField
                            control={control}
                            name="street_address"
                            render={({field}) => (
                                <FormItem className="md:col-span-1 space-y-2">
                                    <FormLabel className="text-gray-600">Street Address<span
                                        className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input {...field} className="bg-[#f1f4f9] border-none h-12 rounded-lg"
                                               placeholder="Baker Book Parish, NB"/>
                                    </FormControl>
                                    <FormMessage className="text-xs"/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="city"
                            render={({field}) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-gray-600">City<span
                                        className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input {...field} className="bg-[#f1f4f9] border-none h-12 rounded-lg"
                                               placeholder="City Name"/>
                                    </FormControl>
                                    <FormMessage className="text-xs"/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="province"
                            render={({field}) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-gray-600">Province<span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input {...field} className="bg-[#f1f4f9] border-none h-12 rounded-lg"
                                               placeholder="Province"/>
                                    </FormControl>
                                    <FormMessage className="text-xs"/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="postal_code"
                            render={({field}) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-gray-600">Postal Code<span
                                        className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input {...field} className="bg-[#f1f4f9] border-none h-12 rounded-lg"
                                               placeholder="T5C1256"/>
                                    </FormControl>
                                    <FormMessage className="text-xs"/>
                                </FormItem>
                            )}
                        />

                        {/* ID Upload */}
                        <div className="md:col-span-1 space-y-2">
                            <div className="flex justify-between items-center">
                                <FormLabel className="text-gray-600">ID Upload<span
                                    className="text-red-500">*</span></FormLabel>
                                <button type="button" className="text-[10px] text-gray-500 underline">View/Download
                                    Current ID
                                </button>
                            </div>
                            <div className="relative flex items-center bg-[#f1f4f9] rounded-lg h-12 px-3">
                                <UploadCloud className="text-gray-400 mr-2" size={18}/>
                                <span className="text-gray-400 text-sm flex-1">Choose ID Document</span>
                                <Button type="button" size="sm"
                                        className="bg-[#3b82f6] hover:bg-blue-600 h-8 rounded-md px-4">Upload</Button>
                            </div>
                        </div>
                    </div>
                </section>

            </CardContent>
        </Card>
    );
};

export default PersonalInformationForm;