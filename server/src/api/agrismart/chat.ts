import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

interface ChatResponse {
  response: string;
}

const AGRI_KNOWLEDGE_BASE = {
  crops: [
    "rice",
    "corn",
    "vegetables",
    "fruits",
    "coffee",
    "coconut",
  ],
  techniques: [
    "crop rotation",
    "intercropping",
    "mulching",
    "integrated pest management",
    "drip irrigation",
    "composting",
  ],
  diseases: [
    "rice blast",
    "bacterial leaf blight",
    "tungro virus",
    "corn rust",
    "powdery mildew",
    "anthracnose",
  ],
}

function generateResponse(message: string): string {
  const messageLower = message.toLowerCase()
  
  // Check for greetings
  if (messageLower.includes("hello") || messageLower.includes("hi")) {
    return "Hello! How can I help you with your agricultural questions today?"
  }

  // Check for crop-related questions
  if (messageLower.includes("what") && messageLower.includes("crop")) {
    return `Here are some common crops in the Philippines: ${AGRI_KNOWLEDGE_BASE.crops.join(", ")}. What specific crop would you like to know more about?`
  }

  // Check for farming technique questions
  if (messageLower.includes("technique") || messageLower.includes("how to farm")) {
    return `Here are some farming techniques: ${AGRI_KNOWLEDGE_BASE.techniques.join(", ")}. Would you like to learn more about any specific technique?`
  }

  // Check for disease-related questions
  if (messageLower.includes("disease") || messageLower.includes("pest")) {
    return `Common plant diseases include: ${AGRI_KNOWLEDGE_BASE.diseases.join(", ")}. Would you like information about treating a specific disease?`
  }

  // Default response
  return "I'm your agricultural assistant. You can ask me about crops, farming techniques, plant diseases, or other agricultural topics. How can I help you today?"
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    const response = generateResponse(message)

    const chatResponse: ChatResponse = {
      response,
    }

    return NextResponse.json(chatResponse)
  } catch (error) {
    console.error("Error in AgriSmart chat:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}