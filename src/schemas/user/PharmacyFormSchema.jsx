import { z } from "zod";

export const pharmacyFormSchema = z.object({
    business_legal_name: z.string().min(1, "Business legal name is required"),
    name_of_pharmacy: z.string().min(1, "Name of pharmacy is required"),
    pharmacy_phone_number: z.string().min(1, "Pharmacy phone number is required"),
    types_of_contracts_managed: z.array(z.string()).min(1, "At least one contract type is required"),
    province: z.string().min(1, "Province is required"),
    city: z.string().min(1, "City is required"),
    address: z.string().min(1, "Address is required"),
    postal_code: z.string().min(1, "Postal code is required"),
    languages: z.array(z.string()).min(1, "At least one language is required"),
    software: z.array(z.string()).min(1, "At least one software is required"),
    additional_services: z.string().min(1, "Additional services are required"),
    weekday_staff_prescription_day: z.number().min(0, "Weekday traffic must be a number"),
    weekend_staffs_prescriptions_day: z.number().min(0, "Weekend traffic must be a number"),
    current_number_of_pharmacists: z.number().min(0, "Current number of pharmacists must be a number"),
    current_number_of_assistants: z.number().min(0, "Current number of assistants must be a number"),
    additional_info_before_contract: z.string().min(1, "Additional info before contract is required"),

    maximum_travel_fee: z.preprocess(val => val === "" ? undefined : val, z.any().optional()),
    duration_for_day: z.preprocess(val => val === "" ? undefined : val, z.any().optional()),
    accommodation_fee_per_night: z.preprocess(val => val === "" ? undefined : val, z.any().optional()),

    logo: z.any().optional().refine((file) => {
        if (!file) return true;
        if (typeof file === "string" && file.length > 0) return true;
        return file?.length > 0;
    }, "Logo is required"),

    fee: z.preprocess((val) => {
        return val === "on" || val === true ? true : false;
    }, z.boolean()).optional(),
});