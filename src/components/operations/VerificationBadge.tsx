import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface VerificationBadgeProps {
  status: string;
  isVerified?: boolean;
}

export function VerificationBadge({ status, isVerified }: VerificationBadgeProps) {
  if (status !== "VALIDATED") {
    return (
      <Badge variant="secondary" className="bg-slate-100 text-slate-500 gap-1 pr-2">
        <AlertTriangle className="w-3 h-3" /> Pending
      </Badge>
    );
  }

  if (isVerified === true) {
    return (
      <Badge variant="default" className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1 pr-2 hover:bg-emerald-100">
        <CheckCircle2 className="w-3 h-3" /> Verified
      </Badge>
    );
  }

  if (isVerified === false) {
    return (
      <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200 gap-1 pr-2 hover:bg-red-100">
        <XCircle className="w-3 h-3" /> Inconsistent
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1 pr-2">
      Validated
    </Badge>
  );
}
