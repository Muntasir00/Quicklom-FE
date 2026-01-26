// PrivateClinicsFormSchema.jsx
import { z } from "zod";

export const privateClinicsFormSchema = z.object({
    medical_specialties_covered: z.array(z.string()).optional(),
    name_of_facility: z.string().min(1, "Name of the facility is required"),
    business_number: z.string().min(1, "Business number is required"),
    full_address: z.string().min(1, "Full address is required"),
    city: z.string().min(1, "City is required"),
    postal_code: z.string().min(1, "Postal code is required"),
    province: z.string().min(1, "Province is required"),
    phone_number: z.string().min(1, "Phone number is required"),
    primary_contact_full_name: z.string().min(1, "Primary contact full name is required"),
    primary_contact_position: z.string().min(1, "Primary contact position is required"),
    work_email: z.string().email("Invalid work email").min(1, "Work email is required"),
    direct_phone: z.string().min(1, "Direct phone is required"),
    other_specialties: z.string().min(1, "Other specialties is required"),
    type_of_contracts_you_will_publish: z.array(z.string()).min(1, "Type of contracts you will publish is required"), 
    enrolled_in_public_healthcare_system: z.string().min(1, "Enrolled in public healthcare system is required"),
    
    proof_of_license_or_registration: z.any().refine((file) => {
        if (!file) return true;
        if (typeof file === "string" && file.length > 0) return true;
        return file?.length > 0;
    }, "Proof of license or registration is required"),
    
    proof_of_liability_insurance: z.any().refine((file) => {
        if (!file) return true;
        if (typeof file === "string" && file.length > 0) return true;
        return file?.length > 0;
    }, "Proof of liability insurance is required"),
    
    signed_nda: z.any().refine((file) => {
        if (!file) return true;
        if (typeof file === "string" && file.length > 0) return true;
        return file?.length > 0;
    }, "Signed NDA is required"),
    
    website: z.string().optional(),
    billing_number: z.string().optional(),
    general_practitioners_number: z.string().optional(),
    nurses_number: z.string().optional(),
    other_professionals_number: z.string().optional(),
    specialists_number: z.string().optional(),
    software: z.array(z.string()).optional(),
});