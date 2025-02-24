import { NextRequest, NextResponse } from "next/server";
import { emailService } from "@/lib/email/email-service";

// This route is only available in development mode
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Test routes are not available in production" },
      { status: 404 }
    );
  }

  try {
    const { type, email, name } = await req.json();

    switch (type) {
      case "verification":
        await emailService.sendVerificationEmail({
          email,
          name,
          token: "test-verification-token",
        });
        break;

      case "reset":
        await emailService.sendPasswordResetEmail({
          email,
          name,
          token: "test-reset-token",
        });
        break;

      case "password-changed":
        await emailService.sendPasswordChangedNotification({
          email,
          name,
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid test type" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      details: {
        type,
        email,
        name,
      },
    });
  } catch (error) {
    console.error("[EMAIL_TEST_ERROR]", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to send test email",
      },
      { status: 500 }
    );
  }
}

// Test endpoint documentation endpoint
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Test routes are not available in production" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    description: "Email service test endpoint",
    usage: {
      method: "POST",
      contentType: "application/json",
      types: ["verification", "reset", "password-changed"],
      body: {
        type: "verification | reset | password-changed",
        email: "test@example.com",
        name: "Test User",
      },
      example: {
        curl: `curl -X POST http://localhost:3000/api/tests/email \\
          -H "Content-Type: application/json" \\
          -d '{"type": "verification", "email": "test@example.com", "name": "Test User"}'`,
      },
    },
  });
}