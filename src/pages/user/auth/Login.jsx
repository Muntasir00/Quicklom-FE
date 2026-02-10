import {useState, useEffect} from "react";
import {useNavigate, Link} from "react-router-dom";
import {Card, CardContent} from "@components/ui/card.jsx";
import {loginService} from "@services/user/AuthService";
import {Input} from "@components/ui/input.jsx";
import {Field, FieldDescription, FieldLabel} from "@components/ui/field.jsx";
import {Button} from "@components/ui/button.jsx";
import LoginImage from "/public/assets/dist/img/login.png";
import {Loader2, Mail, Lock, Eye, EyeOff} from "lucide-react"; // আইকনগুলো ইমপোর্ট করা হয়েছে
import {z} from "zod";

const loginSchema = z.object({
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    password: z.string().min(1, "Password is required"),
});

function Login() {
    const navigate = useNavigate();
    const [login, setLogin] = useState({email: "", password: ""});
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false); // পাসওয়ার্ড দেখানোর জন্য স্টেট

    const handleInput = (event) => {
        setLogin({...login, [event.target.name]: event.target.value});
        if (errors[event.target.name]) {
            setErrors({...errors, [event.target.name]: null});
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const validation = loginSchema.safeParse(login);

        if (!validation.success) {
            const fieldErrors = validation.error.flatten().fieldErrors;
            setErrors(fieldErrors);
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const status = await loginService(event, login);
            if (status) {
                const userRole = sessionStorage.getItem("role")?.toLowerCase();
                navigate(`/${userRole}/dashboard`);
            }
        } catch (error) {
            console.error("Login failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        document.title = "Login | Quicklocum";
    }, []);

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center !p-4 md:!p-10">
            <div className="w-full max-w-sm md:max-w-4xl">
                <div className="flex flex-col gap-6">
                    <Card className="overflow-hidden p-0 shadow-lg border-none">
                        <CardContent className="grid p-0 md:grid-cols-2">
                            <div className="!p-4 md:!p-8 space-y-4">
                                <div className="space-y-2">
                                    <h1 className="!text-3xl font-bold text-[#1D4ED8] flex justify-center md:justify-start items-center gap-1 !mb-0">
                                        Quicklocum<span className="text-[#14B8A6]">.</span>
                                    </h1>
                                    <h2 className="!text-2xl sm:font-bold text-[#1E293B] text-center sm:!text-left !my-2">
                                        Welcome Back 👋
                                    </h2>
                                    <p className="text-gray-500 text-sm !mb-0">
                                        Login to manage your contracts, applicants, and payments seamlessly.
                                    </p>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Email Field with Icon */}
                                    <Field className="gap-1">
                                        <FieldLabel htmlFor="email">Email</FieldLabel>
                                        <div className="relative">
                                            <Mail
                                                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                disabled={isLoading}
                                                onChange={handleInput}
                                                placeholder="Email address"
                                                className={`!pl-10 h-11 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                            />
                                        </div>
                                        {errors.email && (
                                            <FieldDescription className="text-red-500 text-xs">
                                                {errors.email[0]}
                                            </FieldDescription>
                                        )}
                                    </Field>

                                    {/* Password Field with Icons and Toggle */}
                                    <Field className="gap-1">
                                        <FieldLabel htmlFor="password">Password</FieldLabel>
                                        <div className="relative">
                                            <Lock
                                                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"} // পাসওয়ার্ড টগল লজিক
                                                name="password"
                                                disabled={isLoading}
                                                onChange={handleInput}
                                                placeholder="Password"
                                                className={`!pl-10 pr-10 h-11 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4"/>
                                                ) : (
                                                    <Eye className="h-4 w-4"/>
                                                )}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <FieldDescription className="text-red-500 text-xs">
                                                {errors.password[0]}
                                            </FieldDescription>
                                        )}
                                    </Field>

                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-11 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-base !rounded-md mt-2 transition-all shadow-md"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                                Logging in...
                                            </>
                                        ) : (
                                            "Login"
                                        )}
                                    </Button>

                                    <div className="relative my-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-slate-200"/>
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span
                                                className="bg-white px-2 text-slate-400 font-medium">Or continue with</span>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={isLoading}
                                        className="w-full h-11 border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2 text-[#334155] font-semibold !rounded-md shadow-sm"
                                    >
                                        <img
                                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/0/google.svg"
                                            alt="Google"
                                            className="w-5 h-5"
                                        />
                                        Login with Google
                                    </Button>

                                    <p className="text-center text-sm text-gray-600 pt-2">
                                        Don&#39;t have account?{" "}
                                        <Link
                                            to={isLoading ? "#" : "register"}
                                            className={`text-[#1D4ED8] font-bold hover:underline ${isLoading ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
                                        >
                                            Sign up
                                        </Link>
                                    </p>
                                </form>
                            </div>
                            <div className="bg-muted relative hidden md:block">
                                <img
                                    src={LoginImage}
                                    alt="Login Illustration"
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

export default Login;