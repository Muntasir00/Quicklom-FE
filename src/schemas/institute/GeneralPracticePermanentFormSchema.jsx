import { z } from "zod";

export const GeneralPracticePermanentFormSchema = z
  .object({
    // Address fields from Geoapify API (same structure as General Dentistry)
    contract_location: z.string().optional(), // Hidden field with full formatted address
    facility_name: z.string().nonempty("Facility name is required"),
    street_address: z.string().optional(),
    city: z.string().nonempty("City is required"),
    province: z.string().nonempty("Province is required"),
    postal_code: z.string().optional(),
    country: z.string().default("Canada"),

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

    required_skills: z
      .array(z.string())
      .min(1, { message: "At least one skill is required" }),

    software_skills: z
      .array(z.string())
      .min(1, { message: "At least one software skill is required" }),

    minimum_experience: z.string().nonempty("Minimum Experience is required"),

    languages: z
      .array(z.string())
      .min(1, { message: "At least one language is required" }),

    // Compensation - Fixed Salary only for permanent contracts
    annual_salary: z.string().nonempty("Annual Salary is required").refine(
        (val) => !isNaN(Number(val)),
        "Annual salary must be a number"
    ),

    benefits: z
      .array(z.string())
      .min(1, { message: "At least one benefit is required" }),

    travel_costs: z.enum(["yes", "no"]).optional(),

    required_license: z.boolean().default(false),

    compliance: z.object({
      vaccination: z.boolean().default(false),
      criminal_record: z.boolean().default(false),
      confidentiality: z.boolean().default(false),
    }),

    position_soughts: z.array(
      z.object({
        professional_category_id: z.union([
          z.string().nonempty("Professional Category is required"),
          z.number(),
        ]),
        position_ids: z
          .array(z.string().nonempty("At least one position name is required"))
          .nonempty("At least one position name is required"),
      })
    ),
  });