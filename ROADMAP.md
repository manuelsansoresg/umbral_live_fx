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
- [x] Recuperación de eventos con consulta periódica, buffer en memoria de 60 s y diagnóstico de entrega en /live (corrección para fallo de overlay reportado el 2026-10-29).
- [ ] Validar en OBS que la URL del canal coincide y que tanto animación como audio regresaron.
- [ ] Validar visualmente y comprobar audio en OBS y TikTok LIVE Studio en equipos reales; no es una integración certificada.
- [ ] Infraestructura de relay para despliegue distribuido (Redis/pubsub) y autenticación por usuario/canal.
- [x] Cola de vista previa en memoria con reproducción secuencial y límite de 25 eventos simulados.
- [ ] Cola persistente de efectos, prioridades por regalo, deduplicación y rate limiting de producción.
- [x] Sonidos sintetizados originales por efecto, interruptor individual y volumen general; audio sincronizado con la cola local.
- [x] Botón de prueba audible y diagnósticos en overlay y editor; incremento de ganancia en sonidos sintetizados.
- [ ] Rediseño de sonidos ambientales: el motor experimental se revirtió tras regresión reportada por el usuario; vuelve el motor previamente funcional.
- [x] Prueba individual de audio disponible en el editor.
- [ ] Confirmar en OBS que cada preset guardado tiene sonido habilitado y que se escucha desde la fuente de navegador.
- [x] Corregido el volumen enviado por cada regalo: OBS recibe el nivel del panel aunque tenga almacenamiento local diferente.
- [x] Tonos graves reajustados a frecuencias audibles dentro del motor Web Audio previamente funcional.
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

### Prueba de audio individual en OBS
- Actualizar proyecto, reiniciar Next.js y refrescar la fuente Navegador de OBS.
- Abrir /animations, elegir Fantasma/Aparición espectral y comprobar la casilla de sonido (configuraciones locales antiguas pueden conservarla desactivada).
- Pulsar «Escuchar sonido de este efecto» en el editor; debe oírse un sonido espectral de ~3 segundos, no tres pitidos.
- Reproducir el regalo hacia OBS desde el panel y verificar el medidor de la fuente «umbral».
- Si la fuente recibe eventos pero sigue muda, abrir temporalmente su URL con `&debug=1` y usar «Activar y probar sonido» mediante Interactuar en OBS. El overlay normal continúa limpio.

### Recuperación después de pérdida total de animación/audio
1. Reiniciar Next.js y recargar `/live`.
2. Copiar nuevamente la URL completa del overlay de `/live` y reemplazar la fuente `umbral` de OBS (puede haber quedado un canal UUID anterior).
3. Refrescar la fuente en OBS y ejecutar un regalo de prueba desde `/live`.
4. Leer el nuevo diagnóstico bajo «Mesa de pruebas»: distingue error HTTP, ningún overlay conectado por SSE o múltiples conexiones.
5. Si SSE no funciona, el overlay consulta `/api/live/poll` periódicamente para recuperar mensajes hasta 60 s después.
6. Si continúa sin animación, probar `/overlay?debug=1` en Safari y verificar el estado del relay; solo entonces revisar los logs del servidor.

### Prueba del ajuste de audio del 29 de octubre
1. Guardar respaldo de ajustes y verificar que el volumen general sea mayor que 0.
2. En Animaciones comprobar la casilla de sonido en cada preset, especialmente los más antiguos.
3. Actualizar el servidor y refrescar la fuente Navegador en OBS.
4. Probar Fantasma, Corona, Rosa y Corazón desde el dashboard. El volumen ahora viaja dentro del evento y los tonos ya no dependen de subgraves.
5. Si un efecto sigue sin sonar, usar `/overlay?debug=1` con el mismo parámetro `channel` para distinguir entre bloqueo de Web Audio y preset sin sonido.
