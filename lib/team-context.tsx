"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth-context";
import { Team, TeamRole, Permission, canUserPerformAction } from "./team-management";
import * as TeamService from "./team-service";

// Define the shape of the team context
interface TeamContextType {
  teams: Team[];
  loadingTeams: boolean;
  selectedTeamId: string | null;
  selectTeam: (teamId: string | null) => void;
  createTeam: (teamData: any) => Promise<Team>;
  updateTeam: (teamId: string, teamData: any) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  inviteMember: (teamId: string, email: string, role: TeamRole) => Promise<string>;
  removeMember: (teamId: string, memberId: string) => Promise<void>;
  updateMemberRole: (teamId: string, memberId: string, role: TeamRole) => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  refreshTeams: () => Promise<void>;
}

// Create the team context
const TeamContext = createContext<TeamContextType | undefined>(undefined);

// Team provider component
export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Function to load teams for the current user
  const loadTeams = async () => {
    if (!user) {
      setTeams([]);
      setLoadingTeams(false);
      return;
    }

    try {
      setLoadingTeams(true);
      const userTeams = await TeamService.getUserTeams(user.uid);
      setTeams(userTeams);
      
      // Auto-select the first team if none is selected
      if (!selectedTeamId && userTeams.length > 0) {
        setSelectedTeamId(userTeams[0].id);
      }
    } catch (error) {
      console.error("Error loading teams:", error);
    } finally {
      setLoadingTeams(false);
    }
  };

  // Load teams when the user changes
  useEffect(() => {
    if (isAuthenticated) {
      loadTeams();
    } else {
      setTeams([]);
      setSelectedTeamId(null);
      setLoadingTeams(false);
    }
  }, [isAuthenticated, user]);

  // Function to select a team
  const selectTeam = (teamId: string | null) => {
    setSelectedTeamId(teamId);
  };

  // Function to create a new team
  const createTeam = async (teamData: any): Promise<Team> => {
    if (!user) throw new Error("User must be authenticated to create a team");
    
    const newTeam = await TeamService.createTeam(
      {
        name: teamData.name,
        description: teamData.description || "",
      },
      user.uid
    );
    
    // Refresh teams
    await loadTeams();
    
    return newTeam;
  };

  // Function to update a team
  const updateTeam = async (teamId: string, teamData: any): Promise<void> => {
    if (!user) throw new Error("User must be authenticated to update a team");
    
    // Check permission
    const team = teams.find(t => t.id === teamId);
    if (!team) throw new Error("Team not found");
    
    if (!canUserPerformAction(user.uid, team, Permission.EDIT_TEAM)) {
      throw new Error("You don't have permission to update this team");
    }
    
    await TeamService.updateTeam(teamId, teamData);
    
    // Refresh teams
    await loadTeams();
  };

  // Function to delete a team
  const deleteTeam = async (teamId: string): Promise<void> => {
    if (!user) throw new Error("User must be authenticated to delete a team");
    
    // Check permission
    const team = teams.find(t => t.id === teamId);
    if (!team) throw new Error("Team not found");
    
    if (!canUserPerformAction(user.uid, team, Permission.DELETE_TEAM)) {
      throw new Error("You don't have permission to delete this team");
    }
    
    await TeamService.deleteTeam(teamId);
    
    // Refresh teams and reset selected team if needed
    await loadTeams();
    if (selectedTeamId === teamId) {
      setSelectedTeamId(null);
    }
  };

  // Function to invite a member to a team
  const inviteMember = async (teamId: string, email: string, role: TeamRole): Promise<string> => {
    if (!user) throw new Error("User must be authenticated to invite members");
    
    // Check permission
    const team = teams.find(t => t.id === teamId);
    if (!team) throw new Error("Team not found");
    
    if (!canUserPerformAction(user.uid, team, Permission.ADD_MEMBER)) {
      throw new Error("You don't have permission to invite members to this team");
    }
    
    return await TeamService.createTeamInvite(teamId, email, role, user.uid);
  };

  // Function to remove a member from a team
  const removeMember = async (teamId: string, memberId: string): Promise<void> => {
    if (!user) throw new Error("User must be authenticated to remove members");
    
    // Check permission
    const team = teams.find(t => t.id === teamId);
    if (!team) throw new Error("Team not found");
    
    if (!canUserPerformAction(user.uid, team, Permission.REMOVE_MEMBER)) {
      throw new Error("You don't have permission to remove members from this team");
    }
    
    // Cannot remove the owner
    const memberToRemove = team.members.find(m => m.id === memberId);
    if (memberToRemove?.userId === team.ownerId) {
      throw new Error("Cannot remove the team owner");
    }
    
    await TeamService.removeTeamMember(teamId, memberId);
    
    // Refresh teams
    await loadTeams();
  };

  // Function to update a member's role
  const updateMemberRole = async (teamId: string, memberId: string, role: TeamRole): Promise<void> => {
    if (!user) throw new Error("User must be authenticated to update member roles");
    
    // Check permission
    const team = teams.find(t => t.id === teamId);
    if (!team) throw new Error("Team not found");
    
    if (!canUserPerformAction(user.uid, team, Permission.CHANGE_ROLE)) {
      throw new Error("You don't have permission to change roles in this team");
    }
    
    await TeamService.updateMemberRole(teamId, memberId, role);
    
    // Refresh teams
    await loadTeams();
  };

  // Check if the current user has a specific permission in the selected team
  const hasPermission = (permission: Permission): boolean => {
    if (!user || !selectedTeamId) return false;
    
    const selectedTeam = teams.find(t => t.id === selectedTeamId);
    if (!selectedTeam) return false;
    
    return canUserPerformAction(user.uid, selectedTeam, permission);
  };

  // Function to manually refresh teams
  const refreshTeams = async (): Promise<void> => {
    await loadTeams();
  };

  const value = {
    teams,
    loadingTeams,
    selectedTeamId,
    selectTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    inviteMember,
    removeMember,
    updateMemberRole,
    hasPermission,
    refreshTeams
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

// Custom hook to use the team context
export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error("useTeam must be used within a TeamProvider");
  }
  return context;
} 