import { z } from "zod";

export const Copy____ProfileFormSchema = (categories) =>
    z.object({
        professional_category_id: z.string().min(1, "Professional category is required"),
        professional_role_ids: z.array(z.number()).optional(),
    }).superRefine((data, ctx) => {
        const category = categories.find(c => String(c.id) === data.professional_category_id);
        if (category && (!data.professional_role_ids || data.professional_role_ids.length === 0)) {
            ctx.addIssue({
                code: "custom",
                path: ["professional_role_ids"],
                message: "At least one professional role must be selected",
            });
        }
    });


export const ProfileFormSchema = (categories) =>
    z.object({
        professional_category_id: z.string().min(1, "Professional category is required"),
        professional_role_ids: z.array(z.number()).optional(),
        specialist_dentist_role: z.string().optional(),
    }).superRefine((data, ctx) => {
        const category = categories.find(c => String(c.id) === data.professional_category_id);
        const roles = data.professional_role_ids || [];


    });
