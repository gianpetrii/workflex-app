"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useTeam } from "@/lib/team-context"
import { Permission } from "@/lib/team-management"

export function TeamSelector({ teams, selectedTeams, onChange }) {
  const [open, setOpen] = useState(false)
  const { selectedTeamId, hasPermission } = useTeam();
  
  // Si hay un equipo seleccionado en el contexto y no tenemos permiso para ver otros equipos,
  // deshabilitar la selección de equipos
  const isDisabled = selectedTeamId && !hasPermission(Permission.VIEW_OTHER_TEAMS);
  
  // Sincronizar con el equipo seleccionado en el contexto
  useEffect(() => {
    if (selectedTeamId && isDisabled) {
      onChange(new Set([selectedTeamId]));
    }
  }, [selectedTeamId, isDisabled, onChange]);

  const handleSelectTeam = (teamId) => {
    // Si está deshabilitado, no permitir cambios
    if (isDisabled) return;
    
    let newSelection

    if (teamId === "all") {
      // If "All Teams" is selected, toggle between all and none
      newSelection = selectedTeams.has("all") ? new Set() : new Set(["all"])
    } else {
      newSelection = new Set(selectedTeams)

      if (newSelection.has(teamId)) {
        // Remove the team if it's already selected
        newSelection.delete(teamId)
        newSelection.delete("all") // Also remove "all" selection
      } else {
        // Add the team
        newSelection.add(teamId)

        // Check if all teams are now selected
        const allTeamsSelected = teams.every((team) => newSelection.has(team.id) || teamId === team.id)

        if (allTeamsSelected) {
          newSelection = new Set(["all"])
        }
      }
    }

    onChange(newSelection)
    setOpen(false)
  }

  const getSelectedTeamsLabel = () => {
    if (selectedTeams.has("all")) return "All Teams"
    if (selectedTeams.size === 0) return "No Teams Selected"
    if (selectedTeams.size === 1) {
      const teamId = Array.from(selectedTeams)[0]
      const team = teams.find((t) => t.id === teamId)
      return team ? team.name : "Unknown Team"
    }
    return `${selectedTeams.size} Teams Selected`
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          role="combobox" 
          aria-expanded={open} 
          className="w-[200px] justify-between"
          disabled={isDisabled}
        >
          {getSelectedTeamsLabel()}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search teams..." />
          <CommandList>
            <CommandEmpty>No team found.</CommandEmpty>
            <CommandGroup>
              {!isDisabled && (
                <CommandItem onSelect={() => handleSelectTeam("all")} className="flex items-center justify-between">
                  <span>All Teams</span>
                  {selectedTeams.has("all") && <Check className="h-4 w-4" />}
                </CommandItem>
              )}
              {teams.map((team) => (
                <CommandItem
                  key={team.id}
                  onSelect={() => handleSelectTeam(team.id)}
                  className="flex items-center justify-between"
                  disabled={isDisabled && team.id !== selectedTeamId}
                >
                  <span>{team.name}</span>
                  {(selectedTeams.has(team.id) || selectedTeams.has("all")) && <Check className="h-4 w-4" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

