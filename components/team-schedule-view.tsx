"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, GripVertical, Users } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { TeamSelector } from "@/components/team-selector"

// Definir colores para cada ubicación
const locationColors = {
  "Office": "bg-blue-200",
  "Home": "bg-green-200",
  "Client Site": "bg-purple-200",
  "Co-working Space": "bg-amber-200",
  // Color por defecto para ubicaciones no especificadas
  "default": "bg-gray-200"
};

// Definir colores para la leyenda
const legendColors = {
  "Office": "bg-blue-200",
  "Home": "bg-green-200",
  "Client Site": "bg-purple-200",
  "Co-working Space": "bg-amber-200",
};

export function TeamScheduleView({ teams, userSchedule, onScheduleUpdate = null }) {
  const [selectedDay, setSelectedDay] = useState("Monday")
  const [selectedTeams, setSelectedTeams] = useState(new Set(["all"]))
  const [memberOrder, setMemberOrder] = useState([])
  const [scheduleData, setScheduleData] = useState({ userSchedule, teams })
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const hours = Array.from({ length: 14 }, (_, i) => i + 7) // 7 AM to 8 PM

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate receiving updates from other users
      const randomTeamIndex = Math.floor(Math.random() * teams.length)
      const randomTeam = teams[randomTeamIndex]
      const randomMemberIndex = Math.floor(Math.random() * randomTeam.members.length)
      const randomMember = randomTeam.members[randomMemberIndex]

      if (randomMember.schedule) {
        const randomScheduleIndex = Math.floor(Math.random() * randomMember.schedule.length)
        if (randomMember.schedule[randomScheduleIndex]) {
          // Randomly adjust the schedule by 30 minutes
          const updatedSchedule = [...randomMember.schedule]
          const timeChange = Math.random() > 0.5 ? 30 : -30

          const startTimeParts = updatedSchedule[randomScheduleIndex].startTime.split(":")
          const startHour = Number.parseInt(startTimeParts[0])
          const startMinute = Number.parseInt(startTimeParts[1])

          let newStartMinute = startMinute + timeChange
          let newStartHour = startHour

          if (newStartMinute >= 60) {
            newStartHour += 1
            newStartMinute -= 60
          } else if (newStartMinute < 0) {
            newStartHour -= 1
            newStartMinute += 60
          }

          if (newStartHour >= 7 && newStartHour < 20) {
            updatedSchedule[randomScheduleIndex] = {
              ...updatedSchedule[randomScheduleIndex],
              startTime: `${newStartHour.toString().padStart(2, "0")}:${newStartMinute.toString().padStart(2, "0")}`,
            }

            // Update the teams data
            const updatedTeams = [...teams]
            updatedTeams[randomTeamIndex].members[randomMemberIndex].schedule = updatedSchedule

            setScheduleData((prev) => ({
              ...prev,
              teams: updatedTeams,
            }))
          }
        }
      }
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [teams])

  const formatHour = (hour) => {
    return hour === 12 ? "12 PM" : hour < 12 ? `${hour} AM` : `${hour - 12} PM`
  }

  // Filter user schedule for the selected day
  const userDaySchedule = scheduleData.userSchedule.filter((slot) => slot.day === selectedDay)

  const getSelectedTeamMembers = useCallback(() => {
    if (selectedTeams.size === 0) return []
    if (selectedTeams.has("all")) {
      return scheduleData.teams.flatMap((team) => team.members.map((member) => ({ ...member, teamName: team.name })))
    }
    return scheduleData.teams
      .filter((team) => selectedTeams.has(team.id))
      .flatMap((team) => team.members.map((member) => ({ ...member, teamName: team.name })))
  }, [selectedTeams, scheduleData.teams])

  const orderedMembers = useMemo(() => {
    const selectedMembers = getSelectedTeamMembers()
    const orderedSelectedMembers = memberOrder
      .filter((id) => selectedMembers.some((member) => member.id === id))
      .map((id) => selectedMembers.find((member) => member.id === id))
    const newMembers = selectedMembers.filter((member) => !memberOrder.includes(member.id))
    return [
      { id: "you", name: "You", avatar: "/placeholder.svg?height=32&width=32", teamName: "Your Schedule" },
      ...orderedSelectedMembers,
      ...newMembers,
    ]
  }, [getSelectedTeamMembers, memberOrder])

  const onDragEnd = (result) => {
    if (!result.destination || result.draggableId === "you") return

    const items = Array.from(memberOrder)
    const sourceIndex = result.source.index - 1
    const destIndex = result.destination.index - 1

    if (sourceIndex < 0 || destIndex < 0) return

    if (items.length <= sourceIndex) {
      // This is a new item being ordered
      const newItem = result.draggableId
      items.splice(destIndex, 0, newItem)
    } else {
      // Reordering existing items
      const [reorderedItem] = items.splice(sourceIndex, 1)
      items.splice(destIndex, 0, reorderedItem)
    }

    setMemberOrder(items)
  }

  // Find all members who are working at the same location at the same time
  const findColocatedMembers = useCallback(
    (day) => {
      const result = new Map()

      // First, add user's schedule
      userDaySchedule.forEach((slot) => {
        const key = `${slot.location}-${slot.startTime}-${slot.endTime}`
        if (!result.has(key)) {
          result.set(key, {
            location: slot.location,
            startTime: slot.startTime,
            endTime: slot.endTime,
            members: ["you"],
          })
        } else {
          result.get(key).members.push("you")
        }
      })

      // Then add team members' schedules
      getSelectedTeamMembers().forEach((member) => {
        const memberSchedule = member.schedule?.filter((slot) => slot.day === day) || []
        memberSchedule.forEach((slot) => {
          const key = `${slot.location}-${slot.startTime}-${slot.endTime}`
          if (!result.has(key)) {
            result.set(key, {
              location: slot.location,
              startTime: slot.startTime,
              endTime: slot.endTime,
              members: [member.id],
            })
          } else {
            result.get(key).members.push(member.id)
          }
        })
      })

      // Filter to only include slots with multiple members
      return Array.from(result.values()).filter((item) => item.members.length > 1)
    },
    [userDaySchedule, getSelectedTeamMembers],
  )

  const colocatedMembers = useMemo(() => findColocatedMembers(selectedDay), [findColocatedMembers, selectedDay])

  // Obtener ubicaciones únicas para la leyenda
  const uniqueLocations = useMemo(() => {
    const locations = new Set();
    
    // Agregar ubicaciones del usuario
    userSchedule.forEach(slot => locations.add(slot.location));
    
    // Agregar ubicaciones de los miembros del equipo
    teams.forEach(team => {
      team.members.forEach(member => {
        if (member.schedule) {
          member.schedule.forEach(slot => locations.add(slot.location));
        }
      });
    });
    
    return Array.from(locations);
  }, [userSchedule, teams]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4 relative z-50 bg-white">
        <Tabs defaultValue={selectedDay} onValueChange={setSelectedDay} className="w-full md:w-auto">
          <TabsList className="w-full md:w-auto justify-start overflow-auto">
            {days.map((day) => (
              <TabsTrigger key={day} value={day} className="min-w-[100px]">
                {day}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <TeamSelector teams={scheduleData.teams} selectedTeams={selectedTeams} onChange={setSelectedTeams} />
      </div>

      {/* Leyenda de ubicaciones */}
      <div className="p-4 bg-gray-50 rounded-lg mb-4 relative z-40">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(legendColors).map(([location, colorClass]) => (
            <div key={location} className="flex items-center gap-2">
              <div className={`w-4 h-4 ${colorClass} rounded-sm`}></div>
              <span className="text-sm">{location}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-[1fr] gap-2">
            {/* Schedule grid */}
            <div className="col-span-1 relative">
              {/* Vertical time slot lines */}
              <div className="absolute inset-y-0 left-0 right-0 grid grid-cols-14 pointer-events-none">
                {hours.map((_, index) => (
                  <div key={index} className="border-l border-dashed border-gray-200 h-full"></div>
                ))}
              </div>

              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="team-members" isDropDisabled={false}>
                  {(provided, snapshot) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {/* Team member rows */}
                      {orderedMembers.map((member, index) => (
                        <Draggable
                          key={member.id}
                          draggableId={member.id}
                          index={index}
                          isDragDisabled={member.id === "you"}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`relative border-b last:border-b-0 ${snapshot.isDragging ? "bg-gray-50 shadow-md rounded-md z-30" : ""}`}
                            >
                              <div className="h-10 flex items-center gap-2 pl-2">
                                <div {...provided.dragHandleProps} className="cursor-move">
                                  <GripVertical className="h-4 w-4 text-gray-400" />
                                </div>
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={member.avatar} alt={member.name} />
                                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-sm">{member.name}</span>
                                <Badge variant="outline" className="ml-2">
                                  {member.teamName}
                                </Badge>
                              </div>

                              <div className="relative h-16">
                                {/* Schedule blocks */}
                                {member.id === "you"
                                  ? // User's schedule
                                    userDaySchedule.map((slot, index) => (
                                      <ScheduleBlock
                                        key={index}
                                        slot={slot}
                                        isUser={true}
                                        colocatedMembers={colocatedMembers}
                                      />
                                    ))
                                  : // Team member's schedule
                                    member.schedule
                                      ?.filter((slot) => slot.day === selectedDay)
                                      .map((slot, index) => (
                                        <ScheduleBlock
                                          key={index}
                                          slot={slot}
                                          isUser={false}
                                          overlappingSlots={findOverlappingSlots(slot, userDaySchedule)}
                                          colocatedMembers={colocatedMembers}
                                          memberId={member.id}
                                        />
                                      ))}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScheduleBlock({ slot, isUser, overlappingSlots, colocatedMembers, memberId }) {
  const startHour = Number.parseInt(slot.startTime.split(":")[0])
  const startMinute = Number.parseInt(slot.startTime.split(":")[1])
  const endHour = Number.parseInt(slot.endTime.split(":")[0])
  const endMinute = Number.parseInt(slot.endTime.split(":")[1])

  const startPosition = (startHour - 7) * (100 / 14) // percentage position
  const duration = (((endHour - startHour) * 60 + (endMinute - startMinute)) / 60) * (100 / 14) // percentage width

  const getBackgroundColor = () => {
    // Usar el color correspondiente a la ubicación
    return locationColors[slot.location] || locationColors.default;
  }

  // Check if this slot has co-located members
  const isColocated = colocatedMembers?.some((item) => {
    const id = isUser ? "you" : memberId
    return (
      item.location === slot.location &&
      item.startTime === slot.startTime &&
      item.endTime === slot.endTime &&
      item.members.includes(id) &&
      item.members.length > 1
    )
  })

  return (
    <div
      className={`absolute top-1 bottom-1 ${getBackgroundColor()} rounded-sm overflow-hidden group`}
      style={{
        left: `${startPosition}%`,
        width: `${duration}%`,
      }}
    >
      <div className="p-1 relative z-10">
        <div className="text-xs font-medium truncate">
          {slot.startTime} - {slot.endTime}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{slot.location}</span>
          {isColocated && (
            <Badge
              variant="outline"
              className="ml-auto bg-white text-black group-hover:opacity-100 opacity-90 transition-opacity"
              style={{ zIndex: 20 }}
            >
              <Users className="h-3 w-3 mr-1" />
              <span className="text-[10px]">Co-located</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Overlapping time indicator con opacidad del 30% */}
      {overlappingSlots &&
        overlappingSlots.map((overlapSlot, index) => {
          const overlapStartHour = Number.parseInt(overlapSlot.startTime.split(":")[0])
          const overlapStartMinute = Number.parseInt(overlapSlot.startTime.split(":")[1])
          const overlapEndHour = Number.parseInt(overlapSlot.endTime.split(":")[0])
          const overlapEndMinute = Number.parseInt(overlapSlot.endTime.split(":")[1])

          const overlapStartPosition =
            (((overlapStartHour - startHour) * 60 + (overlapStartMinute - startMinute)) /
              ((endHour - startHour) * 60 + (endMinute - startMinute))) *
            100
          const overlapDuration =
            (((overlapEndHour - overlapStartHour) * 60 + (overlapEndMinute - overlapStartMinute)) /
              ((endHour - startHour) * 60 + (endMinute - startMinute))) *
            100

          return (
            <div
              key={index}
              className="absolute inset-0 bg-black opacity-30" // Cambiado a color negro con 30% de opacidad
              style={{
                left: `${overlapStartPosition}%`,
                width: `${overlapDuration}%`,
                zIndex: 5 // Asegurar que esté por encima del fondo pero por debajo del contenido
              }}
            />
          )
        })}
    </div>
  )
}

function findOverlappingSlots(slot, userSchedule) {
  return userSchedule
    .filter((userSlot) => {
      const slotStart =
        Number.parseInt(slot.startTime.split(":")[0]) * 60 + Number.parseInt(slot.startTime.split(":")[1])
      const slotEnd = Number.parseInt(slot.endTime.split(":")[0]) * 60 + Number.parseInt(slot.endTime.split(":")[1])
      const userStart =
        Number.parseInt(userSlot.startTime.split(":")[0]) * 60 + Number.parseInt(userSlot.startTime.split(":")[1])
      const userEnd =
        Number.parseInt(userSlot.endTime.split(":")[0]) * 60 + Number.parseInt(userSlot.endTime.split(":")[1])

      return slotStart < userEnd && slotEnd > userStart
    })
    .map((overlapSlot) => {
      const slotStart =
        Number.parseInt(slot.startTime.split(":")[0]) * 60 + Number.parseInt(slot.startTime.split(":")[1])
      const slotEnd = Number.parseInt(slot.endTime.split(":")[0]) * 60 + Number.parseInt(slot.endTime.split(":")[1])
      const userStart =
        Number.parseInt(overlapSlot.startTime.split(":")[0]) * 60 + Number.parseInt(overlapSlot.startTime.split(":")[1])
      const userEnd =
        Number.parseInt(overlapSlot.endTime.split(":")[0]) * 60 + Number.parseInt(overlapSlot.endTime.split(":")[1])

      const overlapStart = Math.max(slotStart, userStart)
      const overlapEnd = Math.min(slotEnd, userEnd)

      return {
        startTime: `${Math.floor(overlapStart / 60)
          .toString()
          .padStart(2, "0")}:${(overlapStart % 60).toString().padStart(2, "0")}`,
        endTime: `${Math.floor(overlapEnd / 60)
          .toString()
          .padStart(2, "0")}:${(overlapEnd % 60).toString().padStart(2, "0")}`,
      }
    })
}

