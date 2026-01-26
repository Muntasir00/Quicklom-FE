import { z } from "zod";

export const insuranceCompanySchema = z.object({
    province_territory: z.string().nonempty("Province/Territory is required"),
    abbreviation: z.string().nonempty("Abbreviation is required"),
    official_name: z.string().nonempty("Official Name is required"),
    status: z.enum(["1", "0"], { required_error: "Status is required" }),
});





























