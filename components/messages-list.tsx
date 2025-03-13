"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Mock data for messages
const mockMessages = [
  {
    id: "1",
    teamId: "1",
    sender: {
      id: "2",
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "I'll be working remotely tomorrow due to the transportation strike.",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    teamId: "1",
    sender: {
      id: "3",
      name: "Mike Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "I've updated my schedule for next week. I'll be in the office Monday through Wednesday.",
    timestamp: "Yesterday",
  },
  {
    id: "3",
    teamId: "2",
    sender: {
      id: "4",
      name: "Sarah Williams",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "Team meeting has been moved to 2 PM tomorrow. Please update your schedules.",
    timestamp: "2 days ago",
  },
]

export function MessagesList() {
  const [messages, setMessages] = useState(mockMessages)
  const [newMessage, setNewMessage] = useState("")
  const [activeTeam, setActiveTeam] = useState("all")
  const [isLoading, setIsLoading] = useState(false)

  const filteredMessages = activeTeam === "all" ? messages : messages.filter((message) => message.teamId === activeTeam)

  async function handleSendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!newMessage.trim()) return

    setIsLoading(true)

    try {
      // In a real app, you would call your API to send the message
      // const response = await fetch("/api/messages", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     teamId: activeTeam === "all" ? "1" : activeTeam,
      //     content: newMessage
      //   }),
      // })

      // if (!response.ok) throw new Error("Failed to send message")

      // Simulate API response
      const newMessageObj = {
        id: `${messages.length + 1}`,
        teamId: activeTeam === "all" ? "1" : activeTeam,
        sender: {
          id: "1",
          name: "John Doe",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        content: newMessage,
        timestamp: "Just now",
      }

      setMessages([newMessageObj, ...messages])
      setNewMessage("")

      toast({
        title: "Message sent!",
        description: "Your message has been sent to the team.",
      })
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
      <Card>
        <CardHeader>
          <CardTitle>Team Messages</CardTitle>
          <CardDescription>Communicate schedule changes with your team</CardDescription>
          <Tabs defaultValue="all" value={activeTeam} onValueChange={setActiveTeam} className="mt-2">
            <TabsList>
              <TabsTrigger value="all">All Teams</TabsTrigger>
              <TabsTrigger value="1">Development</TabsTrigger>
              <TabsTrigger value="2">Design</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>

            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {filteredMessages.length > 0 ? (
                filteredMessages.map((message) => (
                  <div key={message.id} className="flex gap-3 p-3 rounded-lg border">
                    <Avatar>
                      <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                      <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{message.sender.name}</p>
                        <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                      </div>
                      <p className="text-sm mt-1">{message.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">No messages yet. Start the conversation!</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

