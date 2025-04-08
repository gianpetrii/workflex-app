"use client";

import { TeamList, TeamMembers } from "@/components/team-management";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTeam } from "@/lib/team-context";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function TeamManagementView() {
  const { isAuthenticated } = useAuth();
  const { selectedTeamId, teams } = useTeam();

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Shield className="h-20 w-20 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-bold mb-2">Acceso restringido</h2>
          <p className="text-muted-foreground max-w-md mb-4">
            Debes iniciar sesión para acceder a la gestión de equipos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gestión de equipos</h1>
        <p className="text-muted-foreground">
          Crea, gestiona y selecciona equipos para controlar quién tiene acceso a tu información.
        </p>
      </div>

      <Separator />

      <Tabs defaultValue="teams" className="space-y-4">
        <TabsList>
          <TabsTrigger value="teams">Equipos</TabsTrigger>
          <TabsTrigger value="members" disabled={!selectedTeamId}>Miembros</TabsTrigger>
          <TabsTrigger value="settings" disabled={!selectedTeamId}>Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="space-y-4">
          <TeamList />
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <TeamMembers />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <h3 className="text-lg font-medium">Próximamente</h3>
              <p className="text-muted-foreground">
                La configuración avanzada de equipos estará disponible en una futura actualización.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 