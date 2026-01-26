import { z } from "zod";

export const roleSchema = z.object({
    name: z.string().nonempty("Name is required"),
    description: z.string().nonempty("Description is required"),
    status: z.enum(["1", "0"], { required_error: "Status is required" }),
    permission_ids: z.array(z.string()).min(1, "At least one permission is required")
})