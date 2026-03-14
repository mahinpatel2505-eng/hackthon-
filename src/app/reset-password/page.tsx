"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, Loader2, Mail, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ResetPasswordPage() {
  const router = useRouter();
  
  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDevOtp(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Request failed");
      } else {
        if (data.devOtp) setDevOtp(data.devOtp);
        setStep("verify");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Reset failed");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-xl text-primary-foreground shadow-lg shadow-primary/20">
              <KeyRound className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {step === "request" ? "Reset Password" : "Enter OTP"}
          </CardTitle>
          <CardDescription>
            {step === "request" 
              ? "Enter your email to receive a password reset code" 
              : `Enter the 6-digit code sent to ${email}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 mb-4 py-2">
              <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {devOtp && (
            <Alert className="bg-blue-50 text-blue-700 border-blue-200 mb-4 py-2">
              <AlertDescription className="text-sm font-medium text-center">
                [DEV MODE] Your OTP is: <span className="font-bold text-lg tracking-widest">{devOtp}</span>
              </AlertDescription>
            </Alert>
          )}
          
          {success ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-3">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <p className="font-medium text-slate-900">Password updated! Redirecting...</p>
            </div>
          ) : step === "request" ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    className="pl-10 h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 font-semibold shadow-lg shadow-primary/20" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send Reset Code"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    placeholder="6-digit OTP"
                    className="text-center text-lg tracking-widest h-11"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="New Password"
                    className="pl-10 h-11"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 font-semibold shadow-lg shadow-primary/20" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
              <button 
                type="button" 
                onClick={() => setStep("request")}
                className="w-full text-xs text-slate-500 hover:text-primary pt-2"
              >
                Didn&apos;t receive a code? Try again
              </button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center">
          <Link href="/login" className="text-sm font-semibold text-primary hover:underline">
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
