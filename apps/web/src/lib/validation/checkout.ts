import { z } from "zod";

export const cartItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().nullable(),
  quantity: z.number().int().min(1).max(20),
});

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone/WhatsApp number")
    .max(20),
  fulfilmentMethod: z.enum(["delivery", "pickup"]),
  deliveryAddress: z
    .object({
      address: z.string().trim().min(5, "Enter your delivery address"),
      city: z.string().trim().optional(),
      zone: z.string().trim().optional(),
      notes: z.string().trim().optional(),
    })
    .nullable(),
  items: z.array(cartItemSchema).min(1, "Your cart is empty"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
