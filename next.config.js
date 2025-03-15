/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Desactivar la verificación de ESLint durante la compilación
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Desactivar la verificación de TypeScript durante la compilación
    ignoreBuildErrors: true,
  },
  // Eliminamos la configuración de exportación estática
}

module.exports = nextConfig 