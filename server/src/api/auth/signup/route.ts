import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { userRegistrationSchema } from "@/lib/types/auth";
import type { RegistrationData, UserModel, AuthResponse } from "@/lib/types/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const result = userRegistrationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: "Invalid input",
        details: result.error.errors,
      }, { status: 400 });
    }

    const data = result.data as RegistrationData;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: "User already exists",
      }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        mobile: data.mobile,
        role: "user",
        isVerified: false,
        status: "pending",
        notificationPreferences: data.notificationPreferences ?? {
          email: true,
          push: true,
          sms: false,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        mobile: true,
        role: true,
        isVerified: true,
        status: true,
        notificationPreferences: true,
        createdAt: true,
        updatedAt: true,
      },
    }) as UserModel;

    const response: AuthResponse = {
      success: true,
      user,
      message: "User created successfully. Please verify your email.",
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error("[SIGNUP_ERROR]", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error",
    }, { status: 500 });
  }
}