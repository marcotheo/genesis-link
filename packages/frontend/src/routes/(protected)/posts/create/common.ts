import { NoSerialize } from "@builder.io/qwik";
import { isBlob } from "~/common/formSchema";
import { Maybe } from "@modular-forms/qwik";
import * as v from "valibot";

export const CreateBasicPostInfoSchema = v.object({
  company: v.pipe(v.string("Required"), v.nonEmpty("Please enter company.")),
  title: v.pipe(v.string("Required"), v.nonEmpty("Please enter title.")),
  description: v.pipe(
    v.string("Required"),
    v.nonEmpty("Please enter description."),
  ),
  wfh: v.pipe(
    v.union([v.literal("yes"), v.literal("no")], "Required"),
    v.nonEmpty("Please choose wfh."),
  ),
  email: v.pipe(
    v.string("Required"),
    v.nonEmpty("Please enter your email."),
    v.email("Invalid email"),
  ),
  phone: v.pipe(v.string("Required"), v.nonEmpty("Required")),
  deadline: v.date("Required"),
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

export type CreateJobPostFormData = {
  form1?: BasicPostInfoStep;
  form2?: BrandingVisualsStep & {
    logoS3key: string | null;
    posterS3Key: string | null;
  };
  form3?: string;
  form4?: JobDetailsInfoStep;
};
