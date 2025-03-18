"use client"

import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-4xl font-bold mb-4">404 - Página no encontrada</h1>
      <p className="text-xl mb-8">Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>
      <Link href="/team-schedule">
        <span className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
          Volver a la página principal
        </span>
      </Link>
    </div>
  )
} 