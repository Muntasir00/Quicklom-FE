import { z } from "zod";

export const professionalRoleSchema = z.object({
    professional_category_id: z.union([z.string().nonempty("Professional category is required"),z.number()]),
    name: z.string().nonempty("Name is required"),
    status: z.enum(["1", "0"], { required_error: "Status is required" }),
});


