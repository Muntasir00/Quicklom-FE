import { z } from "zod";

export const ComprehensiveProfileFormSchema = z.object({
    // Step 1: Professional Category & Role
    professional_category_id: z.string().min(1, "Professional category is required"),
    professional_role_ids: z.array(z.number()).min(1, "At least one professional role must be selected"),
    specialist_dentist_role: z.string().optional(),
    is_specialist_dentist: z.boolean().optional(),

    // Step 2: Personal Information
    first_name: z.string().nonempty("First Name is required"),
    last_name: z.string().nonempty("Last Name is required"),
    email: z.string().email("Invalid email").nonempty("Email Address is required"),
    phone_number: z.string()
        .nonempty("Phone Number is required")
        .refine(
            (val) => /^(\(\d{3}\)\s?\d{3}-\d{4}|\d{3}-\d{3}-\d{4}|\d{10})$/.test(val),
            "Phone number must be in Canadian format: (XXX) XXX-XXXX"
        ),

    profile_photo: z.any().optional(),

    dob: z.string().nonempty("Date of Birth is required"),
    gender: z.enum(["male", "female", "other", "prefer_not_say"], {
        errorMap: () => ({ message: "Gender is required" }),
    }),

    languages: z.array(z.string()).min(1, { message: "Select at least one language" }),
    province: z.string().nonempty("Province is required"),
    city: z.string().nonempty("City of Residence is required"),
    address: z.string().nonempty("Address is required"),
    postal_code: z.string().nonempty("Postal Code is required"),

    id_upload: z.any().refine(
        (file) => {
            if (typeof file === "string" && file.length > 0) return true;
            return file instanceof FileList && file.length > 0;
        },
        "ID file is required"
    ),

    // Step 2: Professional Information
    professional_status: z.string().nonempty("Professional Status is required"),
    authorized_to_practice: z.enum(["yes", "inProgress", "no"], {
        errorMap: () => ({ message: "Authorization status is required" }),
    }),
    license_number: z.string().optional(),
    practicing_since: z.string().nonempty("Practicing Since is required"),
    province_reporting: z.string().nonempty("Province for Reporting is required"),

    // Step 2: Education
    education_level: z.string().nonempty("Education level is required"),
    graduation_year: z.string().min(1, { message: "Graduation year is required" }),
    software_proficiency: z.array(z.string()).min(1, { message: "Select at least one software proficiency" }),
    additional_skills: z.array(z.string()).min(1, { message: "Select at least one additional skill" }),
    educational_institution: z.string().nonempty("Educational institution is required"),

    // Step 2: Contract Preferences
    contract_type: z.union([
        z.string().min(1, { message: "Contract type is required" }),
        z.array(z.string().min(1, { message: "Contract type is required" })).min(1, { message: "Contract type is required" })
    ]).transform(val => typeof val === "string" ? [val] : val),

    // Step 3: License Information
    license_required: z.enum(["yes", "no", "optional"]).or(z.literal("")).optional(),
    license_number_detail: z.string().optional(),
    license_expiry: z.string().optional(),
    issuing_authority: z.string().optional(),
    license_document: z.any().optional(),
    notes: z.string().optional(),
    additional_info: z.string().optional(),
}).superRefine((data, ctx) => {
    // Validate specialist dentist role if Specialist Dentist is selected
    if (data.is_specialist_dentist === true) {
        if (!data.specialist_dentist_role || data.specialist_dentist_role.trim() === "") {
            ctx.addIssue({
                path: ["specialist_dentist_role"],
                message: "Dental Specialty is required for Specialist Dentist",
                code: z.ZodIssueCode.custom,
            });
        }
    }

    // If license_required = 'yes', make license fields required
    if (data.license_required === "yes" || data.license_required === "true") {
        if (!data.license_number_detail || data.license_number_detail.trim() === "") {
            ctx.addIssue({
                path: ["license_number_detail"],
                message: "License Number is required",
                code: z.ZodIssueCode.custom,
            });
        }

        if (!data.license_expiry || data.license_expiry.trim() === "") {
            ctx.addIssue({
                path: ["license_expiry"],
                message: "License Expiry Date is required",
                code: z.ZodIssueCode.custom,
            });
        }

        if (!data.issuing_authority || data.issuing_authority.trim() === "") {
            ctx.addIssue({
                path: ["issuing_authority"],
                message: "Issuing Authority is required",
                code: z.ZodIssueCode.custom,
            });
        }

        const file = data.license_document;
        const hasFile =
            (typeof file === "string" && file.length > 0) ||
            (file instanceof FileList && file.length > 0);
        if (!hasFile) {
            ctx.addIssue({
                path: ["license_document"],
                message: "License Document is required",
                code: z.ZodIssueCode.custom,
            });
        }

        if (!data.notes || data.notes.trim() === "") {
            ctx.addIssue({
                path: ["notes"],
                message: "Notes are required",
                code: z.ZodIssueCode.custom,
            });
        }

        if (!data.additional_info || data.additional_info.trim() === "") {
            ctx.addIssue({
                path: ["additional_info"],
                message: "Additional Info is required",
                code: z.ZodIssueCode.custom,
            });
        }
    }
});