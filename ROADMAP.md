# Umbral LIVE FX — plan maestro de desarrollo

Actualizado: 2026-10-28. Estado marcado por funcionalidad real, no solamente por pantalla creada.

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
- [ ] Compatibilidad real con fuentes de navegador OBS/TikTok LIVE Studio (el actual BroadcastChannel no alcanza el motor embebido de OBS).
- [x] Cola de vista previa en memoria con reproducción secuencial y límite de 25 eventos simulados.
- [ ] Cola persistente de efectos, prioridades por regalo, deduplicación y rate limiting de producción.
- [ ] Audio sincronizado, volumen general y por preset.

## Etapa 2 — Animaciones de calidad comercial
- [x] Primer motor reutilizable Canvas + CSS con capas, animaciones responsivas y partículas.
- [x] Primera versión animada de portales, niebla, sangre y silueta espectral (representaciones estilizadas, no fotorrealistas).
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
