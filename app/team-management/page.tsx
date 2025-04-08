"use client";

import { TeamManagementView } from "@/components/team-management-view";
import { ProtectedRoute } from "@/components/protected-route";

export default function TeamManagementPage() {
  return (
    <ProtectedRoute>
      <main className="container py-6 max-w-6xl">
        <TeamManagementView />
      </main>
    </ProtectedRoute>
  );
} 