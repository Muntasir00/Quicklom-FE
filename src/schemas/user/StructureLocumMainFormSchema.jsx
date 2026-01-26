import { z } from "zod";

export const StructureLocumMainFormSchema = z.object({
    first_name: z.string().nonempty("First Name is required"),
    last_name: z.string().nonempty("Last Name is required"),
    email: z.string().email("Invalid email").nonempty("Email Address is required"),
    phone_number: z.string().nonempty("Phone Number is required"),

    profile_photo: z.any().refine(
        (file) => {
            if (typeof file === "string" && file.length > 0) return true; // existing file path
            return file instanceof FileList && file.length > 0; // new upload
        },
        "Profile Photo is required"
    ),

    dob: z.string().nonempty("Date of Birth is required"),
    gender: z.enum(["male", "female", "other", "prefer_not_say"], {
        errorMap: () => ({ message: "Gender is required" }),
    }),
    
    languages: z.array(z.string()).min(1, { message: "Select at least one language" }),
    province: z.string().nonempty("Province is required"),
    // province: z.array(z.string()).min(1, { message: "Select at least one province" }),
    city: z.string().nonempty("City of Residence is required"),
    address: z.string().nonempty("Address is required"),
    postal_code: z.string().nonempty("Postal Code is required"),

    id_upload: z.any().refine(
        (file) => {
            if (typeof file === "string" && file.length > 0) return true; // existing file path
            return file instanceof FileList && file.length > 0; // new upload
        },
        "ID file is required"
    ),

    // primary_role: z.string().nonempty("Primary Role is required"),
    //position_sought_ids: z.array(z.string()).min(1, { message: "Select at least one primary role" }),
    //position_sought_ids: z.array(z.number()).min(1, { message: "Select at least one primary role" }),
    professional_status: z.string().nonempty("Professional Status is required"),
    authorized_to_practice: z.enum(["yes", "in_progress", "no"], {
        errorMap: () => ({ message: "Authorization status is required" }),
    }),

    //license_number: z.string().nonempty("License Number is required"),
    license_number: z.string().optional(),
    practicing_since: z.string().nonempty("Practicing Since is required"),
    province_reporting: z.string().nonempty("Province for Reporting is required"),

    education_level: z.string().nonempty("Education level is required"),
    graduation_year: z.string().min(1, { message: "Graduation year is required" }),
    software_proficiency: z.array(z.string()).min(1, { message: "Select at least one software proficiency" }),
    additional_skills: z.array(z.string()).min(1, { message: "Select at least one additional skill" }),
    educational_institution: z.string().nonempty("Educational institution is required"),
    contract_type: z.union([z.string().min(1, { message: "Contract type is required" }), z.array(z.string().min(1, { message: "Contract type is required" })).min(1, { message: "Contract type is required" })]).transform(val => typeof val === "string" ? [val] : val)
});
