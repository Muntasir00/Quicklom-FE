import { z } from "zod";

export const StructureLocumLicenseFormSchema = z
  .object({
    //position: z.string().nonempty("Position is required"),

    license_required: z
      .enum(["yes", "no", "optional"])
      .or(z.literal(""))
      .optional(),

    license_number: z.string().optional(),
    license_expiry: z.string().optional(),
    issuing_authority: z.string().optional(),
    license_document: z.any().optional(),
    notes: z.string().optional(),
    additional_info: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // If license_required = 'yes' or 'true', make others required
    if (data.license_required === "yes" || data.license_required === "true") {
      if (!data.license_number || data.license_number.trim() === "") {
        ctx.addIssue({
          path: ["license_number"],
          message: "License Number is required",
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.license_expiry || data.license_expiry.trim() === "") {
        ctx.addIssue({
          path: ["license_expiry"],
          message: "License Expiry Date is required",
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.issuing_authority || data.issuing_authority.trim() === "") {
        ctx.addIssue({
          path: ["issuing_authority"],
          message: "Issuing Authority is required",
          code: z.ZodIssueCode.custom,
        });
      }

      const file = data.license_document;
      const hasFile =
        (typeof file === "string" && file.length > 0) ||
        (file instanceof FileList && file.length > 0);
      if (!hasFile) {
        ctx.addIssue({
          path: ["license_document"],
          message: "License Document is required",
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.notes || data.notes.trim() === "") {
        ctx.addIssue({
          path: ["notes"],
          message: "Notes are required",
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.additional_info || data.additional_info.trim() === "") {
        ctx.addIssue({
          path: ["additional_info"],
          message: "Additional Info is required",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });

