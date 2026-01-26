import { z } from "zod";

export const messageSchema = z.object({
    receiver_id: z.union([
        z.string().nonempty("Receiver is required, select from the contact section."),
        z.number(),
    ]),
    subject: z.string().nonempty("Subject is required"),
    body: z.string().nonempty("Message body is required"),
    attachment: z.any().optional().refine((file) => {
        if (!file) return true;
        if (typeof file === "string" && file.length > 0) return true;
        return file instanceof FileList && file.length > 0;
    }, "Invalid attachment file"),
});
