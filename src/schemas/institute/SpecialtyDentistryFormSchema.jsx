import { z } from "zod";

export const SpecialtyDentistryFormSchema = z.object({
    // Location fields
    facility_name: z.string().nonempty("Facility name is required"),
    street_address: z.string().optional(),
    city: z.string().nonempty("City is required"),
    province: z.string().nonempty("Province is required"),
    postal_code: z.string().optional(),
    country: z.string().optional(),

    // Date fields - calendar selection
    selected_dates: z.string().optional(), // JSON string of selected dates array
    start_date: z.string()
        .nonempty("At least one date must be selected")
        .refine((date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const startDate = new Date(date);
            return startDate >= today;
        }, "Start date cannot be in the past"),
    end_date: z.string().nonempty("End date is required"),

    // Specialty details
    position_title: z.string().nonempty("Position Title is required"),
    required_specialty: z.string().nonempty("Required Specialty is required"),
    mission_objective: z.string().nonempty("Mission Objective / Required Procedure is required"),

    // Duration and compensation - supports both global and per-date
    duration_mode: z.enum(["global", "per_date"]).default("global"),

    // Global duration (when duration_mode is "global")
    estimated_duration: z.object({
        start_hour: z.string().optional(),
        end_hour: z.string().optional()
    }).optional(),

    // Per-date durations (when duration_mode is "per_date")
    date_durations: z.string().optional(), // JSON string of {date: {start_hour, end_hour}}

    compensation_mode: z.enum(["Per Hour","Fixed Contract Value"], {
        errorMap: () => ({ message: "Compensation Mode is required" })
    }),
    hourly_rate: z.string().optional(), // Will be validated in superRefine for Per Hour
    contract_value: z.string().optional(), // Will be validated in superRefine for Fixed Contract Value
    mission_description: z.string().optional(), // Required for Fixed Contract Value

    // Additional requirements
    equipment_room: z.enum(["yes","no"]).optional(),
    required_documents: z.enum(["yes","no"]).optional(),

    // Position sought
    position_soughts: z.array(
        z.object({
            professional_category_id: z.union([z.string().nonempty("Professional Category is required"), z.number()]),
            position_ids: z.array(z.string().nonempty("At least one position is required")).nonempty("At least one position is required"),
            specialist_dentist_role: z.string().optional(), // For specialist dentist selection
        })
    ),
}).superRefine((data, ctx) => {
    // Validate duration based on mode
    if (data.duration_mode === "global") {
        // Validate global duration
        if (!data.estimated_duration?.start_hour || data.estimated_duration.start_hour.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["estimated_duration", "start_hour"],
                message: "Start Hour is required"
            });
        }

        if (!data.estimated_duration?.end_hour || data.estimated_duration.end_hour.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["estimated_duration", "end_hour"],
                message: "End Hour is required"
            });
        }

        // Validate end hour is after start hour
        if (data.estimated_duration?.start_hour && data.estimated_duration?.end_hour) {
            if (data.estimated_duration.end_hour <= data.estimated_duration.start_hour) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["estimated_duration", "end_hour"],
                    message: "End Hour must be after Start Hour"
                });
            }
        }
    } else if (data.duration_mode === "per_date") {
        // Validate per-date durations
        if (!data.date_durations || data.date_durations.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["date_durations"],
                message: "Duration for each date is required"
            });
        } else {
            try {
                const dateDurations = JSON.parse(data.date_durations);
                const selectedDates = data.selected_dates ? JSON.parse(data.selected_dates) : [];

                // Check if all selected dates have durations
                for (const date of selectedDates) {
                    if (!dateDurations[date] || !dateDurations[date].start_hour || !dateDurations[date].end_hour) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            path: ["date_durations"],
                            message: `Duration is missing for ${date}`
                        });
                        break;
                    }

                    // Validate end hour is after start hour for each date
                    if (dateDurations[date].end_hour <= dateDurations[date].start_hour) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            path: ["date_durations"],
                            message: `End hour must be after start hour for ${date}`
                        });
                        break;
                    }
                }
            } catch (error) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["date_durations"],
                    message: "Invalid duration data"
                });
            }
        }
    }

    // Validate hourly_rate is required when compensation_mode is "Per Hour"
    if (data.compensation_mode === "Per Hour") {
        if (!data.hourly_rate || data.hourly_rate.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["hourly_rate"],
                message: "Hourly rate is required"
            });
        } else {
            const amount = parseFloat(data.hourly_rate);
            if (isNaN(amount) || amount <= 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["hourly_rate"],
                    message: "Hourly rate must be a positive number"
                });
            }
        }
    }

    // Validate contract_value is required when compensation_mode is "Fixed Contract Value"
    if (data.compensation_mode === "Fixed Contract Value") {
        if (!data.contract_value || data.contract_value.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["contract_value"],
                message: "Contract value is required"
            });
        } else {
            const amount = parseFloat(data.contract_value);
            if (isNaN(amount) || amount <= 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["contract_value"],
                    message: "Contract value must be a positive number"
                });
            }
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