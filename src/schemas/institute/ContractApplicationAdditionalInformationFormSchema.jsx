import { z } from "zod";

const candidateSchema = z.object({
    first_name: z.string().min(1, "First Name is required"),
    last_name: z.string().optional(),
    email: z.string().optional().refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), "Invalid email format"),
    phone: z.string().optional().refine((val) => !val || /^(\+1)?\s*\(?[2-9][0-9]{2}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/.test(val), "Invalid Canadian phone number format"),
    primary_role: z.string().min(1, "Primary Role is required"),
    dob: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), "Invalid date format"),
    gender: z.enum(["male", "female", "other", ""]).optional(),
    languages: z.array(z.enum(["english", "french"])).optional().default([]),
    province: z.string().min(1, "Province is required"),
    city: z.string().optional(),
    address: z.string().optional(),
    postal_code: z.string().optional().refine((val) => !val || /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(val), "Invalid Canadian postal code"),
    id_upload: z.any().optional().refine((file) => {
        if (!file) return true;
        if (typeof file === "string" && file.length > 0) return true;
        return file instanceof FileList && file.length > 0;
    }, "Invalid ID file"),
    license_number: z.string().optional(),
    experience: z.string().min(1, "Level of Experience is required"),
});

export const ContractApplicationAdditionalInformationFormSchema = z.object({
    candidates: z.array(candidateSchema).min(1, "At least one candidate is required"),
});