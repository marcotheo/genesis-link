import * as v from "valibot";

export const CreateAddessSchema = v.object({
  region: v.pipe(v.string("Required"), v.nonEmpty("Please enter region.")),
  province: v.pipe(v.string("Required"), v.nonEmpty("Please enter province.")),
  city: v.pipe(v.string("Required"), v.nonEmpty("Please enter city.")),
  barangay: v.pipe(v.string("Required"), v.nonEmpty("Please enter barangay.")),
  addressDetails: v.pipe(
    v.string("Required"),
    v.nonEmpty("Please enter addressDetails."),
  ),
});

export type CreateAddressForm = v.InferInput<typeof CreateAddessSchema>;

export const isBlob = (input: unknown) => {
  if (!(input instanceof Blob)) return false;

  return true;
};
