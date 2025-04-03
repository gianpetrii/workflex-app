# Instrucciones de Implementación - WorkFlex App

Este documento proporciona instrucciones para implementar la versión estática de WorkFlex App en varios servicios de hosting.

## Contenido del paquete de implementación

El archivo `workflex-app-dist.zip` contiene:
- Archivos HTML estáticos
- Archivos JavaScript y CSS necesarios
- Recursos como imágenes e iconos
- Archivo 404.html para manejar rutas no encontradas

## Opciones de implementación

### 1. Vercel (Recomendado)

1. Crea una cuenta en [Vercel](https://vercel.com) si aún no tienes una
2. Instala la CLI de Vercel: `npm i -g vercel`
3. Ejecuta `vercel login` y sigue las instrucciones
4. Ejecuta `vercel --prod` en la carpeta raíz del proyecto
5. Vercel detectará automáticamente que es un proyecto Next.js y lo implementará correctamente

### 2. Netlify

1. Crea una cuenta en [Netlify](https://netlify.com) si aún no tienes una
2. Desde el dashboard de Netlify, haz clic en "Add new site" > "Import an existing project"
3. Arrastra y suelta la carpeta `out` o el archivo ZIP `workflex-app-dist.zip`
4. Configura las siguientes opciones:
   - Build command: (dejar en blanco, ya está construido)
   - Publish directory: (dejar en blanco si se subió el ZIP, o especificar "out" si se subió la carpeta)
5. Haz clic en "Deploy site"
6. Configura una regla de redirección en Netlify:
   - Ir a Site settings > Domain management > Custom domains
   - Añadir un archivo `_redirects` con el contenido: `/* /index.html 200`

### 3. Firebase Hosting

1. Instala Firebase CLI: `npm install -g firebase-tools`
2. Ejecuta `firebase login` y sigue las instrucciones
3. Ejecuta `firebase init hosting` y selecciona tu proyecto
4. Cuando se te pregunte por el directorio público, especifica `out`
5. Configura las redirecciones en `firebase.json`:
```json
{
  "hosting": {
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```
6. Ejecuta `firebase deploy --only hosting`

### 4. GitHub Pages

1. Crea un nuevo repositorio en GitHub
2. Sube el contenido de la carpeta `out` al repositorio
3. En la configuración del repositorio, habilita GitHub Pages
4. Selecciona la rama main como fuente
5. Agrega un archivo `.nojekyll` vacío en la raíz para evitar el procesamiento de Jekyll
6. Configura el dominio personalizado si es necesario

## Consideraciones importantes

- Esta es una versión estática sin API routes funcionales. Para integrar APIs, considera:
  1. Implementar las APIs como funciones serverless (Firebase Functions, AWS Lambda, etc.)
  2. Actualizar el middleware.ts para redirigir las solicitudes API a las funciones serverless
  3. Modificar los servicios en el frontend para apuntar a las URLs correctas de API

- Para entornos de desarrollo, restaura la configuración original:
  1. Renombra la carpeta `_api` a `api` (si la cambiaste)
  2. Restaura el middleware.ts a su configuración original

## Solución de problemas

- **Error 404 en rutas de cliente**: Asegúrate de que el servicio de hosting esté configurado para redirigir todas las rutas a index.html
- **No se cargan los recursos estáticos**: Verifica las rutas base en `next.config.js`
- **Problemas con API routes**: Recuerda que esta es una versión estática, las API routes necesitan ser implementadas como funciones serverless separadas

Para más información, consulta la [documentación de Next.js sobre implementación estática](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports). 