import { z } from "zod";

const CANADA_HOLIDAYS = [
    "2025-01-01", "2025-04-18", "2025-04-21", "2025-05-19", "2025-06-24",
    "2025-07-01", "2025-08-04", "2025-09-01", "2025-09-30", "2025-10-13",
    "2025-11-11", "2025-12-25", "2025-12-26", "2026-01-01", "2026-04-03",
    "2026-04-06", "2026-05-18", "2026-06-24", "2026-07-01", "2026-08-03",
    "2026-09-07", "2026-09-30", "2026-10-12", "2026-11-11", "2026-12-25",
    "2026-12-26",
];

export const NursingTemporaryFormSchema = z.object({
    // Address fields
    facility_name: z.string().nonempty("Facility Name is required"),
    street_address: z.string().nonempty("Street Address is required"),
    city: z.string().nonempty("City is required"),
    province: z.string().nonempty("Province is required"),
    postal_code: z.string().nonempty("Postal Code is required"),
    country: z.string().nonempty("Country is required"),

    // Date selection
    selected_dates: z.string()
        .nonempty("At least one working date must be selected")
        .refine((jsonStr) => {
            try {
                const dates = JSON.parse(jsonStr);
                return Array.isArray(dates) && dates.length > 0;
            } catch {
                return false;
            }
        }, "Selected dates must be a valid array")
        .refine((jsonStr) => {
            try {
                const dates = JSON.parse(jsonStr);
                return dates.every(date => !CANADA_HOLIDAYS.includes(date));
            } catch {
                return false;
            }
        }, "Selected dates cannot include public holidays"),

    // Start and end dates (auto-calculated from selected_dates)
    start_date: z.string()
        .nonempty("Start date is required")
        .refine((date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const startDate = new Date(date);
            return startDate >= today;
        }, "Start date cannot be in the past"),
    end_date: z.string().nonempty("End date is required"),

    // Time slots for specific dates
    time_slots: z.string()
        .optional()
        .refine((jsonStr) => {
            if (!jsonStr) return true;
            try {
                const slots = JSON.parse(jsonStr);
                if (!Array.isArray(slots)) return false;
                return slots.every(slot =>
                    slot.date &&
                    slot.start_time &&
                    slot.end_time &&
                    typeof slot.date === 'string' &&
                    typeof slot.start_time === 'string' &&
                    typeof slot.end_time === 'string'
                );
            } catch {
                return false;
            }
        }, "Time slots must be a valid array with date, start_time, and end_time"),

    shifts: z.array(z.string()).min(1, { message: "At least one shift is required" }),

    // Break fields
    break_included: z.enum(["yes", "no"], {
        errorMap: () => ({ message: "Break Included is required" }),
    }).optional(),

    break_duration: z.string().optional(),

    required_domain: z.array(z.string()).min(1, { message: "At least one domain is required" }),

    software_skills: z.array(z.string()).min(1, { message: "At least one software skill is required" }),

    minimum_experience: z.string().nonempty("Minimum Experience is required"),

    languages: z.array(z.string()).min(1, { message: "At least one language is required" }),

    compensation_mode: z.string().nonempty("Compensation Mode is required"),
    hourly_rate: z.string().optional(),
    daily_rate: z.string().optional(),
    contract_value: z.string().optional(),
    mission_description: z.string().optional(),

    travel_costs: z.enum(["yes", "no"]).optional(),

    required_license: z.boolean().default(false),

    compliance: z.object({
        vaccination: z.boolean().default(false),
        criminal_record: z.boolean().default(false),
        confidentiality: z.boolean().default(false)
    }),

    position_soughts: z.array(
        z.object({
            professional_category_id: z.union([z.string().nonempty("Professional Category is required"), z.number()]),
            position_id: z.union([z.string().nonempty("Position is required"), z.number()]).refine((val) => val !== "", "Position is required"),
        })
    ),
}).superRefine((data, ctx) => {
    // Validate break_duration is provided when break_included is "yes"
    if (data.break_included === "yes" && (!data.break_duration || data.break_duration.trim() === "")) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["break_duration"],
            message: "Break duration is required when break is included"
        });
    }

    // Validate rate based on compensation mode
    if (data.compensation_mode === "Per Hour") {
        if (!data.hourly_rate || data.hourly_rate.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["hourly_rate"],
                message: "Hourly Rate is required when Per Hour compensation mode is selected"
            });
        } else if (isNaN(Number(data.hourly_rate))) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["hourly_rate"],
                message: "Hourly rate must be a number"
            });
        }
    } else if (data.compensation_mode === "Per Day") {
        if (!data.daily_rate || data.daily_rate.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["daily_rate"],
                message: "Daily Rate is required when Per Day compensation mode is selected"
            });
        } else if (isNaN(Number(data.daily_rate))) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["daily_rate"],
                message: "Daily rate must be a number"
            });
        }
    } else if (data.compensation_mode === "Fixed Contract Value") {
        if (!data.contract_value || data.contract_value.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["contract_value"],
                message: "Contract Value is required when Fixed Contract Value compensation mode is selected"
            });
        } else if (isNaN(Number(data.contract_value))) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["contract_value"],
                message: "Contract value must be a number"
            });
        }
        // Validate mission_description is required for Fixed Contract Value
        if (!data.mission_description || data.mission_description.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["mission_description"],
                message: "Mission description is required for Fixed Contract Value"
            });
        }
    }
});