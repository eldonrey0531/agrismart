import { NextResponse } from 'next/server';
import { getUser } from "@/server/models/user";

export async function GET() {
  try {
    // Test Database Connection
    const { UserModel, connectToDatabase } = await getUser();
    await connectToDatabase();
    console.log("Database connection test successful");

    // Create a test user if it doesn't exist
    const testEmail = process.env.NEXT_PUBLIC_TEST_ACCOUNT_EMAIL;
    const testPassword = process.env.NEXT_PUBLIC_TEST_ACCOUNT_PASSWORD;

    if (!testEmail || !testPassword) {
      throw new Error("Test credentials not configured");
    }

    let testUser = await UserModel.findOne({ email: testEmail });

    if (!testUser) {
      testUser = await UserModel.create({
        name: "Test User",
        email: testEmail,
        password: testPassword,
      });
      console.log("Test user created");
    }

    const isValidPassword = await testUser.comparePassword(testPassword);
    console.log("Password verification test:", isValidPassword);

    return NextResponse.json({
      success: true,
      message: "Auth system test successful",
      user: {
        id: testUser._id,
        email: testUser.email,
        name: testUser.name,
      }
    });

  } catch (error) {
    console.error("Auth test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}