import { z } from "zod";

export const permanentStaffingDentalFormSchema = z.object({
    // Location fields
    facility_name: z.string().nonempty("Facility name is required"),
    street_address: z.string().optional(),
    city: z.string().nonempty("City is required"),
    province: z.string().nonempty("Province is required"),
    postal_code: z.string().optional(),
    country: z.string().optional(),

    // Contract details
    start_date: z.string()
        .nonempty("Start Date is required")
        .refine((date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const startDate = new Date(date);
            return startDate >= today;
        }, "Start date cannot be in the past"),
    required_experience: z.string().nonempty("Required Experience Level is required"),
    working_shifts: z.array(z.string()).min(1, "At least one working shift is required"),
    job_description: z.string().nonempty("Job Description is required"),

    // Compensation - Fixed Salary only for permanent contracts
    annual_salary: z.string().nonempty("Annual Salary is required").refine(
        (val) => !isNaN(Number(val)),
        "Annual salary must be a number"
    ),

    // Benefits
    benefits: z.array(z.string()).min(1, "At least one benefit is required"),
    additional_bonus: z.enum(["yes","no"]).optional(),
    urgent_need: z.boolean().default(false),

    // Attachments
    attachments: z.any().optional(),

    // Position sought
    position_soughts: z.array(
        z.object({
            professional_category_id: z.union([z.string().nonempty("Professional Category is required"), z.number()]),
            position_ids: z.array(z.string().nonempty("At least one position is required")).nonempty("At least one position is required"),
            specialist_dentist_role: z.string().optional(),
        })
    ),
});