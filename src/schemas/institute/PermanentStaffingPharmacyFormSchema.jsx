import { z } from "zod";

export const PermanentStaffingPharmacyFormSchema = z.preprocess(
    (data) => {
        // Clean position_soughts to only keep the first item
        if (data && Array.isArray(data.position_soughts) && data.position_soughts.length > 1) {
            console.log("🔧 Schema preprocessing: Cleaning position_soughts from", data.position_soughts.length, "to 1 item");
            data.position_soughts = [data.position_soughts[0]];
        }
        return data;
    },
    z.object({
    // Location fields (matching PharmacyTemporary)
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
    job_description: z.string().nonempty("Job Description is required"),

    // Compensation - Fixed Salary only for permanent contracts
    annual_salary: z.string().nonempty("Annual Salary is required").refine(
        (val) => !isNaN(Number(val)),
        "Annual salary must be a number"
    ),
    benefits: z.array(z.string()).optional(),
    additional_bonus: z.enum(["yes","no"]).optional(),
    fees: z.string().optional(),
    urgent_need: z.boolean().default(false),

    // Attachments
    attachments: z.any().optional(),

    // Position sought
    position_soughts: z.array(
        z.object({
            professional_category_id: z.union([z.string().nonempty("Professional Category is required"), z.number()]),
            position_ids: z.array(z.string().nonempty("At least one position is required")).nonempty("At least one position is required"),
        })
    ),
    })
);