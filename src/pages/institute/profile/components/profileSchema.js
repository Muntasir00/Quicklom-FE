import * as z from "zod";

export const profileSchema = z.object({
    // Tab 1: Category & Details
    agencyName: z.string().min(2, "Agency name is required"),
    businessName: z.string().min(2, "Business name is required"),
    headOfficeAddress: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    province: z.string().min(1, "Province is required"),
    postalCode: z.string().min(3, "Postal code is required"),
    agencyPhone: z.string().min(5, "Valid phone is required"),
    agencyEmail: z.string().email("Invalid email address"),
    website: z.string().url("Invalid URL").or(z.literal("")),

    // Tab 2: Contact Information
    contactFullName: z.string().min(2, "Full name is required"),
    contactPosition: z.string().min(2, "Position is required"),
    contactEmail: z.string().email("Invalid email"),
    contactPhone: z.string().min(5, "Valid phone is required"),

    // Tab 3: Service Details
    specialties: z.array(z.string()).min(1, "Select at least one specialty"),
    regionsServed: z.array(z.string()).min(1, "Select at least one region"),
    contractTypes: z.array(z.string()).min(1, "Select at least one contract type"),
    yearsExperience: z.coerce.number().min(0),
    numRecruiters: z.coerce.number().min(0),
    accreditation: z.string().optional(),
    recruitmentDescription: z.string().min(10, "Description is too short"),

    // Tab 4: Billing
    billingMethod: z.string().min(1, "Select a billing method"),
    otherBillingMethods: z.string().optional(),
});