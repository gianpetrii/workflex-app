import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

// In a real app, you would connect to a database
// This is a simplified example using in-memory storage

const teams = []
const teamMembers = []

export async function GET(request: Request) {
  const session = await getServerSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get query parameters
  const { searchParams } = new URL(request.url)
  const teamId = searchParams.get("teamId")

  if (teamId) {
    // Get team details with members
    const team = teams.find((t) => t.id === teamId)

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    const members = teamMembers.filter((member) => member.teamId === teamId)

    return NextResponse.json({
      team: {
        ...team,
        members,
      },
    })
  } else {
    // Get all teams the user is a member of
    const userTeamMemberships = teamMembers.filter((member) => member.userId === session.user.id)
    const userTeams = userTeamMemberships
      .map((membership) => {
        const team = teams.find((t) => t.id === membership.teamId)
        return team
      })
      .filter(Boolean)

    return NextResponse.json({ teams: userTeams })
  }
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
      createdBy: session.user.id,
      createdAt: new Date().toISOString(),
    }

    // Add creator as team member
    const newTeamMember = {
      id: `member-${Date.now()}`,
      teamId: newTeam.id,
      userId: session.user.id,
      role: "Admin",
      joinedAt: new Date().toISOString(),
    }

    // In a real app, you would save to a database
    teams.push(newTeam)
    teamMembers.push(newTeamMember)

    return NextResponse.json(
      {
        team: {
          ...newTeam,
          members: [newTeamMember],
        },
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 })
  }
}

