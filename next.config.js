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
}

module.exports = nextConfig 