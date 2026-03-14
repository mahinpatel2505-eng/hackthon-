import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignUpSchema } from "@/lib/validators";
import { apiResponse, validateBody } from "@/lib/api-utils";
import bcrypt from "bcrypt";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await validateBody(req, SignUpSchema);

    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return apiResponse.error("User with this email already exists", 400);
    }

    const passwordHash = await bcrypt.hash(body.password, 12);

    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        passwordHash,
        role: "STAFF", // Default role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return apiResponse.success(user, 201);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.warn("[API] POST /api/auth/signup validation error:", error.issues);
      return apiResponse.validationError(error.issues);
    }
    console.error("[API] POST /api/auth/signup error:", error);
    return apiResponse.error("Failed to create user");
  }
}
