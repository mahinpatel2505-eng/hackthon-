import { NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";

// ────────────────────────────────────────────────────────────
// Standardized API Response Helpers
// ────────────────────────────────────────────────────────────

export function successResponse<T>(data: T, message?: string, status = 200) {
  return NextResponse.json(
    { success: true, data, message: message ?? "Operation completed successfully" },
    { status }
  );
}

export function errorResponse(error: string, status = 400) {
  return NextResponse.json(
    { success: false, error },
    { status }
  );
}

export function serverError(error: unknown) {
  console.error("[API_ERROR]", error);
  const message =
    error instanceof Error ? error.message : "An unexpected internal error occurred";
  return NextResponse.json(
    { success: false, error: message },
    { status: 500 }
  );
}

// ────────────────────────────────────────────────────────────
// Zod Request Body Parser + Validator
// ────────────────────────────────────────────────────────────

export async function parseAndValidate<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return { data: null, error: errorResponse("Invalid JSON in request body", 400) };
  }

  try {
    const data = schema.parse(body);
    return { data, error: null };
  } catch (err) {
    if (err instanceof ZodError) {
      const fieldErrors = err.issues.map(
        (e) => `${String(e.path.join("."))}: ${e.message}`
      );
      return {
        data: null,
        error: errorResponse(`Validation failed: ${fieldErrors.join("; ")}`, 422),
      };
    }
    return { data: null, error: errorResponse("Validation error", 422) };
  }
}

// ────────────────────────────────────────────────────────────
// Auth Guard (Stub — replace with real auth in production)
// Extracts userId from header for now; swap for JWT/session later.
// ────────────────────────────────────────────────────────────

export function getUserIdFromRequest(request: Request): string | null {
  // In production, decode JWT or read session cookie here.
  // For hackathon, accept it from a header for demo purposes.
  const userId = request.headers.get("x-user-id");
  return userId && userId.length > 0 ? userId : null;
}

export function requireAuth(
  request: Request
): { userId: string; error: null } | { userId: null; error: NextResponse } {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return { userId: null, error: errorResponse("Unauthorized: Missing x-user-id header", 401) };
  }
  return { userId, error: null };
}
