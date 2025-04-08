"use client";

import { useState } from "react";
import { useTeam } from "@/lib/team-context";
import { TeamRole } from "@/lib/team-management";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { Permission } from "@/lib/team-management";

interface InviteMemberDialogProps {
  teamId: string;
  teamName: string;
}

export function InviteMemberDialog({ teamId, teamName }: InviteMemberDialogProps) {
  const { inviteMember, hasPermission } = useTeam();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>(TeamRole.MEMBER);

  const canInviteMembers = hasPermission(Permission.ADD_MEMBER);

  if (!canInviteMembers) {
    return null; // No mostrar el botón si no tiene permisos
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "El correo electrónico es obligatorio",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      await inviteMember(teamId, email.trim(), role);
      
      toast({
        title: "Invitación enviada",
        description: `Se ha enviado una invitación a ${email} para unirse al equipo "${teamName}".`,
      });
      
      // Reset form and close dialog
      setEmail("");
      setRole(TeamRole.MEMBER);
      setOpen(false);
    } catch (error) {
      console.error("Error al invitar miembro:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar la invitación. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
          <span>Invitar miembro</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invitar a un nuevo miembro</DialogTitle>
          <DialogDescription>
            Enviar una invitación por correo electrónico para unirse al equipo "{teamName}".
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Rol en el equipo</Label>
            <Select 
              value={role} 
              onValueChange={(value) => setRole(value as TeamRole)}
              disabled={isLoading}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Roles de equipo</SelectLabel>
                  <SelectItem value={TeamRole.ADMIN}>Administrador</SelectItem>
                  <SelectItem value={TeamRole.MANAGER}>Gestor</SelectItem>
                  <SelectItem value={TeamRole.MEMBER}>Miembro</SelectItem>
                  <SelectItem value={TeamRole.GUEST}>Invitado</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-2">
              {role === TeamRole.ADMIN && "Puede gestionar miembros y editar el equipo"}
              {role === TeamRole.MANAGER && "Puede gestionar horarios y ver datos del equipo"}
              {role === TeamRole.MEMBER && "Puede ver datos del equipo y gestionar su propio horario"}
              {role === TeamRole.GUEST && "Solo puede ver datos limitados del equipo"}
            </p>
          </div>
          
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar invitación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 