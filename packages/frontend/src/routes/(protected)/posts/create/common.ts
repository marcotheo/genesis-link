import * as v from "valibot";

export const CreatePostSchema = v.object({
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
  phone: v.pipe(v.string(), v.nonEmpty("Please enter phone.")),
  deadline: v.date(),
});

export type CreatePostForm = v.InferInput<typeof CreatePostSchema>;
