import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  arrayUnion, 
  arrayRemove,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Team, TeamMember, TeamRole, Permission } from './team-management';

// Collection references
const teamsCollection = 'teams';
const invitesCollection = 'teamInvites';

// Create a new team
export async function createTeam(teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt' | 'members' | 'ownerId'>, creatorId: string): Promise<Team> {
  // Create a new document reference
  const teamRef = doc(collection(db, teamsCollection));
  
  const creator: TeamMember = {
    id: crypto.randomUUID(),
    userId: creatorId,
    name: teamData.members[0].name,
    avatar: teamData.members[0].avatar,
    role: TeamRole.OWNER,
    joinedAt: new Date()
  };
  
  const newTeam: Team = {
    id: teamRef.id,
    name: teamData.name,
    description: teamData.description,
    ownerId: creatorId,
    createdAt: new Date(),
    updatedAt: new Date(),
    members: [creator]
  };
  
  // Save to Firestore
  await setDoc(teamRef, {
    ...newTeam,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    members: newTeam.members.map(m => ({
      ...m,
      joinedAt: Timestamp.fromDate(m.joinedAt)
    }))
  });
  
  return newTeam;
}

// Get all teams a user belongs to
export async function getUserTeams(userId: string): Promise<Team[]> {
  const teamsQuery = query(
    collection(db, teamsCollection), 
    where('members', 'array-contains', { userId })
  );
  
  const querySnapshot = await getDocs(teamsQuery);
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      members: data.members.map(m => ({
        ...m,
        joinedAt: m.joinedAt.toDate()
      }))
    } as Team;
  });
}

// Get a single team by ID
export async function getTeam(teamId: string): Promise<Team | null> {
  const teamDoc = await getDoc(doc(db, teamsCollection, teamId));
  
  if (!teamDoc.exists()) {
    return null;
  }
  
  const data = teamDoc.data();
  return {
    ...data,
    id: teamDoc.id,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
    members: data.members.map(m => ({
      ...m,
      joinedAt: m.joinedAt.toDate()
    }))
  } as Team;
}

// Update team information
export async function updateTeam(teamId: string, teamData: Partial<Omit<Team, 'id' | 'createdAt' | 'updatedAt' | 'members' | 'ownerId'>>): Promise<void> {
  const teamRef = doc(db, teamsCollection, teamId);
  
  await updateDoc(teamRef, {
    ...teamData,
    updatedAt: serverTimestamp()
  });
}

// Delete a team
export async function deleteTeam(teamId: string): Promise<void> {
  await deleteDoc(doc(db, teamsCollection, teamId));
}

// Add a member to a team
export async function addTeamMember(teamId: string, member: Omit<TeamMember, 'id' | 'joinedAt'>): Promise<TeamMember> {
  const teamRef = doc(db, teamsCollection, teamId);
  
  const newMember: TeamMember = {
    ...member,
    id: crypto.randomUUID(),
    joinedAt: new Date()
  };
  
  await updateDoc(teamRef, {
    members: arrayUnion({
      ...newMember,
      joinedAt: Timestamp.fromDate(newMember.joinedAt)
    }),
    updatedAt: serverTimestamp()
  });
  
  return newMember;
}

// Remove a member from a team
export async function removeTeamMember(teamId: string, memberId: string): Promise<void> {
  const team = await getTeam(teamId);
  if (!team) throw new Error("Team not found");
  
  const memberToRemove = team.members.find(m => m.id === memberId);
  if (!memberToRemove) throw new Error("Member not found in team");
  
  const teamRef = doc(db, teamsCollection, teamId);
  
  await updateDoc(teamRef, {
    members: arrayRemove(memberToRemove),
    updatedAt: serverTimestamp()
  });
}

// Update a member's role in a team
export async function updateMemberRole(teamId: string, memberId: string, newRole: TeamRole): Promise<void> {
  const team = await getTeam(teamId);
  if (!team) throw new Error("Team not found");
  
  const memberIndex = team.members.findIndex(m => m.id === memberId);
  if (memberIndex === -1) throw new Error("Member not found in team");
  
  // Cannot change the owner's role to anything other than owner
  if (team.members[memberIndex].userId === team.ownerId && newRole !== TeamRole.OWNER) {
    throw new Error("Cannot change the owner's role");
  }
  
  // Update the member's role
  team.members[memberIndex].role = newRole;
  
  const teamRef = doc(db, teamsCollection, teamId);
  
  await updateDoc(teamRef, {
    members: team.members.map(m => ({
      ...m,
      joinedAt: Timestamp.fromDate(m.joinedAt)
    })),
    updatedAt: serverTimestamp()
  });
}

// Create an invite to join a team
export async function createTeamInvite(teamId: string, email: string, role: TeamRole, inviterId: string): Promise<string> {
  const inviteRef = doc(collection(db, invitesCollection));
  
  const invite = {
    id: inviteRef.id,
    teamId,
    email,
    role,
    inviterId,
    createdAt: serverTimestamp(),
    expires: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days expiry
    status: 'pending'
  };
  
  await setDoc(inviteRef, invite);
  
  return inviteRef.id;
}

// Accept a team invitation
export async function acceptTeamInvite(inviteId: string, userId: string, userName: string, avatar?: string): Promise<Team | null> {
  const inviteRef = doc(db, invitesCollection, inviteId);
  const inviteDoc = await getDoc(inviteRef);
  
  if (!inviteDoc.exists()) {
    throw new Error("Invite not found");
  }
  
  const invite = inviteDoc.data();
  
  // Check if invite is still valid
  if (invite.status !== 'pending' || invite.expires.toDate() < new Date()) {
    throw new Error("Invite is no longer valid");
  }
  
  // Add member to team
  const newMember = await addTeamMember(invite.teamId, {
    userId,
    name: userName,
    avatar,
    role: invite.role
  });
  
  // Update invite status
  await updateDoc(inviteRef, {
    status: 'accepted',
    acceptedAt: serverTimestamp(),
    acceptedBy: userId
  });
  
  // Return the team
  return getTeam(invite.teamId);
} 