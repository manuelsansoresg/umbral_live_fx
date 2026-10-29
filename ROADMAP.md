# Umbral LIVE FX — plan maestro de desarrollo

Actualizado: 2026-10-29. Estado marcado por funcionalidad real, no solamente por pantalla creada.

## Etapa 0 — Base existente
- [x] Next.js (App Router) y estructura de monorepo.
- [x] Dashboard con simulador de regalos.
- [x] Biblioteca de presets de animación y editor básico.
- [x] Asignación de regalos por modo automático y personalizado.
- [x] Temáticas iniciales Terror, Gamer, Fantasía y Premium.
- [x] Overlay transparente y eventos simulados entre pestañas del mismo origen.
- [ ] Verificar compilación, lint y flujo completo en CI / entorno local.
- [ ] Integrar logo oficial, favicon y recursos visuales originales.

## Etapa 1 — Control de transmisión (primera entrega)
- [x] Ruta /live y navegación.
- [x] Ajustes de resolución y modo de visualización.
- [x] Acceso directo y copia de URL del overlay.
- [x] Controles de pruebas locales y estado honesto de la conexión.
- [x] Configuración general: exportar/importar presets y restablecer preferencias locales.
- [x] Overlay sin indicador de espera mediante parámetro status=0.
- [x] Primer puente de pruebas con Server-Sent Events (SSE) para fuentes de navegador en OBS, mismo proceso Node persistente y canal por UUID.
- [ ] Validar visualmente y comprobar audio en OBS y TikTok LIVE Studio en equipos reales; no es una integración certificada.
- [ ] Infraestructura de relay para despliegue distribuido (Redis/pubsub) y autenticación por usuario/canal.
- [x] Cola de vista previa en memoria con reproducción secuencial y límite de 25 eventos simulados.
- [ ] Cola persistente de efectos, prioridades por regalo, deduplicación y rate limiting de producción.
- [x] Sonidos sintetizados originales por efecto, interruptor individual y volumen general; audio sincronizado con la cola local.
- [x] Botón de prueba audible y diagnósticos en overlay y editor; incremento de ganancia en sonidos sintetizados.
- [ ] Validación de audio dentro de fuentes OBS/TikTok LIVE Studio y volumen independiente por preset.

## Etapa 2 — Animaciones de calidad comercial
- [x] Primer motor reutilizable Canvas + CSS con capas, animaciones responsivas y partículas.
- [x] Primera versión animada de portales, niebla, sangre y silueta espectral (representaciones estilizadas, no fotorrealistas).
- [x] Silueta original SVG de fantasma animada como mejora visual inicial.
- [ ] Perfeccionar criaturas y apariciones fotorrealistas mediante recursos gráficos originales y dirección de arte.
- [ ] Activos con licencias verificadas, precarga y degradación de rendimiento.
- [ ] Editor avanzado: línea de tiempo, entrada/salida, posición y capas.
- [x] Previsualización del mismo renderer en tarjetas, editor y overlay.
- [ ] Validación visual precisa en fuentes 16:9 y 9:16.
- [x] Respeto básico de la preferencia de movimiento reducido.
- [ ] Auditoría de accesibilidad y límites de destellos.

## Etapa 3 — TikTok LIVE (backend separado)
- [ ] Repositorio backend Node.js, adaptador de eventos e infraestructura de sockets.
- [ ] Reconexión, heartbeat, deduplicación y eventos de streak.
- [ ] Catálogo verificado de regalos TikTok (IDs, imágenes, valores dinámicos).
- [ ] Conectar likes/seguidores/comentarios si el proveedor lo admite.
- [ ] Validar límites, términos y compatibilidad real antes de hacer promesas de soporte.

## Etapa 4 — Plataforma para comercialización
- [ ] Autenticación, usuarios, espacios de trabajo y perfiles.
- [ ] Base de datos y sincronización de configuración entre dispositivos.
- [ ] Biblioteca de escenas y plantillas exportables.
- [ ] Cobros, suscripciones mensuales/anuales, límites de plan y facturación.
- [ ] Roles, seguridad del overlay, aislamiento por canal y registro de auditoría.
- [ ] Panel de actividad e historial de eventos.
- [ ] Pruebas automatizadas, monitoreo, copias de seguridad y despliegue VPS/AWS.

## Criterios
- El MVP funciona primero con simulación local sin TikTok.
- Nada marcado como terminado implica integración con TikTok, OBS, audio o cobros salvo prueba real.
- No publicar claves ni tokens en el repositorio.
- Cambios incrementales sobre main y verificación de compilación antes de producción.

## Prueba manual de esta entrega (pendiente de validación)
1. Ejecutar `npm install && npm run build && npm run dev`.
2. Abrir `/animations`, activar sonido en un preset, ajustar volumen y pulsar Reproducir.
3. Abrir `/overlay` en otra pestaña del mismo origen y pulsar «Activar sonido» por restricción del navegador.
4. Enviar varios regalos consecutivos y comprobar audio/visual secuencial, «Detener» y silencio global a 0%.
5. Recargar el navegador, comprobar que se conservan volumen y presets antiguos.
6. Comprobar movimiento reducido del sistema operativo.

Notas: No existe todavía sonido garantizado en OBS ni control de audio en un dispositivo remoto. Los sonidos se generan con osciladores Web Audio y no usan archivos de terceros.

### Diagnóstico de audio
- Abrir /overlay y pulsar **Activar y probar sonido**: deben oírse tres notas, independiente de los presets.
- Si se oyen las notas pero no el efecto, revisar **Sonido sintetizado en este efecto** en /animations y volumen general > 0.
- Si las notas tampoco suenan, comprobar que la pestaña/sitio/dispositivo no están silenciados; la autorización Web Audio es específica de cada pestaña.
- La compilación aún debe verificarse localmente; no hubo acceso de red al repositorio desde el entorno de ejecución.

### Prueba de fuente de navegador OBS (pendiente de prueba real)
1. Ejecutar un único proceso Node con `npm run dev` o `npm run build && npm start`.
2. Ir a `/live` y copiar la URL del overlay con `channel=<uuid>`; no compartirla públicamente.
3. Crear una fuente **Navegador** en OBS, con esa URL y resolución 1080×1920 (vertical) o 1920×1080 (horizontal).
4. Desde `/live`, enviar regalos de prueba; debe activarse la animación en OBS mediante SSE incluso si el panel está en otro navegador.
5. Probar detener efectos y recargar la fuente OBS para verificar reconexión.
6. Probar audio de manera separada: OBS/CEF puede bloquear Web Audio automático.
7. Este prototipo no funciona con múltiples réplicas del servidor ni con funciones serverless. Para producción usar un broker compartido, autenticación y límites por canal.
