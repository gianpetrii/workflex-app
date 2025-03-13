import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

// In a real app, you would connect to a database
// This is a simplified example using in-memory storage

const messages = []

export async function GET() {
  const session = await getServerSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // In a real app, you would filter messages by team membership
  return NextResponse.json({ messages })
}

export async function POST(request: Request) {
  const session = await getServerSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()

    // Validate required fields
    if (!data.teamId || !data.content) {
      return NextResponse.json({ error: "Team ID and content are required" }, { status: 400 })
    }

    // Create new message
    const newMessage = {
      id: `message-${Date.now()}`,
      teamId: data.teamId,
      sender: {
        id: session.user.id,
        name: session.user.name,
      },
      content: data.content,
      timestamp: new Date().toISOString(),
    }

    // In a real app, you would save to a database
    messages.push(newMessage)

    return NextResponse.json({ message: newMessage }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

