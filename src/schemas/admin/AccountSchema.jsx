import { z } from "zod";

export const editAccountSchema = z
    .object({
        email: z.string().email("Invalid email").nonempty("Email is required"),
        name: z.string().nonempty("Name is required"),
        password: z.string().optional(),
        confirm_password: z.string().optional(),
        current_password: z.string().optional(), 
    })
    .refine(
        (data) => data.password ? (data.password.length >= 6 ? true : false) : true,
        { message: "Password must be at least 6 characters", path: ["password"] }
    )
    .refine(
        (data) => data.password ? (data.password === data.confirm_password ? true : false) : true,
        { message: "Passwords do not match", path: ["confirm_password"] }
    )
    .refine(
        (data) => data.password ? !!data.current_password : true,
        { message: "Current password is required", path: ["current_password"] }
    );