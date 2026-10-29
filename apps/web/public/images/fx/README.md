# Recurso cinematográfico: Aparición espectral premium

El componente `apps/web/src/components/fx/cinematic-effect.tsx` utiliza el recurso transparente:

```
apps/web/public/images/fx/umbral-premium-wraith.png
```

La ilustración fue creada específicamente para Umbral LIVE FX (sin texto incrustado), con un personaje espectral y una mano proyectada hacia el espectador. Se anima mediante CSS/Canvas y deja los textos del regalo editables.

**Importante:** el archivo PNG debe colocarse aquí por separado: la actualización automatizada del código por el conector de GitHub no adjunta archivos binarios. Hasta que el PNG exista, el componente muestra el SVG anterior como respaldo.

Requisitos:
- PNG RGBA con fondo transparente.
- No incluir el nombre del usuario ni del regalo dentro del PNG.
- Se puede reemplazar por una versión propia manteniendo el nombre del archivo.
- Después de copiar el PNG, reiniciar/refrescar Next.js y actualizar la fuente de OBS.
