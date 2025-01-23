import { NoSerialize } from "@builder.io/qwik";
import { isBlob } from "~/common/formSchema";
import { Maybe } from "@modular-forms/qwik";
import * as v from "valibot";

export const CreateBasicPostInfoSchema = v.object({
  title: v.pipe(v.string("Required"), v.nonEmpty("Please enter title.")),
  description: v.pipe(
    v.string("Required"),
    v.nonEmpty("Please enter description."),
  ),
  wfh: v.pipe(
    v.union([v.literal("yes"), v.literal("no")], "Required"),
    v.nonEmpty("Please choose wfh."),
  ),
  deadline: v.date("Required"),
  tags: v.array(
    v.object({
      tagName: v.pipe(v.string(), v.nonEmpty()),
      tagCategory: v.pipe(v.string(), v.nonEmpty()),
    }),
  ),
});

export type BasicPostInfoStep = v.InferInput<typeof CreateBasicPostInfoSchema>;

export const BrandingVisualsSchema = v.object({
  logoFile: v.custom<NoSerialize<Maybe<Blob>>>((input: unknown) => {
    if (input === undefined) return true;

    return isBlob(input);
  }),
  posterFile: v.custom<NoSerialize<Maybe<Blob>>>((input: unknown) => {
    if (input === undefined) return true;

    return isBlob(input);
  }),
});

export type BrandingVisualsStep = v.InferInput<typeof BrandingVisualsSchema>;

export const JobDetailsInfoSchema = v.object({
  jobType: v.picklist(["full-time", "part-time", "contract", "internship"]),
  salaryType: v.picklist(["fixed", "hourly", "monthly"]),
  salaryAmountMin: v.number(),
  salaryAmountMax: v.number(),
  salaryCurrency: v.pipe(
    v.string("Required"),
    v.nonEmpty("Please enter salary currency."),
  ),
});

export type JobDetailsInfoStep = v.InferInput<typeof JobDetailsInfoSchema>;

export const JobRequirmentsSchema = v.object({
  qualifications: v.array(v.string()),
  responsibilities: v.array(v.string()),
});

export type JobRequirementsStep = v.InferInput<typeof JobRequirmentsSchema>;

export const RichTextEditorSchema = v.object({
  richTextContent: v.optional(v.string()),
});

export type RichTextEditorStep = v.InferInput<typeof RichTextEditorSchema>;

export type CreateJobPostFormData = {
  postId?: string;
  form1?: BasicPostInfoStep;
  form2?: string;
  form4?: JobDetailsInfoStep;
  form5?: JobRequirementsStep;
  form6?: RichTextEditorStep;
};
