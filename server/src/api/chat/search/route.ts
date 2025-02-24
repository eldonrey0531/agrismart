import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { ConversationModel } from "@/server/models/conversation";
import { UserModel } from "@/server/models/user";
import type { IParticipant } from "@/types/chat";

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
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Search query is required" },
        { status: 400 }
      );
    }

    // Search users and conversations in parallel
    const [users, conversations] = await Promise.all([
      // Search users by name or email
      UserModel.find({
        $and: [
          { _id: { $ne: token.id } }, // Exclude current user
          {
            $or: [
              { name: { $regex: query, $options: "i" } },
              { email: { $regex: query, $options: "i" } },
            ],
          },
        ],
      })
        .select("name email")
        .limit(5)
        .exec(),

      // Search conversations by participant names
      ConversationModel.find({
        'participants.id': token.id,
        $or: [
          { 'participants.name': { $regex: query, $options: "i" } },
        ],
      })
        .sort({ updatedAt: -1 })
        .limit(5)
        .exec(),
    ]);

    // Format results
    const results = {
      users: users.map(user => ({
        id: user._id.toString(),
        name: user.name || user.email.split('@')[0],
        email: user.email,
        type: "user" as const,
      })),
      conversations: conversations.map(conv => ({
        id: conv._id.toString(),
        name: conv.participants.find((p: IParticipant) => p.id !== token.id)?.name || "Unnamed Chat",
        email: "",
        type: "conversation" as const,
      })),
    };

    return NextResponse.json({
      success: true,
      results: [...results.users, ...results.conversations],
    });
  } catch (error) {
    console.error("[CHAT_SEARCH_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}