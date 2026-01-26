import { z } from "zod";

export const dentalFormSchema = z
    .object({
        type_of_clinic: z.string().nonempty("Type of clinic is required"),
        institution_phone_number: z.string().nonempty("Institution's phone number is required").regex(/^\+?\d{10,15}$/, "Invalid phone number format"),
        type_of_contract: z.array(z.string()).nonempty("Select at least one type of contract"),
        logo: z.any().refine((file) => file?.length > 0, "Logo is required"),
        province: z.string().nonempty("Province is required"),
        city: z.string().nonempty("City is required"),
        address: z.string().nonempty("Address is required"),
        postal_code: z.string().nonempty("Postal code is required"),
        languages: z.array(z.string()).nonempty("Select at least one language"),
        software: z.array(z.string()).nonempty("Select at least one software"),
        services: z.array(z.string()).nonempty("Select at least one service"),
        weekday_traffic_patients_per_day: z.number({ invalid_type_error: "Weekday traffic is required" }).min(0, "Weekday traffic cannot be negative"),
        weekend_traffic_prescriptions_per_day: z.number({ invalid_type_error: "Weekend traffic is required" }).min(0, "Weekend traffic cannot be negative"),
        //fees: z.number({ invalid_type_error: "Fees are required" }).min(0, "Fees cannot be negative"),
        //maximum_travel_fee: z.number({ invalid_type_error: "Maximum travel fee is required" }).min(0, "Maximum travel fee cannot be negative"),
        //per_diem_fee_per_day: z.number({ invalid_type_error: "Per diem fee is required" }).min(0, "Per diem fee cannot be negative"),
        //accommodation_fee_per_night: z.number({ invalid_type_error: "Accommodation fee is required" }).min(0, "Accommodation fee cannot be negative"),
        odontogram_system: z.array(z.string()).nonempty("Select at least one odontogram system"),
        type_of_ultrasound: z.array(z.string()).nonempty("Select at least one type of ultrasound"),
        type_of_radiography: z.array(z.string()).nonempty("Select at least one type of radiography"),
        parking: z.array(z.string()).nonempty("Select at least one parking option"),
        number_of_current_dentists: z.number({ invalid_type_error: "Number of dentists is required" }).min(0, "Number of dentists cannot be negative"),
        number_of_current_dental_hygienists: z.number({ invalid_type_error: "Number of dental hygienists is required" }).min(0, "Number of dental hygienists cannot be negative"),
        additional_info_before_contract: z.string().nonempty("Additional information is required"),
    });
