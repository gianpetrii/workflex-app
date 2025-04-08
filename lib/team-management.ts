// Define the role levels and their permissions
export enum TeamRole {
  OWNER = 'owner',        // Can do everything, including delete the team
  ADMIN = 'admin',        // Can manage members and view all data
  MANAGER = 'manager',    // Can manage schedules and view team data
  MEMBER = 'member',      // Can view team data and manage own schedule
  GUEST = 'guest'         // Can only view limited team data
}

// Define the permissions available in the system
export enum Permission {
  VIEW_TEAM = 'view_team',
  EDIT_TEAM = 'edit_team',
  DELETE_TEAM = 'delete_team',
  ADD_MEMBER = 'add_member',
  REMOVE_MEMBER = 'remove_member',
  CHANGE_ROLE = 'change_role',
  VIEW_SCHEDULE = 'view_schedule',
  EDIT_SCHEDULE = 'edit_schedule',
  VIEW_MEMBER_DETAILS = 'view_member_details',
  VIEW_ANALYTICS = 'view_analytics'
}

// Define the role-permission mappings
export const rolePermissions = {
  [TeamRole.OWNER]: [
    Permission.VIEW_TEAM,
    Permission.EDIT_TEAM,
    Permission.DELETE_TEAM,
    Permission.ADD_MEMBER,
    Permission.REMOVE_MEMBER,
    Permission.CHANGE_ROLE,
    Permission.VIEW_SCHEDULE,
    Permission.EDIT_SCHEDULE,
    Permission.VIEW_MEMBER_DETAILS,
    Permission.VIEW_ANALYTICS
  ],
  [TeamRole.ADMIN]: [
    Permission.VIEW_TEAM,
    Permission.EDIT_TEAM,
    Permission.ADD_MEMBER,
    Permission.REMOVE_MEMBER,
    Permission.CHANGE_ROLE,
    Permission.VIEW_SCHEDULE,
    Permission.EDIT_SCHEDULE,
    Permission.VIEW_MEMBER_DETAILS,
    Permission.VIEW_ANALYTICS
  ],
  [TeamRole.MANAGER]: [
    Permission.VIEW_TEAM,
    Permission.VIEW_SCHEDULE,
    Permission.EDIT_SCHEDULE,
    Permission.VIEW_MEMBER_DETAILS,
    Permission.VIEW_ANALYTICS
  ],
  [TeamRole.MEMBER]: [
    Permission.VIEW_TEAM,
    Permission.VIEW_SCHEDULE,
    Permission.VIEW_MEMBER_DETAILS
  ],
  [TeamRole.GUEST]: [
    Permission.VIEW_TEAM,
    Permission.VIEW_SCHEDULE
  ]
};

// Types for team management
export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  role: TeamRole;
  joinedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  members: TeamMember[];
}

// Helper functions for team permissions
export function hasPermission(userRole: TeamRole, permission: Permission): boolean {
  return rolePermissions[userRole].includes(permission);
}

export function isTeamMember(userId: string, team: Team): boolean {
  return team.members.some(member => member.userId === userId);
}

export function getUserRole(userId: string, team: Team): TeamRole | null {
  const member = team.members.find(member => member.userId === userId);
  return member ? member.role : null;
}

export function canUserPerformAction(userId: string, team: Team, permission: Permission): boolean {
  const userRole = getUserRole(userId, team);
  if (!userRole) return false;
  
  return hasPermission(userRole, permission);
}

// Function to filter teams for a user based on their membership
export function getUserTeams(userId: string, allTeams: Team[]): Team[] {
  return allTeams.filter(team => isTeamMember(userId, team));
}

// Function to get all teams where user has a specific permission
export function getTeamsWithPermission(userId: string, allTeams: Team[], permission: Permission): Team[] {
  return allTeams.filter(team => {
    const userRole = getUserRole(userId, team);
    return userRole && hasPermission(userRole, permission);
  });
} 