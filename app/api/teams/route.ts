import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

// In a real app, you would connect to a database
// This is a simplified example using in-memory storage

const teams = []

export async function GET() {
  const session = await getServerSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // In a real app, you would filter teams by user membership
  return NextResponse.json({ teams })
}

export async function POST(request: Request) {
  const session = await getServerSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()

    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 })
    }

    // Create new team
    const newTeam = {
      id: `team-${Date.now()}`,
      name: data.name,
      description: data.description || "",
      createdBy: session.user.id,
      members: [
        {
          id: session.user.id,
          name: session.user.name,
          role: "Team Lead",
          joinedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    }

    // In a real app, you would save to a database
    teams.push(newTeam)

    return NextResponse.json({ team: newTeam }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 })
  }
}

