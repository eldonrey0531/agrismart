import { Metadata } from "next";
import Link from "next/link";
import { EmailVerification } from "@/components/auth/email-verification";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address",
};

export default function VerifyEmailPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:px-0">
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Verify Your Email
            </h1>
            <p className="text-sm text-muted-foreground">
              Please check your email for a verification link
            </p>
          </div>
          <EmailVerification />
          <p className="px-8 text-center text-sm text-muted-foreground">
            Didn&apos;t receive the email?{" "}
            <Link
              href="/resend-verification"
              className="hover:text-brand underline underline-offset-4"
            >
              Resend verification email
            </Link>
          </p>
          <p className="px-8 text-center text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-brand underline underline-offset-4">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}