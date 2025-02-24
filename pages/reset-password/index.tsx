import { Metadata } from "next";
import Link from "next/link";
import { RequestPasswordReset } from "@/components/auth/request-password-reset";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your password",
};

export default function ResetPasswordPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:px-0">
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Reset Password
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email address and we&apos;ll send you a link to reset your
              password
            </p>
          </div>
          <RequestPasswordReset />
          <p className="px-8 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link href="/login" className="hover:text-brand underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}