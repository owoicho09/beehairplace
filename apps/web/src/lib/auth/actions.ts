"use server";

import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";

import { createAdminSession, destroyAdminSession } from "./session";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export type LoginState = { error?: string } | undefined;

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter a valid email and password" };
  }

  const admin = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.email, parsed.data.email.toLowerCase()),
  });

  // Compare against a dummy hash when no user matches, so login timing
  // doesn't reveal whether an email exists in the system.
  const passwordHash = admin?.passwordHash ?? "$2a$10$invalidsaltinvalidsaltinvalidsaltinvalidsal";
  const valid = await compare(parsed.data.password, passwordHash);

  if (!admin || !valid) {
    return { error: "Invalid email or password" };
  }

  await createAdminSession({ adminId: admin.id, email: admin.email });
  redirect("/admin");
}

export async function logout() {
  await destroyAdminSession();
  redirect("/admin/login");
}
