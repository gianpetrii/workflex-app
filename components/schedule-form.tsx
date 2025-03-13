"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

export function ScheduleForm() {
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const date = formData.get("date") as string
    const startTime = formData.get("start-time") as string
    const endTime = formData.get("end-time") as string
    const location = formData.get("location") as string

    try {
      // In a real app, you would call your API to save the schedule
      // const response = await fetch("/api/schedules", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ date, startTime, endTime, location }),
      // })

      // if (!response.ok) throw new Error("Failed to save schedule")

      toast({
        title: "Schedule saved!",
        description: "Your work schedule has been successfully registered.",
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
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" name="date" type="date" required disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Select name="location" required disabled={isLoading}>
            <SelectTrigger id="location">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="main-office">Main Office</SelectItem>
              <SelectItem value="branch-office">Branch Office</SelectItem>
              <SelectItem value="client-site">Client Site</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="start-time">Start Time</Label>
          <Input id="start-time" name="start-time" type="time" required disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-time">End Time</Label>
          <Input id="end-time" name="end-time" type="time" required disabled={isLoading} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Input
          id="notes"
          name="notes"
          placeholder="Any additional information about your schedule"
          disabled={isLoading}
        />
      </div>
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Saving..." : "Save Schedule"}
      </Button>
    </form>
  )
}

