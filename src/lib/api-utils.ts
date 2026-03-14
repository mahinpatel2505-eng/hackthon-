import { NextRequest, NextResponse } from "next/server";
import { z, ZodSchema } from "zod";

// ────────────────────────────────────────────────────────────
// Standardized API Response Helpers
// ────────────────────────────────────────────────────────────

export const apiResponse = {
  success: <T>(data: T, status = 200) =>
    NextResponse.json({ success: true, data }, { status }),
  
  error: (error: string, status = 400) =>
    NextResponse.json({ success: false, error }, { status }),
  
  validationError: (errors: any[]) =>
    NextResponse.json({ success: false, error: "Validation failed", details: errors }, { status: 422 }),
  
  unauthorized: () =>
    NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }),
};

// ────────────────────────────────────────────────────────────
// Body Validation Wrapper
// ────────────────────────────────────────────────────────────

export async function validateBody<T>(req: NextRequest, schema: z.ZodSchema<T>): Promise<T> {
  const body = await req.json();
  return schema.parse(body);
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function authGuard(req?: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  return session.user;
}

// ────────────────────────────────────────────────────────────
// (Legacy exports for backward compatibility)
// ────────────────────────────────────────────────────────────

export function successResponse<T>(data: T, message?: string, status = 200) {
  return NextResponse.json({ success: true, data, message }, { status });
}

export function errorResponse(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}
