# Umbral LIVE FX

Base inicial de la plataforma de experiencias interactivas para LIVE de UmbralCreepy. Esta etapa incluye únicamente estructura, estilos, navegación y páginas placeholder.

## Requisitos e inicio

- Node.js 20.9 o superior. Se recomienda Node.js 24 LTS.
- npm 10 o superior.
- Compatible con macOS y Windows. Ejecutar todos los comandos desde la raíz del repositorio.

```sh
npm install
npm run dev
```

Abrir http://localhost:3000. La raíz redirige a `/dashboard`.

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

`npm start` sirve la compilación de producción y requiere ejecutar antes `npm run build`. `typecheck` genera primero los tipos de rutas de Next.js para funcionar también después de una instalación limpia. ESLint se ejecuta por separado de la compilación.

Se usa ESLint 9 porque los complementos de importaciones, React y accesibilidad incluidos en `eslint-config-next@16.4.3` todavía declaran ese rango de compatibilidad. npm avisa que esa rama ya no tiene soporte; actualizar junto con los complementos cuando admitan ESLint 10, sin forzar sus dependencias pares.

No se necesitan variables de entorno en esta etapa, por lo que no se incluye un `.env.example` vacío. Cuando exista una integración, documentar solo sus nombres y ejemplos sin secretos.

## Estructura

```text
apps/web/
  public/
    images/branding/        Archivos originales del logotipo
    images/themes/          Recursos visuales por temática
    animations/             Recursos de animación futuros
    sounds/                 Sonidos futuros
    fonts/                  Fuentes originales y sus licencias
  src/
    app/
      (dashboard)/          Layout de la plataforma
        dashboard/          Resumen
        gifts/              Regalos
        animations/         Animaciones
        themes/             Temáticas
        settings/           Configuración
      overlay/              Layout independiente y transparente
      layout.tsx            Documento, metadatos y variables de marca
      page.tsx              Redirección a /dashboard
      globals.css           Tailwind y estilos globales
    components/
      layout/               Estructura y navegación
      ui/                   Placeholder reutilizable
    config/                 Navegación
    features/themes/        Configuración de la temática predeterminada
packages/shared/
  src/index.ts              Contratos TypeScript compartidos
```

Solo se crean módulos que tienen una responsabilidad actual. `hooks`, `lib`, otros componentes y las features de regalos y animaciones se añadirán cuando tengan código real. Los README de recursos conservan las carpetas en Git sin archivos vacíos.

Los workspaces `apps/*` y `packages/*` permiten añadir después `apps/connector` como servicio Node.js independiente. El servicio no existe en esta etapa. `@umbral/shared` es privado y expone fuentes TypeScript; Next.js lo transpila. Un servicio futuro deberá configurar su propio proceso de compilación.

## Rutas

| Ruta | Estado inicial |
| --- | --- |
| `/` | Redirección a `/dashboard` |
| `/dashboard` | Título y descripción de resumen |
| `/gifts` | Título y descripción de regalos |
| `/animations` | Título y descripción de animaciones |
| `/themes` | Título y descripción de temáticas |
| `/settings` | Título y descripción de configuración |
| `/overlay` | Superficie vacía y transparente para una futura fuente de navegador de OBS |

El documento raíz no pinta fondo. El fondo oscuro y la navegación pertenecen exclusivamente al layout `(dashboard)`. `/overlay` solo contiene su superficie transparente: no muestra títulos, navegación ni controles. Es normal ver una página vacía al abrirlo. El navegador o el visor pueden representar la transparencia con un color de fondo propio.

Los componentes son Server Components por defecto. Solo la navegación usa un Client Component para indicar la ruta activa con `aria-current`. La navegación se adapta a pantallas pequeñas sin un menú que requiera estado adicional.

## Identidad y tipografía

La paleta se define una sola vez en `src/features/themes/config.ts` y el layout raíz la expone como variables CSS: rojo `#B81313`, blanco `#FFFFFF`, negro `#111111` y gris `#555555`. Los tokens de Tailwind hacen referencia a esas variables. Para textos secundarios se usa blanco con opacidad sobre el fondo oscuro, conservando legibilidad.

Las familias preparadas son Montserrat para interfaz y Another Danger para títulos especiales (`font-display`). Los archivos no fueron proporcionados: se usan Arial/Helvetica como respaldo local, sin descargas durante la compilación. Incorporar las fuentes originales y las licencias en `public/fonts/`, declararlas con `next/font/local` y conectar sus variables a los tokens de `globals.css` cuando estén disponibles.

El nombre actual es texto de navegación; no reproduce el logotipo. Colocar únicamente el archivo original del logotipo en `public/images/branding/` cuando se entregue y conservar su proporción.

## Límites para el crecimiento

- **Temáticas:** `ThemeDefinition` comparte identidad, paleta y ruta base de recursos. Terror / UmbralCreepy es la configuración inicial. Kawaii, Gamer y Premium están reservadas como identificadores; no tienen diseños ni recursos implementados.
- **Motor futuro:** su módulo se ubicará en `src/features/animations/`. Recibirá eventos neutrales a la plataforma y configuración de temática. No deberá importar clientes ni tipos de TikTok.
- **Recursos futuros:** cada temática podrá agrupar personajes, sonidos, movimientos y efectos; sus contratos se definirán con los primeros casos de uso reales. El mismo motor consumirá esos recursos sin duplicarse por temática.
- **Renderizado futuro:** GSAP, SVG, Canvas y Rive se podrán encapsular en adaptadores del motor, consumidos desde `components/animations/` y `components/overlay/`. No hay motores, adaptadores ni dependencias de animación instaladas.
- **Integraciones futuras:** `apps/connector` podrá traducir los eventos de TikTok a contratos neutrales en `packages/shared`. El transporte WebSocket será una responsabilidad separada del motor. Nada de esto está implementado.

No se incluyen autenticación, base de datos, APIs, conexión TikTok, WebSockets, pagos, formularios, métricas ni efectos.
