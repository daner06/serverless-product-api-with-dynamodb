import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().nonnegative(),
});

export type ProductInput = z.infer<typeof productSchema>;
