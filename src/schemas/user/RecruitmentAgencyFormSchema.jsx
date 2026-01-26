import { z } from "zod";

export const recruitmentAgencyFormSchema = z.object({
    agency_name: z.string().min(1, "Agency Name is required"),
    business_number: z.string().min(1, "Business Number is required"),
    province: z.string().min(1, "Province is required"),
    city: z.string().min(1, "City is required"),
    postal_code: z.string().min(1, "Postal Code is required"),
    head_office_address: z.string().min(1, "Head Office Address is required"),
    phone_number: z.string().min(1, "Phone Number is required"),
    email_address: z.string().email("Invalid email").min(1, "Email Address is required"),
    website: z.string().optional(),
    primary_contact_full_name: z.string().min(1, "Primary Contact Name is required"),
    primary_contact_position: z.string().min(1, "Primary Contact Position is required"),
    primary_contact_email: z.string().email("Invalid email").min(1, "Primary Contact Email is required"),
    primary_contact_phone: z.string().min(1, "Primary Contact Phone is required"),
    specialties_covered: z.array(z.string()).min(1, "Select at least one specialty"),
    regions_served: z.array(z.string()).min(1, "Select at least one region"),
    years_of_experience: z.string().min(1, "Years of Experience is required"),
    number_of_recruiters: z.string().min(1, "Number of Recruiters is required"),
    types_of_contracts_managed: z.array(z.string()).min(1, "Select at least one contract type"),
    recruitment_process_description: z.string().min(1, "Recruitment Process Description is required"),
    licensing_accreditation: z.string().optional(),

    proof_of_business_registration: z.any().refine(
        (file) => {
            if (typeof file === "string" && file.length > 0) return true;
            return file instanceof FileList && file.length > 0;
        },
        "Business Registration file is required"
    ),

    proof_of_liability_insurance: z.any().refine(
        (file) => (typeof file === "string" && file.length > 0) || (file instanceof FileList && file.length > 0),
        "Liability Insurance file is required"
    ),

    confidentiality_agreement: z.any().refine(
        (file) => (typeof file === "string" && file.length > 0) || (file instanceof FileList && file.length > 0),
        "Confidentiality Agreement file is required"
    ),

    billing_method: z.array(z.string()).min(1, "Select at least one billing method"),
    other_billing_method: z.string().optional(),
}).refine(
    (data) => {
        if (data.billing_method.includes("other")) {
            return data.other_billing_method && data.other_billing_method.trim().length > 0;
        }
        return true;
    },
    {
        message: "Please describe other billing methods",
        path: ["other_billing_method"],
    }
);