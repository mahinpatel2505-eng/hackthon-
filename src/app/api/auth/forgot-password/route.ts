import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { OtpRequestSchema } from "@/lib/validators";
import { apiResponse, validateBody } from "@/lib/api-utils";
import crypto from "crypto";

import { sendOtpEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await validateBody(req, OtpRequestSchema);

    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      // For security, don't reveal if user exists or not
      return apiResponse.success({ message: "If an account exists, an OTP has been sent." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: otp,
        otpExpiresAt: expiresAt,
      },
    });

    // Send OTP (actual email + dev console)
    console.log(`[AUTH] OTP for ${body.email}: ${otp}`);
    
    // Attempt actual email delivery
    const emailResult = await sendOtpEmail(body.email, otp);
    if (!emailResult.success) {
      console.error("[AUTH] Email delivery failed, but proceeding for dev mode.");
    }

    return apiResponse.success({ 
      message: "If an account exists, an OTP has been sent.",
      devOtp: process.env.NODE_ENV === "development" ? otp : undefined,
      emailSent: emailResult.success
    });
  } catch (error: any) {
    if (error.name === "ZodError") return apiResponse.validationError(error.errors);
    console.error("[API] POST /api/auth/forgot-password error:", error);
    return apiResponse.error("Failed to process request");
  }
}
