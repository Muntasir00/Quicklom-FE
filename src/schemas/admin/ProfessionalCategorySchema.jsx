import { z } from "zod";

export const professionalCategorySchema = z.object({
    name: z.string().nonempty("Name is required"),
    status: z.enum(["1", "0"], { required_error: "Status is required" }),
})