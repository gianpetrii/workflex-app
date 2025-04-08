"use client";

import { useTeam } from "@/lib/team-context";
import { useAuth } from "@/lib/auth-context";
import { TeamRole, Permission } from "@/lib/team-management";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { UserMinus, Shield } from "lucide-react";
import { useState } from "react";
import { InviteMemberDialog } from "./invite-member-dialog";

export function TeamMembers() {
  const { teams, selectedTeamId, loadingTeams, hasPermission, updateMemberRole, removeMember } = useTeam();
  const { user } = useAuth();
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [removingMember, setRemovingMember] = useState<string | null>(null);

  // Encuentra el equipo seleccionado
  const selectedTeam = selectedTeamId 
    ? teams.find(team => team.id === selectedTeamId) 
    : null;

  if (loadingTeams) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-60" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedTeam) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Miembros del equipo</CardTitle>
          <CardDescription>
            Selecciona un equipo para ver sus miembros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Shield className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Equipo no seleccionado</h3>
            <p className="text-muted-foreground max-w-md">
              Selecciona un equipo de la lista para ver y gestionar sus miembros.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const canChangeRoles = hasPermission(Permission.CHANGE_ROLE);
  const canRemoveMembers = hasPermission(Permission.REMOVE_MEMBER);

  const handleRoleChange = async (memberId: string, newRole: TeamRole) => {
    try {
      setUpdatingRole(memberId);
      await updateMemberRole(selectedTeamId, memberId, newRole);
      toast({
        title: "Rol actualizado",
        description: "El rol del miembro ha sido actualizado con éxito.",
      });
    } catch (error) {
      console.error("Error al actualizar rol:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    // No permitir que el usuario se elimine a sí mismo
    const member = selectedTeam.members.find(m => m.id === memberId);
    if (member?.userId === user?.uid) {
      toast({
        title: "Operación no permitida",
        description: "No puedes eliminarte a ti mismo del equipo.",
        variant: "destructive",
      });
      return;
    }
    
    if (!confirm("¿Estás seguro de que deseas eliminar a este miembro del equipo?")) {
      return;
    }

    try {
      setRemovingMember(memberId);
      await removeMember(selectedTeamId, memberId);
      toast({
        title: "Miembro eliminado",
        description: "El miembro ha sido eliminado del equipo con éxito.",
      });
    } catch (error) {
      console.error("Error al eliminar miembro:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar al miembro. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setRemovingMember(null);
    }
  };

  const getRoleLabel = (role: TeamRole) => {
    switch (role) {
      case TeamRole.OWNER:
        return "Propietario";
      case TeamRole.ADMIN:
        return "Administrador";
      case TeamRole.MANAGER:
        return "Gestor";
      case TeamRole.MEMBER:
        return "Miembro";
      case TeamRole.GUEST:
        return "Invitado";
      default:
        return role;
    }
  };

  // Identifica si el usuario actual es el propietario o no
  const isOwner = selectedTeam.members.some(
    m => m.userId === user?.uid && m.role === TeamRole.OWNER
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Miembros del equipo</CardTitle>
          <CardDescription>
            Gestiona los miembros de {selectedTeam.name}
          </CardDescription>
        </div>
        <InviteMemberDialog teamId={selectedTeam.id} teamName={selectedTeam.name} />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {selectedTeam.members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay miembros en este equipo.
            </div>
          ) : (
            selectedTeam.members.map((member) => {
              // Determinar si este miembro es el propietario
              const isThisOwner = member.role === TeamRole.OWNER;
              // Determinar si este miembro es el usuario actual
              const isCurrentUser = member.userId === user?.uid;
              
              return (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <Avatar>
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {member.name} {isCurrentUser && "(Tú)"}
                      </p>
                      {isThisOwner && (
                        <Badge variant="default" className="text-xs">Propietario</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Se unió el {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {/* Selector de rol - Solo visible si el usuario puede cambiar roles y no es el propietario */}
                  {canChangeRoles && !isThisOwner && (
                    <Select 
                      value={member.role} 
                      onValueChange={(value) => handleRoleChange(member.id, value as TeamRole)}
                      disabled={updatingRole === member.id || removingMember === member.id}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Selecciona rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Rol</SelectLabel>
                          <SelectItem value={TeamRole.ADMIN}>Administrador</SelectItem>
                          <SelectItem value={TeamRole.MANAGER}>Gestor</SelectItem>
                          <SelectItem value={TeamRole.MEMBER}>Miembro</SelectItem>
                          <SelectItem value={TeamRole.GUEST}>Invitado</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                  
                  {/* Badge de rol (mostrado cuando no se puede cambiar) */}
                  {(!canChangeRoles || isThisOwner) && (
                    <Badge variant="outline" className="ml-auto">
                      {getRoleLabel(member.role)}
                    </Badge>
                  )}
                  
                  {/* Botón para eliminar miembro */}
                  {canRemoveMembers && !isThisOwner && !isCurrentUser && (
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={updatingRole === member.id || removingMember === member.id}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
} 