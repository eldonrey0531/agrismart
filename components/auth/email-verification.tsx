import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icons } from "@/components/ui/icons";

export function EmailVerification() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = searchParams.get("token");

  useEffect(() => {
    async function verifyEmail() {
      if (!token) return;

      try {
        setIsVerifying(true);
        setError(null);

        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Verification failed");
        }

        // Redirect to login after successful verification
        router.push("/login?verified=true");
      } catch (error) {
        setError(error instanceof Error ? error.message : "Verification failed");
      } finally {
        setIsVerifying(false);
      }
    }

    if (token) {
      verifyEmail();
    }
  }, [token, router]);

  async function handleResendVerification() {
    try {
      setIsVerifying(true);
      setError(null);

      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend verification email");
      }

      // Show success message
      alert("Verification email has been resent");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to resend verification email");
    } finally {
      setIsVerifying(false);
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col gap-4 items-center">
        <p className="text-center text-sm text-muted-foreground">
          Check your email for a verification link. If you haven&apos;t received it,
          you can request a new one.
        </p>
        <Button
          onClick={handleResendVerification}
          disabled={isVerifying}
          className="w-full"
        >
          {isVerifying && (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          )}
          Resend Verification Email
        </Button>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 items-center">
      {isVerifying ? (
        <div className="flex flex-col items-center gap-4">
          <Icons.spinner className="h-8 w-8 animate-spin" />
          <p className="text-center text-sm text-muted-foreground">
            Verifying your email...
          </p>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Email verified successfully! Redirecting...
        </p>
      )}
    </div>
  );
}