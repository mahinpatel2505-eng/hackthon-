import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail(email: string, otp: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "CoreInventory <onboarding@resend.dev>",
      to: [email],
      subject: "Password Reset - CoreInventory",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
          <h2 style="color: #0f172a; font-size: 24px; font-weight: bold; margin-bottom: 16px;">Password Reset Request</h2>
          <p style="color: #475569; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
            We received a request to reset your password for your CoreInventory account. Use the following 6-digit code to proceed:
          </p>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0f172a;">${otp}</span>
          </div>
          <p style="color: #475569; font-size: 14px; line-height: 20px;">
            This code will expire in 10 minutes. If you did not request a password reset, please ignore this email.
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">
            © ${new Date().getFullYear()} CoreInventory. Hackathon Project.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("[EMAIL] Resend error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("[EMAIL] Unexpected error:", error);
    return { success: false, error };
  }
}
