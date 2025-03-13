"use client"

import { useState, useEffect } from "react"
import { WeeklySchedule } from "@/components/weekly-schedule"
import { ScheduleModifier } from "@/components/schedule-modifier"
import { FeatureNotification } from "@/components/feature-notification"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockScheduleData } from "@/lib/mock-data"
import { toast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const [scheduleData, setScheduleData] = useState(mockScheduleData)
  const [isModifierOpen, setIsModifierOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [showFeatureNotification, setShowFeatureNotification] = useState(true)

  useEffect(() => {
    // Check if the user has seen the notification before
    const hasSeenNotification = localStorage.getItem("hasSeenAddScheduleNotification")
    if (hasSeenNotification) {
      setShowFeatureNotification(false)
    } else {
      // Set a flag in localStorage so we don't show the notification again
      localStorage.setItem("hasSeenAddScheduleNotification", "true")
    }
  }, [])

  const handleScheduleClick = (slot) => {
    setSelectedSlot(slot)
    setIsModifierOpen(true)
  }

  const handleAddSchedule = (newSlot) => {
    setSelectedSlot(newSlot)
    setIsModifierOpen(true)
  }

  const handleScheduleUpdate = (updatedSlot, applyToAll) => {
    setScheduleData((prevData) => {
      const newData = [...prevData]

      if (applyToAll) {
        // Update all slots with the same day and time
        return newData.map((slot) => {
          if (slot.day === updatedSlot.day && slot.startTime === selectedSlot.startTime) {
            return { ...slot, ...updatedSlot }
          }
          return slot
        })
      } else {
        // Update only the selected slot or add a new one
        const index = newData.findIndex(
          (slot) =>
            slot.day === selectedSlot.day &&
            slot.startTime === selectedSlot.startTime &&
            slot.endTime === selectedSlot.endTime,
        )

        if (index !== -1) {
          newData[index] = { ...newData[index], ...updatedSlot }
        } else {
          newData.push(updatedSlot)
        }

        return newData
      }
    })

    setIsModifierOpen(false)
    setSelectedSlot(null)

    toast({
      title: "Schedule updated",
      description: "Your schedule has been successfully updated.",
    })

    // In a real app, you would notify team members here
    // notifyTeam(updatedSlot, applyToAll)
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header and other components remain the same */}

      <main className="flex-1 container py-6">
        <Tabs defaultValue="schedule" className="space-y-4">
          {/* Tab headers remain the same */}

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Weekly Schedule</CardTitle>
                <CardDescription>
                  Click on any time slot to modify your schedule or click an empty area to add a new slot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WeeklySchedule
                  scheduleData={scheduleData}
                  onScheduleClick={handleScheduleClick}
                  onAddSchedule={handleAddSchedule}
                />
              </CardContent>
            </Card>

            {isModifierOpen && selectedSlot && (
              <ScheduleModifier
                slot={selectedSlot}
                onClose={() => {
                  setIsModifierOpen(false)
                  setSelectedSlot(null)
                }}
                onUpdate={handleScheduleUpdate}
              />
            )}
          </TabsContent>

          {/* Other tab contents remain the same */}
        </Tabs>
      </main>

      {showFeatureNotification && (
        <FeatureNotification message="New feature: Click on any empty area in the schedule to add a new time block!" />
      )}
    </div>
  )
}

