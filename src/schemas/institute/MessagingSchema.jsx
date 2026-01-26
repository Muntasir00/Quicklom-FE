import { z } from "zod";

export const messageSchema = z.object({
    receiver_id: z.union([
        z.string().nonempty("Receiver is required"),
        z.number(),
    ]),
    subject: z.string().nonempty("Subject is required"),
    body: z.string().nonempty("Message body is required"),
});
