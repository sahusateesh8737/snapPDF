"use server";

import { signIn, signOut } from "@/auth";

export async function handleSignOut() {
  await signOut({ redirectTo: "/" });
}

export async function handleGoogleSignIn() {
  await signIn("google", { redirectTo: "/" });
}

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { loginSchema, registerSchema } from "@/lib/schemas";

export async function register(formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  
  const validatedFields = registerSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: validatedFields.error.errors[0].message };
  }

  const { email, password, name } = validatedFields.data;

  try {
    const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser) {
      return { error: "User already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      email,
      password: hashedPassword,
      name,
      emailVerified: new Date(),
    });

    return { success: true };
  } catch (err) {
    return { error: "Failed to create user" };
  }
}

export async function login(formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  
  const validatedFields = loginSchema.safeParse(data);

  if (!validatedFields.success) {
     // Return validation error if possible, or throw for now
     // In a real app we'd return { error: ... }
     throw new Error(validatedFields.error.errors[0].message);
  }

  const { email, password } = validatedFields.data;

  await signIn("credentials", { 
      email, 
      password, 
      redirectTo: "/" 
  });
}
