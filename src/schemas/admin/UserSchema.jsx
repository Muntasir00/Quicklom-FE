import { z } from "zod";

export const userSchema = z.object({
    name: z.string().nonempty("Name field is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string().nonempty("Confirm Password is required"),
    role_id: z.string().nonempty("Role field is required"),
    status: z.enum(["1", "0"], { required_error: "Status is required" }),
}).refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"], 
});
