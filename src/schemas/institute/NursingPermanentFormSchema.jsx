import { z } from "zod";

export const NursingPermanentFormSchema = z.object({
    // LOCATION FIELDS
    facility_name: z.string().nonempty("Facility/Healthcare Center name is required"),
    street_address: z.string().optional(),
    city: z.string().nonempty("City is required"),
    province: z.string().nonempty("Province is required"),
    postal_code: z.string().optional(),
    country: z.string().default("Canada"),

    // CONTRACT DETAILS
    start_date: z.string()
        .nonempty("Start Date is required")
        .refine((date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const startDate = new Date(date);
            return startDate >= today;
        }, "Start date cannot be in the past"),
    end_date: z.string().optional(),
    weekly_schedule: z.string().nonempty("Weekly Schedule is required"),

    // REQUIREMENTS
    required_domain: z.array(z.string()).min(1, { message: "At least one domain is required" }),
    software_skills: z.array(z.string()).min(1, { message: "At least one software skill is required" }),
    minimum_experience: z.string().nonempty("Minimum Experience is required"),
    languages: z.union([z.string(), z.array(z.string())]),

    // COMPENSATION - Fixed Salary only for permanent contracts
    annual_salary: z.string().nonempty("Annual Salary is required").refine(
        (val) => !isNaN(Number(val)),
        "Annual salary must be a number"
    ),
    benefits: z.array(z.string()).min(1, { message: "At least one benefit is required" }),

    // JOB DESCRIPTION
    detailed_job_description: z.string().nonempty("Detailed Job Description is required"),
    travel_costs: z.enum(["yes", "no"]).optional(),

    // LICENSE AND COMPLIANCE
    required_license: z.boolean().default(false),
    compliance: z.object({
        vaccination: z.boolean().default(false),
        criminal_record: z.boolean().default(false),
        mandatory_training: z.boolean().default(false)
    }),

    // POSITION SOUGHTS
    position_soughts: z.array(
        z.object({
            professional_category_id: z.union([z.string().nonempty("Professional Category is required"), z.number()]),
            position_id: z.union([z.string().nonempty("Position is required"), z.number()]).refine((val) => val !== "", "Position is required"),
        })
    ),
}).superRefine((data, ctx) => {
    // Only validate end date if it's provided
    if (data.end_date) {
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);

        if (end < start) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["end_date"],
                message: "End Date must be after Start Date"
            });
        }
    }
});