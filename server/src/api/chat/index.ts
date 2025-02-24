import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { ConversationModel, findUserConversations, updateLastMessage } from "@/server/models/conversation";
import { MessageModel, createMessage, getConversationMessages } from "@/server/models/message";
import type { IMessage, IMessageResponse, IConversation } from "@/types/chat";

export async function POST(req: Request) {
  try {
    const token = await getToken({ req });
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { conversationId, content } = await req.json();

    if (!conversationId || !content) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify conversation exists and user is a participant
    const conversation = await ConversationModel.findOne({
      _id: conversationId,
      'participants.id': token.id,
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Create message and update conversation
    const [message] = await Promise.all([
      createMessage(conversationId, token.id as string, content),
      updateLastMessage(conversationId, content, token.id as string),
    ]);

    const response: IMessageResponse = {
      success: true,
      message,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[CHAT_API_ERROR]", error);
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
    const conversationId = searchParams.get("conversationId");

    if (conversationId) {
      // Verify user is a participant
      const conversation = await ConversationModel.findOne({
        _id: conversationId,
        'participants.id': token.id,
      });

      if (!conversation) {
        return NextResponse.json(
          { success: false, error: "Conversation not found" },
          { status: 404 }
        );
      }

      // Get messages
      const messages = await getConversationMessages(
        conversationId,
        50, // Limit to last 50 messages
        new Date()
      );

      return NextResponse.json({
        success: true,
        messages: messages.reverse(), // Return in chronological order
      });
    }

    // Get all conversations for user
    const conversations = await findUserConversations(token.id as string);

    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("[CHAT_API_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}