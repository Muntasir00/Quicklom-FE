// HeadHunterFormSchema.jsx
import { z } from "zod";

export const HeadHunterFormSchema = z.object({
    profile_type: z.string().min(1, "Profile Type is required"),
    legal_form: z.string().min(1, "Legal Form is required"),
    owner_name: z.string().min(1, "Owner Name is required"),
    legal_address: z.string().min(1, "Legal Address is required"),
    city: z.string().min(1, "City is required"),
    province: z.string().min(1, "Province is required"),
    postal_code: z.string().min(1, "Postal Code is required"),
    phone: z.string().min(1, "Phone is required"),
    business_email: z.string().email("Invalid email").min(1, "Business Email is required"),
    regions_served: z.array(z.string()).min(1, "At least one region must be selected"),
    types_of_contracts_managed: z.array(z.string()).min(1, "At least one contract type must be selected"),
    specialties_covered: z.array(z.string()).min(1, "At least one specialty must be selected"),
    billing_method: z.array(z.string()).min(1, "Select at least one billing method"),
    
    legal_company_name: z.string().optional(),
    website: z.string().optional(),
    federal_number: z.string().optional(),
    hr_certification: z.string().optional(),
    notes: z.string().optional(),
    other_billing_method: z.string().optional(),
}).refine(
    (data) =>
      !(data.legal_form === "partnership" || data.legal_form === "corporation") ||
      (data.legal_company_name && data.legal_company_name.trim() !== ""),
    {
      message: "Legal Company Name is required for Partnership or Corporation",
      path: ["legal_company_name"],
    }
).refine(
    (data) =>
      !data.billing_method.includes("other") ||
      (data.other_billing_method && data.other_billing_method.trim() !== ""),
    {
      message: "Please provide details for 'Other' billing methods",
      path: ["other_billing_method"],
    }
);