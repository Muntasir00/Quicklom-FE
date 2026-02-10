import {useState, useEffect} from "react";
import {useNavigate, Link} from "react-router-dom";
import {Card, CardContent} from "@components/ui/card.jsx";
import {Input} from "@components/ui/input.jsx";
import {Field, FieldLabel} from "@components/ui/field.jsx";
import {Button} from "@components/ui/button.jsx";
import LoginImage from "/public/assets/dist/img/login.png";
import {Loader2, Mail, Lock, Eye, EyeOff, User} from "lucide-react";
import {z} from "zod";

// Registration Schema
const registerSchema = z.object({
    fullName: z.string().min(1, "Full Name is required"),
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm Password is required"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({fullName: "", email: "", password: "", confirmPassword: ""});
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ডের জন্য আলাদা আলাদা টগল স্টেট
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleInput = (event) => {
        setFormData({...formData, [event.target.name]: event.target.value});
        if (errors[event.target.name]) {
            setErrors({...errors, [event.target.name]: null});
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const validation = registerSchema.safeParse(formData);

        if (!validation.success) {
            const fieldErrors = validation.error.flatten().fieldErrors;
            setErrors(fieldErrors);
            return;
        }

        setIsLoading(true);
        try {
            // আপনার রেজিস্ট্রেশন সার্ভিস এখানে কল হবে
            console.log("Registering...", formData);
            navigate("/login");
        } catch (error) {
            console.error("Registration failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        document.title = "Register | Quicklocum";
    }, []);

    return (
        <div className="bg-[#F8FAFC] flex min-h-svh flex-col items-center justify-center !p-4 md:!p-10">
            <div className="w-full max-w-sm md:max-w-4xl">
                <div className="flex flex-col gap-6">
                    <Card className="overflow-hidden p-0 shadow-2xl border-none rounded-2xl">
                        <CardContent className="grid p-0 md:grid-cols-2">
                            {/* Left Side: Form */}
                            <div className="!p-4 md:!p-10 space-y-6 bg-white">
                                <div className="space-y-2">
                                    <h1 className="!text-2xl font-bold text-[#1D4ED8] flex items-center gap-0.5">
                                        Quicklocum<span className="text-[#14B8A6]">.</span>
                                    </h1>
                                    <h2 className="!text-3xl font-extrabold text-[#1E293B] pt-4">
                                        Create Your Account
                                    </h2>
                                    <p className="text-slate-500 text-sm font-medium">
                                        Join Quicklocum and start managing your workforce smarter.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Full Name */}
                                    <Field className="gap-1.5">
                                        <FieldLabel className="text-slate-700 font-semibold" htmlFor="fullName">Full
                                            Name</FieldLabel>
                                        <div className="relative">
                                            <User
                                                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                                            <Input
                                                id="fullName"
                                                type="text"
                                                name="fullName"
                                                disabled={isLoading}
                                                onChange={handleInput}
                                                placeholder="Enter your full name"
                                                className={`pl-10 h-11 bg-[#F1F7FE] border-none focus-visible:ring-blue-400 ${errors.fullName ? "ring-2 ring-red-500" : ""}`}
                                            />
                                        </div>
                                        {errors.fullName &&
                                            <p className="text-red-500 text-[10px] mt-1">{errors.fullName[0]}</p>}
                                    </Field>

                                    {/* Email */}
                                    <Field className="gap-1.5">
                                        <FieldLabel className="text-slate-700 font-semibold" htmlFor="email">Email
                                            Address</FieldLabel>
                                        <div className="relative">
                                            <Mail
                                                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                disabled={isLoading}
                                                onChange={handleInput}
                                                placeholder="Enter your email"
                                                className={`pl-10 h-11 bg-[#F1F7FE] border-none focus-visible:ring-blue-400 ${errors.email ? "ring-2 ring-red-500" : ""}`}
                                            />
                                        </div>
                                        {errors.email &&
                                            <p className="text-red-500 text-[10px] mt-1">{errors.email[0]}</p>}
                                    </Field>

                                    {/* Password */}
                                    <Field className="gap-1.5">
                                        <FieldLabel className="text-slate-700 font-semibold"
                                                    htmlFor="password">Password</FieldLabel>
                                        <div className="relative">
                                            <Lock
                                                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                disabled={isLoading}
                                                onChange={handleInput}
                                                placeholder="Enter your password"
                                                className={`pl-10 pr-10 h-11 bg-[#F1F7FE] border-none focus-visible:ring-blue-400 ${errors.password ? "ring-2 ring-red-500" : ""}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4"/> :
                                                    <Eye className="h-4 w-4"/>}
                                            </button>
                                        </div>
                                        {errors.password &&
                                            <p className="text-red-500 text-[10px] mt-1">{errors.password[0]}</p>}
                                    </Field>

                                    {/* Confirm Password */}
                                    <Field className="gap-1.5">
                                        <FieldLabel className="text-slate-700 font-semibold" htmlFor="confirmPassword">Confirm
                                            Password</FieldLabel>
                                        <div className="relative">
                                            <Lock
                                                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                                            <Input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                disabled={isLoading}
                                                onChange={handleInput}
                                                placeholder="Re-enter your password"
                                                className={`pl-10 pr-10 h-11 bg-[#F1F7FE] border-none focus-visible:ring-blue-400 ${errors.confirmPassword ? "ring-2 ring-red-500" : ""}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4"/> :
                                                    <Eye className="h-4 w-4"/>}
                                            </button>
                                        </div>
                                        {errors.confirmPassword &&
                                            <p className="text-red-500 text-[10px] mt-1">{errors.confirmPassword[0]}</p>}
                                    </Field>

                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-11 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm rounded-lg mt-2 transition-all shadow-md"
                                    >
                                        {isLoading ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Processing...</>
                                        ) : (
                                            "Create Account"
                                        )}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full h-11 bg-[#F1F7FE] border-none hover:bg-blue-50 flex items-center justify-center gap-2 text-slate-700 font-bold rounded-lg shadow-sm"
                                    >
                                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/0/google.svg"
                                             alt="G" className="w-4 h-4"/>
                                        Login with Google
                                    </Button>

                                    <p className="text-center text-sm text-slate-600 pt-2">
                                        Already have an account?{" "}
                                        <Link to="/login" className="text-[#1D4ED8] font-bold hover:underline">
                                            Login
                                        </Link>
                                    </p>
                                </form>
                            </div>

                            {/* Right Side: Image */}
                            <div className="bg-muted relative hidden md:block">
                                <img
                                    src={LoginImage}
                                    alt="Register Illustration"
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default Register;