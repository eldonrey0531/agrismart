import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { ChatController } from "../controller";

export async function POST(req: Request) {
  try {
    const token = await getToken({ req });
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { participantId, initialMessage } = await req.json();

    if (!participantId) {
      return NextResponse.json(
        { success: false, error: "Missing participant ID" },
        { status: 400 }
      );
    }

    // Create new conversation
    const conversation = await ChatController.startConversation(
      token.id as string,
      participantId,
      initialMessage || "Started a conversation"
    );

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: "Failed to create conversation" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("[CHAT_CONVERSATION_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const token = await getToken({ req });
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing user ID" },
        { status: 400 }
      );
    }

    // Check if conversation exists
    const conversation = await ChatController.findConversationBetweenUsers(
      token.id as string,
      userId
    );

    return NextResponse.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("[CHAT_CONVERSATION_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}