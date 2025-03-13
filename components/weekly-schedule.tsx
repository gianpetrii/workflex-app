"use client"
import { MapPin } from "lucide-react"

export function WeeklySchedule({ scheduleData, onScheduleClick, onAddSchedule }) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const hours = Array.from({ length: 14 }, (_, i) => i + 7) // 7 AM to 8 PM

  // Group schedule data by day and time
  const scheduleByDay = days.reduce((acc, day) => {
    acc[day] = scheduleData.filter((slot) => slot.day === day)
    return acc
  }, {})

  const formatHour = (hour) => {
    return hour === 12 ? "12 PM" : hour < 12 ? `${hour} AM` : `${hour - 12} PM`
  }

  const handleBackgroundClick = (day, hour) => {
    const startTime = `${hour.toString().padStart(2, "0")}:00`
    const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`
    onAddSchedule({ day, startTime, endTime, location: "Office" })
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-8 gap-2">
          {/* Time column */}
          <div className="col-span-1">
            <div className="h-10"></div> {/* Empty cell for alignment */}
            {hours.map((hour) => (
              <div key={hour} className="h-16 flex items-center justify-end pr-2 text-sm text-muted-foreground">
                {formatHour(hour)}
              </div>
            ))}
          </div>

          {/* Days columns */}
          {days.map((day) => (
            <div key={day} className="col-span-1">
              <div className="h-10 flex items-center justify-center font-medium border-b">{day}</div>
              <div className="relative">
                {hours.map((hour) => (
                  <div
                    key={`${day}-${hour}`}
                    className="h-16 border-b border-dashed cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleBackgroundClick(day, hour)}
                  ></div>
                ))}

                {/* Schedule slots */}
                {scheduleByDay[day]?.map((slot, index) => {
                  const startHour = Number.parseInt(slot.startTime.split(":")[0])
                  const startMinute = Number.parseInt(slot.startTime.split(":")[1])
                  const endHour = Number.parseInt(slot.endTime.split(":")[0])
                  const endMinute = Number.parseInt(slot.endTime.split(":")[1])

                  const startPosition = (startHour - 7) * 64 + (startMinute / 60) * 64
                  const duration = (((endHour - startHour) * 60 + (endMinute - startMinute)) / 60) * 64

                  return (
                    <div
                      key={index}
                      className="absolute left-1 right-1 bg-blue-100 border border-blue-300 rounded p-1 overflow-hidden cursor-pointer hover:bg-blue-200 transition-colors"
                      style={{
                        top: `${startPosition}px`,
                        height: `${duration}px`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onScheduleClick(slot)
                      }}
                    >
                      <div className="text-xs font-medium truncate">
                        {slot.startTime} - {slot.endTime}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{slot.location}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

