"use client";

import { useState } from "react";
import { useTeam } from "@/lib/team-context";
import { useAuth } from "@/lib/auth-context";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";

export function CreateTeamDialog() {
  const { createTeam } = useTeam();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear un equipo",
        variant: "destructive",
      });
      return;
    }
    
    if (!teamName.trim()) {
      toast({
        title: "Error",
        description: "El nombre del equipo es obligatorio",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const newTeam = await createTeam({
        name: teamName.trim(),
        description: teamDescription.trim(),
        members: [{
          name: user.displayName || "Usuario",
          avatar: user.photoURL || undefined,
        }]
      });
      
      toast({
        title: "Equipo creado",
        description: `El equipo "${newTeam.name}" ha sido creado con éxito.`,
      });
      
      // Reset form and close dialog
      setTeamName("");
      setTeamDescription("");
      setOpen(false);
    } catch (error) {
      console.error("Error al crear equipo:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el equipo. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          <span>Crear equipo</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear nuevo equipo</DialogTitle>
          <DialogDescription>
            Crea un nuevo equipo para colaborar con tus colegas.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="team-name">Nombre del equipo</Label>
            <Input
              id="team-name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Ej. Equipo de Desarrollo"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="team-description">Descripción</Label>
            <Input
              id="team-description"
              value={teamDescription}
              onChange={(e) => setTeamDescription(e.target.value)}
              placeholder="Breve descripción del equipo"
              disabled={isLoading}
            />
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
              {isLoading ? "Creando..." : "Crear equipo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 