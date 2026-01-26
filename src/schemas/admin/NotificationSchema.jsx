import { z } from "zod";

export const notificationSchema = z.object({
    title: z
        .string({ required_error: "Title is required" })
        .min(3, "Title must be at least 3 characters long")
        .max(255, "Title cannot exceed 255 characters"),

    message: z
        .string({ required_error: "Message is required" })
        .min(5, "Message must be at least 5 characters long")
        .max(2000, "Message cannot exceed 2000 characters"),
    
    user_ids: z.array(z.string().nonempty("At least one user is required")).nonempty("At least one user is required"),


    // user_ids: z
    //     .union([
    //         z.array(z.number(), { invalid_type_error: "Invalid user IDs" }),
    //         z.string().transform((val) =>
    //             val ? val.split(",").map((v) => Number(v.trim())) : []
    //         ),
    //     ])
    //     .optional(),
});
