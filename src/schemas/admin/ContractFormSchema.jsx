import { z } from "zod";

export const contractFormSchema = (userRoles) => z.object({
    contract_name: z.string().nonempty("Contract Name is required"),
    role_id: z.union([z.string().nonempty("Role is required"), z.number()]),
    institute_categories: z.array(
        z.object({
            institute_category_id: z.union([z.string().nonempty("Institute Category is required"), z.number()]),
            //institute_specialty_ids: z.array(z.string().nonempty("At least one specialty is required")).nonempty("At least one specialty is required"),
            institute_specialty_ids: z.array(z.string()).optional(),
        })
    ).optional(),
    professional_category_id: z.union([z.string(), z.number()]).optional(),
    professional_role_ids: z.array(z.string()).optional(),
    status: z.enum(["1", "0"], { required_error: "Status is required" }),
}).superRefine((data, ctx) => {
    // get role name from userRoles
    const roleName = (data.role_id && userRoles && userRoles.length > 0) 
        ? userRoles.find(userRole => Number(userRole.id) === Number(data.role_id))?.name ?? "" 
        : "";

    if (roleName === "institute") {
        // require at least 1 institute row
        if (!data.institute_categories || data.institute_categories.length === 0) {
            ctx.addIssue({
                path: ["institute_categories"],
                message: "At least one Institute row is required",
                code: z.ZodIssueCode.custom,
            });
        } else {
            // validate each row
            data.institute_categories.forEach((row, i) => {
                if (!row.institute_category_id) {
                    ctx.addIssue({
                        path: ["institute_categories", i, "institute_category_id"],
                        message: "Institute Category is required",
                        code: z.ZodIssueCode.custom,
                    });
                }
                // if (!row.institute_specialty_ids || row.institute_specialty_ids.length === 0) {
                //     ctx.addIssue({
                //         path: ["institute_categories", i, "institute_specialty_ids"],
                //         message: "At least one Specialty is required",
                //         code: z.ZodIssueCode.custom,
                //     });
                // }
            });
        }
    }

    if (roleName === "professional") {
        if (!data.professional_category_id) {
            ctx.addIssue({
                path: ["professional_category_id"],
                message: "Professional Category is required",
                code: z.ZodIssueCode.custom,
            });
        }
        // if (!data.professional_role_ids || data.professional_role_ids.length === 0) {
        //     ctx.addIssue({
        //         path: ["professional_role_ids"],
        //         message: "At least one Professional Role is required",
        //         code: z.ZodIssueCode.custom,
        //     });
        // }
    }
});
