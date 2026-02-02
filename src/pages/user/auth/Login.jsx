import {useState, useEffect} from "react";
import {useNavigate, Link} from "react-router-dom";
import {Card, CardContent} from "@components/ui/card.jsx"
import {loginService} from "@services/user/AuthService"
import {Input} from "@components/ui/input.jsx";
import {Field, FieldDescription, FieldLabel} from "@components/ui/field.jsx";
import {Button} from "@components/ui/button.jsx";
import LoginImage from "/public/assets/dist/img/login.png"
import {Loader2} from "lucide-react";
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
            // যদি ভুল থাকে, এরর মেসেজগুলো গুছিয়ে নেওয়া
            const fieldErrors = validation.error.flatten().fieldErrors;
            setErrors(fieldErrors);
            return; // ভ্যালিডেশন ফেইল করলে সাবমিট হবে না
        }

        setIsLoading(true);
        setErrors({});

        setIsLoading(true); // লোডার শুরু

        try {
            const status = await loginService(event, login);
            if (status) {
                const userRole = sessionStorage.getItem("role")?.toLowerCase();
                navigate(`/${userRole}/dashboard`);
            }
        } catch (error) {
            console.error("Login failed", error);
        } finally {
            setIsLoading(false); // কাজ শেষ হলে লোডার বন্ধ
        }
        // const status = await loginService(event, login);
        // if (!status) return;
        // const userRole = sessionStorage.getItem("role")?.toLowerCase();
        // navigate(`/${userRole}/dashboard`);
    };

    useEffect(() => {
        document.title = "Login | Quicklocum"
    }, []);

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-4xl">
                <div className="flex flex-col gap-6">
                    <Card className="overflow-hidden p-0">
                        <CardContent className="grid p-0 md:grid-cols-2">
                            <div className="p-6 md:p-8 space-y-4">
                                <div className="space-y-2">
                                    <h1 className="text-2xl font-bold text-[#1D4ED8] flex justify-center md:justify-start items-center gap-1">
                                        Quicklocum<span className="text-[#14B8A6]">.</span>
                                    </h1>
                                    <h2 className="text-3xl font-bold text-[#1E293B] mt-4">
                                        Welcome Back 👋
                                    </h2>
                                    <p className="text-gray-500 text-sm">
                                        Login to manage your contracts, applicants, and payments seamlessly.
                                    </p>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-4">

                                    <Field className="gap-1">
                                        <FieldLabel htmlFor="email">Email</FieldLabel>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            disabled={isLoading}
                                            onChange={handleInput}
                                            placeholder="Email"
                                            className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                                        />
                                        {errors.email && (
                                            <FieldDescription
                                                className="text-red-500 text-xs">{errors.email[0]}</FieldDescription>
                                        )}
                                    </Field>

                                    <Field className="gap-1">
                                        <FieldLabel htmlFor="password">Password</FieldLabel>
                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            disabled={isLoading}
                                            onChange={handleInput}
                                            placeholder="Password"
                                            className={errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
                                        />
                                        {errors.email && (
                                            <FieldDescription
                                                className="text-red-500 text-xs">{errors.password[0]}</FieldDescription>
                                        )}
                                    </Field>

                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-6 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-base !rounded-md"
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

                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={isLoading}
                                        className="w-full py-6 my-4 bg-[#F1F5F9] border-none hover:bg-gray-200 flex items-center justify-center gap-2 text-[#334155] font-semibold !rounded-md"
                                    >
                                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/0/google.svg"
                                             alt="Google"
                                             className="w-5 h-5"/>
                                        Login with Google
                                    </Button>

                                    {/* Sign Up Link */}
                                    <p className="text-center text-sm text-gray-600">
                                        Don&#39;t have account?{" "}
                                        <Link
                                            to={isLoading ? "#" : "/signup"}
                                            title="Sign up"
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
                                    alt="Image"
                                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
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
