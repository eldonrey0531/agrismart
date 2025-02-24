import { NextResponse } from "next/server";
import { z } from "zod";

// Contact form schema
const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters long"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate the request body
    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid form data",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, subject, message } = result.data;

    // TODO: Send email notification
    // This is where you would integrate with your email service provider
    // For example: SendGrid, AWS SES, etc.
    console.log("Contact form submission:", {
      firstName,
      lastName,
      email,
      subject,
      message,
    });

    // Store in database if needed
    // await db.contact.create({ data: result.data });

    // For now, just return success
    return NextResponse.json({
      success: true,
      message: "Thank you for your message. We'll get back to you soon!",
    });
  } catch (error) {
    console.error("[CONTACT_API_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}

// Rate limiting configuration
export const config = {
  api: {
    bodyParser: true,
  },
};