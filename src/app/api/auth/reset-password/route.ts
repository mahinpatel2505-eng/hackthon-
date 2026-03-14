import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { OtpVerifySchema } from "@/lib/validators";
import { apiResponse, validateBody } from "@/lib/api-utils";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const body = await validateBody(req, OtpVerifySchema);

    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user || !user.otpCode || !user.otpExpiresAt) {
      return apiResponse.error("Invalid reset request", 400);
    }

    if (user.otpCode !== body.otp) {
      return apiResponse.error("Invalid OTP code", 400);
    }

    if (new Date() > user.otpExpiresAt) {
      return apiResponse.error("OTP has expired", 400);
    }

    const passwordHash = await bcrypt.hash(body.newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    return apiResponse.success({ message: "Password updated successfully" });
  } catch (error: any) {
    if (error.name === "ZodError") return apiResponse.validationError(error.errors);
    console.error("[API] POST /api/auth/reset-password error:", error);
    return apiResponse.error("Failed to reset password");
  }
}
