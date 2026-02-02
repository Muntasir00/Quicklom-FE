import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ShieldCheck,
    Lock,
    User,
    Upload,
    Trash2,
    Mail,
    KeyRound,
    Eye,
    EyeOff,
    Check,
    X,
    Save
} from "lucide-react";

import { getAccountService, updateAccount } from "../../../services/user/AccountService";
import { editAccountSchema } from "../../../schemas/user/AccountSchema";
import UpdateEmailModelComponent from "@components/modals/user/UpdateEmailModelComponent";
import {Avatar, AvatarFallback, AvatarImage} from "@components/ui/avatar.jsx";

const Edit = () => {
    const role = sessionStorage.getItem("role") || "Professional";
    const [show, setShow] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState({current: false, new: false, confirm: false});

    // প্রোফাইল ফটোর জন্য স্টেট
    const [profileImage, setProfileImage] = useState(null);

    // আপনার সার্ভারের বেস ইউআরএল (যেমন: https://api.quicklocum.com/)
    const IMAGE_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/";

    const {
        register,
        handleSubmit,
        setValue,
        setError,
        formState: { errors, isDirty },
    } = useForm({
        resolver: zodResolver(editAccountSchema),
        defaultValues: { email: "", first_name: "", last_name: "", password: "", confirm_password: "", current_password: "" },
    });

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const response = await getAccountService();

                // ইমেইল এবং অন্যান্য ফ্ল্যাট ডাটা সেট করা
                setValue("email", response.email);

                // প্রোফাইল ডাটা সেট করা (first_name, last_name, photo)
                if (response.profiles && response.profiles.length > 0) {
                    const profileInfo = response.profiles[0].data;
                    setValue("first_name", profileInfo.first_name);
                    setValue("last_name", profileInfo.last_name);
                    setProfileImage(profileInfo.profile_photo);
                }
            } catch (err) {
                console.error("Error fetching account:", err);
            }
        };
        fetchAccount();
        document.title = "Account Settings | Quicklocum";
    }, [setValue]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await updateAccount(data);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            if (err.response?.data?.errors) {
                const serverErrors = err.response.data.errors;
                Object.keys(serverErrors).forEach((field) => {
                    setError(field, { type: "server", message: serverErrors[field] });
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="">
            <div className="space-y-6">

                {/* Top Stat Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="p-3 rounded-lg flex items-center justify-between border border-[#E6E6EB]">
                        <div className="space-y-1">
                            <p className="text-sm  text-[#194185] uppercase tracking-wider !mb-0">Security Status</p>
                            <h3 className="text-lg font-medium text-[#194185] !mb-0">Protected</h3>
                        </div>
                        <div className="p-3 bg-[#EAF5FE] rounded-lg">
                            <ShieldCheck className="w-6 h-6 text-blue-500" />
                        </div>
                    </div>
                    <div className="p-3 rounded-lg flex items-center justify-between border border-[#E6E6EB]">
                        <div className="space-y-1">
                            <p className="text-sm  text-[#194185]  uppercase tracking-wider !mb-0">Connection</p>
                            <h3 className="text-lg font-medium text-[#1e293b] !mb-0">Encrypted</h3>
                        </div>
                        <div className="p-3 bg-[#EBFFEE] rounded-lg">
                            <Lock className="w-6 h-6 text-[#19B28A]" />
                        </div>
                    </div>
                    <div className="p-3 rounded-lg flex items-center justify-between border border-[#E6E6EB]">
                        <div className="space-y-1">
                            <p className="text-sm  text-[#194185]  uppercase tracking-wider !mb-0">Account Type</p>
                            <h3 className="text-lg font-medium text-[#1e293b] capitalize !mb-0">{role}</h3>
                        </div>
                        <div className="p-3 bg-[#FBF1E7] rounded-lg">
                            <User className="w-6 h-6 text-[#F0A33A]" />
                        </div>
                    </div>
                </div>

                {/* Main Settings Card */}
                <div
                    className="rounded-[12px] border border-[#F3F4F6] bg-card p-6 shadow-[0px_9px_24px_0px_rgba(0,0,0,0.03)]">
                    <div className="space-y-8">
                        {/* Header */}
                        <div>
                            <h2 className="text-xl font-bold text-[#194185]">Account Setting</h2>
                            <p className="text-sm text-[#194185]">
                                Manage your personal information and security settings
                            </p>
                        </div>

                        {/* Header */}
                        {/*<div className="flex justify-between items-start mb-10">*/}
                        {/*    <div>*/}
                        {/*        <h1 className="text-2xl font-bold text-[#1e293b] mb-1">Account Setting</h1>*/}
                        {/*        <p className="text-sm text-slate-500 font-medium">Manage your personal information and security settings</p>*/}
                        {/*    </div>*/}
                        {/*    <Link to={`/${role}/dashboard`} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">*/}
                        {/*        <ChevronLeft className="w-4 h-4" /> Back to Dashboard*/}
                        {/*    </Link>*/}
                        {/*</div>*/}

                        {/* Profile Picture Section */}
                        <div
                            className="space-y-4 bg-[#F3F9FE] p-3 rounded-[8px] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4 mb-0">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={profileImage ? `${IMAGE_BASE_URL}${profileImage}` : "https://ui-avatars.com/api/?name=User&background=random"} alt="Profile"/>
                                    <AvatarFallback>RA</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="!text-base font-medium text-[#194185] !mb-0">Profile Picture</h3>
                                    <p className="!text-sm text-[#194185]">PNG, JPEG Under 12MB</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <button className="flex items-center gap-2 px-4 py-2.5 bg-[#e2eafc] text-[#3b82f6] rounded-xl font-bold text-sm hover:bg-[#d0dbf8] transition-all">
                                    <Upload className="w-4 h-4" /> Upload Image
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-500 rounded-xl font-bold text-sm hover:bg-red-100 transition-all">
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        </div>

                        {/* Personal Info Section */}
                        <div className="space-y-5">
                            <div className="space-y-[6px]">
                                <h3 className="text-base font-medium text-[#4B5563]">Personal Information</h3>
                                <p className="text-sm font-medium text-[#4B5563]">Upload your email and name
                                    details</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-baseline">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600">First Name</label>
                                    <input
                                        {...register("first_name")}
                                        className="w-full bg-[#f3f4f6] border-none rounded-lg p-3.5 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                                        placeholder="Enter first name"
                                    />
                                    {errors.first_name && <p className="text-xs text-red-500 font-bold">{errors.first_name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600">Last Name</label>
                                    <input
                                        {...register("last_name")}
                                        className="w-full bg-[#f3f4f6] border-none rounded-lg p-3.5 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                                        placeholder="Enter last name"
                                    />
                                    {errors.last_name && <p className="text-xs text-red-500 font-bold">{errors.last_name.message}</p>}
                                </div>
                                <div className="space-y-2 relative">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold text-slate-600 !mb-[2px]">Email</label>
                                        <button onClick={() => setShow(true)} type="button" className="text-xs font-bold text-blue-500 hover:underline">Change</button>
                                    </div>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            {...register("email")}
                                            readOnly
                                            className="w-full bg-[#f3f4f6] border-none rounded-lg p-3.5 pl-11 text-slate-500 font-medium cursor-not-allowed outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Section */}
                        <div className="space-y-5">
                            <div className="space-y-[6px]">
                                <h3 className="text-base font-medium text-[#4B5563]">Security & Password</h3>
                                <p className="text-sm text-[#4B5563]">Modify your current password</p>
                            </div>

                            {/* Password Security Tips */}
                            <div className="rounded-[8px] bg-[#FCF1F1] p-3 gap-2">
                                <h4 className="mb-3 text-sm font-medium text-[#18202A]">Password Security Tips</h4>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-1 text-sm">
                                        <Check className="h-4 w-4 shrink-0 text-[#34C759]" strokeWidth="1.5px"/>
                                        <span className="text-xs text-[#2A394B]">
                                          Use a combination of uppercase, lowercase, numbers, and special characters
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm">
                                        <X className="h-4 w-4 shrink-0 text-[#ED354A]"/>
                                        <span className="text-xs text-[#2A394B]">Avoid using personal information in your password</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm">
                                        <X className="h-4 w-4 shrink-0 text-[#ED354A]"/>
                                        <span className="text-xs text-[#2A394B]">Change your password regularly for enhanced security</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                <div className="space-y-2 relative">
                                    <label className="text-sm font-bold text-slate-600">Current Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            {...register("current_password")}
                                            type={showPassword.current ? "text" : "password"}
                                            className="w-full bg-[#f3f4f6] border-none rounded-lg p-3.5 pl-11 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(p => ({...p, current: !p.current}))}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.current_password && <p className="text-xs text-red-500 font-bold">{errors.current_password.message}</p>}
                                </div>
                                <div className="space-y-2 relative">
                                    <label className="text-sm font-bold text-slate-600">New Password</label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            {...register("password")}
                                            type={showPassword.new ? "text" : "password"}
                                            className="w-full bg-[#f3f4f6] border-none rounded-lg p-3.5 pl-11 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(p => ({...p, new: !p.new}))}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-xs text-red-500 font-bold">{errors.password.message}</p>}
                                </div>
                                <div className="space-y-2 relative">
                                    <label className="text-sm font-bold text-slate-600">Confirm New Password</label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            {...register("confirm_password")}
                                            type={showPassword.confirm ? "text" : "password"}
                                            className="w-full bg-[#f3f4f6] border-none rounded-lg p-3.5 pl-11 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(p => ({...p, confirm: !p.confirm}))}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.confirm_password && <p className="text-xs text-red-500 font-bold">{errors.confirm_password.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
                            {isDirty && (
                                <span className="mr-auto self-center text-xs font-bold text-amber-500 animate-pulse">
                                    ● You have unsaved changes
                                </span>
                            )}
                            {saveSuccess && (
                                <span className="mr-4 self-center text-sm font-bold text-emerald-500 flex items-center gap-1">
                                    <Check className="w-4 h-4" /> Changes saved!
                                </span>
                            )}
                            <button
                                type="button"
                                className="px-8 py-3 bg-[#f1f5f9] text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
                                onClick={() => window.location.reload()}
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isSubmitting}
                                onClick={handleSubmit(onSubmit)}
                                className={`px-8 py-3 bg-[#3b82f6] text-white font-bold rounded-xl hover:bg-blue-600 shadow-lg shadow-blue-200 transition-all flex items-center gap-2 ${isSubmitting ? 'opacity-70' : ''}`}
                            >
                                {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <Save className="w-4 h-4" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <UpdateEmailModelComponent show={show} setShow={setShow} setValue={setValue} />
        </div>
    );
};

export default Edit;