"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TeamScheduleView } from "@/components/team-schedule-view"
import { Bell, ChevronLeft, LogOut, Users } from "lucide-react"
import { mockTeamData, mockScheduleData } from "@/lib/mock-data"
import { toast } from "@/hooks/use-toast"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function TeamPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [selectedWeek, setSelectedWeek] = useState("current")

  // In a real app, you would fetch this data based on the selected week
  const teams = Object.entries(mockTeamData).map(([id, members]) => ({
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    members,
  }))

  const handleScheduleUpdate = (updatedSchedule) => {
    // In a real app, you would update the schedule in the database
    toast({
      title: "Schedule updated",
      description: "Changes have been saved and shared with your team.",
    })
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-gray-50">
        <header className="sticky top-0 z-10 border-b bg-white shadow-sm">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-lg font-semibold">WorkFlex</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                  <AvatarFallback>
                    {user?.displayName ? user.displayName.charAt(0) : user?.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{user?.displayName || "User"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" aria-label="Log out" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 container py-6">
          <Card className="shadow-lg bg-white">
            <CardHeader className="border-b">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">Team Schedule View</CardTitle>
                  <CardDescription>Visualize and coordinate team schedules</CardDescription>
                </div>
                <div>
                  <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select week" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="previous">Previous Week</SelectItem>
                      <SelectItem value="current">Current Week</SelectItem>
                      <SelectItem value="next">Next Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <TeamScheduleView teams={teams} userSchedule={mockScheduleData} onScheduleUpdate={handleScheduleUpdate} />

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium mb-2">Legend:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-200 rounded-sm"></div>
                    <span className="text-sm">Your Schedule</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-200 rounded-sm"></div>
                    <span className="text-sm">Team Member Schedule</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-300 opacity-50 rounded-sm"></div>
                    <span className="text-sm">Overlapping Hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-200 opacity-30 rounded-sm"></div>
                    <span className="text-sm flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      Co-located Work
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-start gap-2">
                  <div className="bg-blue-100 p-1 rounded-full mt-0.5">
                    <Bell className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">Real-time Updates</h4>
                    <p className="text-xs text-blue-600">
                      Team members' schedules are updated in real-time. When team members work in the same location at the
                      same time, their schedules will be highlighted with a yellow background.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}

