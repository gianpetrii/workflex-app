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

export default function TeamSchedulePage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [selectedWeek, setSelectedWeek] = useState("current")
  const [teams, setTeams] = useState(mockTeamData)

  // Manejar actualizaciones de horario
  const handleScheduleUpdate = (memberId, schedule) => {
    console.log("Schedule updated", memberId, schedule)
    // En un entorno real, esto se enviaría al backend para persistirlo
    toast({
      title: "Schedule Updated",
      description: "Your team schedule changes have been saved.",
    })
  }

  if (!user) {
    return null // La protección se maneja en el componente ProtectedRoute
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="icon">
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <h1 className="text-xl font-semibold">WorkFlex</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/teams">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Teams
                  </Link>
                </Button>
                <div className="flex items-center">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL} alt={user.displayName} />
                    <AvatarFallback>{user.displayName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      signOut()
                      router.push("/")
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 container py-6 mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-lg bg-white">
            <CardHeader className="border-b">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">Team Schedule</CardTitle>
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
            <CardContent className="pt-6">
              <TeamScheduleView teams={teams} userSchedule={mockScheduleData} onScheduleUpdate={handleScheduleUpdate} />

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

