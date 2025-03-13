"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Plus, Users } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Mock data for teams
const mockTeams = [
  {
    id: "1",
    name: "Development Team",
    description: "Frontend and backend developers",
    members: [
      { id: "1", name: "John Doe", role: "Team Lead", avatar: "/placeholder.svg?height=40&width=40" },
      { id: "2", name: "Jane Smith", role: "Frontend Developer", avatar: "/placeholder.svg?height=40&width=40" },
      { id: "3", name: "Mike Johnson", role: "Backend Developer", avatar: "/placeholder.svg?height=40&width=40" },
    ],
  },
  {
    id: "2",
    name: "Design Team",
    description: "UI/UX designers and graphic artists",
    members: [
      { id: "4", name: "Sarah Williams", role: "Design Lead", avatar: "/placeholder.svg?height=40&width=40" },
      { id: "5", name: "Alex Brown", role: "UI Designer", avatar: "/placeholder.svg?height=40&width=40" },
    ],
  },
]

export function TeamsList() {
  const [teams, setTeams] = useState(mockTeams)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleCreateTeam(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const name = formData.get("team-name") as string
    const description = formData.get("team-description") as string

    try {
      // In a real app, you would call your API to create the team
      // const response = await fetch("/api/teams", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ name, description }),
      // })

      // if (!response.ok) throw new Error("Failed to create team")

      // Simulate API response
      const newTeam = {
        id: `${teams.length + 1}`,
        name,
        description,
        members: [{ id: "1", name: "John Doe", role: "Team Lead", avatar: "/placeholder.svg?height=40&width=40" }],
      }

      setTeams([...teams, newTeam])
      setIsDialogOpen(false)

      toast({
        title: "Team created!",
        description: "Your new team has been successfully created.",
      })

      // Reset form
      event.currentTarget.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Your Teams</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Team</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new team</DialogTitle>
              <DialogDescription>Add a new team to collaborate with your colleagues</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTeam}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="team-name">Team Name</Label>
                  <Input
                    id="team-name"
                    name="team-name"
                    placeholder="e.g., Marketing Team"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="team-description">Description</Label>
                  <Input
                    id="team-description"
                    name="team-description"
                    placeholder="Brief description of the team"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Team"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {team.name}
              </CardTitle>
              <CardDescription>{team.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Team Members ({team.members.length})</h4>
                  <div className="space-y-2">
                    {team.members.map((member) => (
                      <div key={member.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                        <Avatar>
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          Active
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Manage Team
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

