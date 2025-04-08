"use client";

import { useTeam } from "@/lib/team-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Edit, Trash2 } from "lucide-react";
import { TeamRole, Permission } from "@/lib/team-management";
import { CreateTeamDialog } from "./create-team-dialog";
import { InviteMemberDialog } from "./invite-member-dialog";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";

export function TeamList() {
  const { teams, loadingTeams, selectedTeamId, selectTeam, deleteTeam, hasPermission } = useTeam();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  if (loadingTeams) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">Tus equipos</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-60" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="flex items-center gap-2 p-2 rounded-md">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este equipo? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      setIsDeleting(teamId);
      await deleteTeam(teamId);
      toast({
        title: "Equipo eliminado",
        description: "El equipo ha sido eliminado con éxito.",
      });
    } catch (error) {
      console.error("Error al eliminar equipo:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el equipo. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const getRoleBadgeVariant = (role: TeamRole) => {
    switch (role) {
      case TeamRole.OWNER:
        return "default";
      case TeamRole.ADMIN:
        return "secondary";
      case TeamRole.MANAGER:
        return "outline";
      default:
        return "outline";
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

  const getUserRoleInTeam = (teamId: string) => {
    if (!user) return null;
    
    const team = teams.find(t => t.id === teamId);
    if (!team) return null;
    
    const member = team.members.find(m => m.userId === user.uid);
    return member ? member.role : null;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Tus equipos</h2>
        <CreateTeamDialog />
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No perteneces a ningún equipo</h3>
              <p className="text-muted-foreground mb-4">
                Crea un nuevo equipo para comenzar a colaborar con tus colegas.
              </p>
              <CreateTeamDialog />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {teams.map((team) => {
            const userRole = getUserRoleInTeam(team.id);
            const canEditTeam = hasPermission(Permission.EDIT_TEAM) && selectedTeamId === team.id;
            const canDeleteTeam = hasPermission(Permission.DELETE_TEAM) && selectedTeamId === team.id;
            
            return (
              <Card 
                key={team.id} 
                className={selectedTeamId === team.id ? "border-primary" : ""}
                onClick={() => selectTeam(team.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {team.name}
                  </CardTitle>
                  <CardDescription>{team.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Miembros del equipo ({team.members.length})</h4>
                      <div className="space-y-2">
                        {team.members.slice(0, 3).map((member) => (
                          <div key={member.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                            <Avatar>
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{member.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {getRoleLabel(member.role)}
                              </p>
                            </div>
                            <Badge variant={getRoleBadgeVariant(member.role)} className="ml-auto">
                              {getRoleLabel(member.role)}
                            </Badge>
                          </div>
                        ))}
                        
                        {team.members.length > 3 && (
                          <p className="text-xs text-center text-muted-foreground py-2">
                            + {team.members.length - 3} miembros más
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button 
                    variant={selectedTeamId === team.id ? "default" : "outline"}
                    className="w-full"
                    onClick={() => selectTeam(team.id)}
                  >
                    {selectedTeamId === team.id ? "Equipo seleccionado" : "Seleccionar equipo"}
                  </Button>
                  
                  {selectedTeamId === team.id && (
                    <div className="flex items-center gap-2">
                      {canEditTeam && (
                        <Button variant="outline" size="icon" onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implementar modal de edición de equipo
                          toast({
                            title: "Función no implementada",
                            description: "La edición de equipos estará disponible próximamente.",
                          });
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {canDeleteTeam && (
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTeam(team.id);
                          }}
                          disabled={isDeleting === team.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <InviteMemberDialog teamId={team.id} teamName={team.name} />
                    </div>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 