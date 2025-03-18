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
  output: 'export',
  distDir: 'out',
  // Omitir las rutas API ya que no son compatibles con exportación estática
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig 