import { z } from "zod";

const CANADA_HOLIDAYS = [
    "2025-01-01", // New Year – Wednesday, January 1, 2025
    "2025-04-18", // Good Friday – Friday, April 18, 2025
    "2025-04-21", // Easter Monday – Monday, April 21, 2025
    "2025-05-19", // Victoria Day – Monday, May 19, 2025
    "2025-06-24", // Saint-Jean-Baptiste Day – Tuesday, June 24, 2025 (Quebec only)
    "2025-07-01", // Canada Day – Tuesday, July 1, 2025
    "2025-08-04", // Civic Holiday – Monday, August 4, 2025 (excluding Quebec)
    "2025-09-01", // Labour Day – Monday, September 1, 2025
    "2025-09-30", // National Day for Truth and Reconciliation – Tuesday, September 30, 2025
    "2025-10-13", // Thanksgiving Day – Monday, October 13, 2025
    "2025-11-11", // Remembrance Day – Tuesday, November 11, 2025
    "2025-12-25", // Christmas Day – Thursday, December 25, 2025
    "2025-12-26", // Boxing Day – Friday, December 26, 2025
    "2026-01-01", // New Year's Day – Thursday, January 1, 2026
    "2026-04-03", // Good Friday – Friday, April 3, 2026
    "2026-04-06", // Easter Monday – Monday, April 6, 2026
    "2026-05-18", // Victoria Day – Monday, May 18, 2026
    "2026-06-24", // Saint-Jean-Baptiste Day – Wednesday, June 24, 2026 (Quebec only)
    "2026-07-01", // Canada Day – Wednesday, July 1, 2026
    "2026-08-03", // Civic Holiday – Monday, August 3, 2026 (excluding Quebec)
    "2026-09-07", // Labour Day – Monday, September 7, 2026
    "2026-09-30", // National Day for Truth and Reconciliation – Wednesday, September 30, 2026
    "2026-10-12", // Thanksgiving Day – Monday, October 12, 2026
    "2026-11-11", // Remembrance Day – Wednesday, November 11, 2026
    "2026-12-25", // Christmas Day – Friday, December 25, 2026
    "2026-12-26", // Boxing Day – Saturday, December 26, 2026
];

export const GeneralDentistryTemporaryFormSchema = z.object({
    // NEW LOCATION FIELDS
    facility_name: z.string().nonempty("Facility/Clinic name is required"),
    street_address: z.string().optional(),
    city: z.string().nonempty("City is required"),
    province: z.string().nonempty("Province is required"),
    postal_code: z.string().optional(),
    country: z.string().default("Canada"),

    // EXISTING FIELDS
    contract_location: z.string().nonempty("Contract Location is required"),

    // NEW: selected_dates field (JSON string of date array)
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
                // Check that no selected date is a holiday
                return dates.every(date => !CANADA_HOLIDAYS.includes(date));
            } catch {
                return false;
            }
        }, "Selected dates cannot include public holidays"),

    // MODIFIED: start_date and end_date are still validated but now auto-populated from selected_dates
    start_date: z.string()
        .nonempty("Start Date is required")
        .refine((date) => !CANADA_HOLIDAYS.includes(date), "Start date cannot be a public holiday")
        .refine((date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const startDate = new Date(date);
            return startDate >= today;
        }, "Start date cannot be in the past"),

    end_date: z.string()
        .nonempty("End Date is required")
        .refine((date) => !CANADA_HOLIDAYS.includes(date), "End date cannot be a public holiday"),

    break_included: z.enum(["yes", "no"], {
        errorMap: () => ({ message: "Break Included is required" }),
    }),

    required_experience: z.string().nonempty("Experience Level is required"),
    compensation_mode: z.enum(["Per Day", "Per Hour", "Fixed Contract Value"], {
        errorMap: () => ({ message: "Compensation Mode is required" }),
    }),

    break_duration: z.string().optional(),
    additional_info: z.string().optional(),

    daily_rate: z.string().optional().refine((val) => !val || !isNaN(Number(val)), "Daily Rate must be a number"),
    hourly_rate: z.string().optional().refine((val) => !val || !isNaN(Number(val)), "Hourly Rate must be a number"),
    contract_value: z.string().optional().refine((val) => !val || !isNaN(Number(val)), "Contract Value must be a number"),
    mission_description: z.string().optional(),

    bonus_incentives: z.enum(["yes", "no"], {
        errorMap: () => ({ message: "Bonus/Incentives selection is required" }),
    }),

    fees: z.string().optional(),
    parking: z.string().optional(),
    languages: z.union([z.string(), z.array(z.string())]),
    software: z.union([
        z.string().min(1, "At least one software is required"),
        z.array(z.string().min(1, "Software cannot be empty")).min(1, "At least one software is required"),
    ]),
    detailed_job_description: z.string().nonempty("Detailed Job Description is required"),
    position_soughts: z.array(
        z.object({
            professional_category_id: z.union([z.string().nonempty("Professional Category is required"), z.number()]),
            position_ids: z.array(z.string().nonempty("At least one position name is required")).nonempty("At least one position name is required"),
            specialist_dentist_role: z.string().optional(), // NEW: for specialist dentist
        })
    ),
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

    // Attachments field - optional, can be File object, string (existing file path), or undefined
    attachments: z.any().optional(),
}).superRefine((data, ctx) => {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);

    // Validate that end date is after start date
    if (end < start) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["end_date"],
            message: "End Date must be after Start Date"
        });
    }

    // Conditional validation for compensation rates
    if (data.compensation_mode === "Per Day") {
        if (!data.daily_rate || data.daily_rate.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["daily_rate"],
                message: "Daily Rate is required when Per Day compensation mode is selected"
            });
        }
    }

    if (data.compensation_mode === "Per Hour") {
        if (!data.hourly_rate || data.hourly_rate.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["hourly_rate"],
                message: "Hourly Rate is required when Per Hour compensation mode is selected"
            });
        }
    }

    if (data.compensation_mode === "Fixed Contract Value") {
        if (!data.contract_value || data.contract_value.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["contract_value"],
                message: "Contract Value is required when Fixed Contract Value compensation mode is selected"
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

    // Additional validation: Check that selected_dates matches start_date and end_date
    try {
        const selectedDates = JSON.parse(data.selected_dates);
        const sortedDates = selectedDates.sort();

        if (sortedDates[0] !== data.start_date) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["start_date"],
                message: "Start date must match the first selected date"
            });
        }

        if (sortedDates[sortedDates.length - 1] !== data.end_date) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["end_date"],
                message: "End date must match the last selected date"
            });
        }
    } catch (error) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["selected_dates"],
            message: "Invalid selected dates format"
        });
    }
});