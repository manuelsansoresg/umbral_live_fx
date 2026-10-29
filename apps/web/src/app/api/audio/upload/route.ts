import { detectAudioExtension, MAX_AUDIO_BYTES, saveAudio } from "@/features/live/audio-storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const url = new URL(request.url);
  // Development-only local upload until user authentication is implemented.
  if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname)) {
    return Response.json({ error: "La carga de audios requiere autenticación en servidores públicos. Usa localhost para esta versión." }, { status: 403 });
  }
  if (request.headers.get("origin") !== url.origin) {
    return Response.json({ error: "Origen de carga no autorizado" }, { status: 403 });
  }
  const length = Number(request.headers.get("content-length"));
  if (length && length > MAX_AUDIO_BYTES + 10000) {
    return Response.json({ error: "Máximo 5 MB por sonido" }, { status: 413 });
  }
  let data: FormData;
  try { data = await request.formData(); }
  catch { return Response.json({ error: "Solicitud inválida" }, { status: 400 }); }
  const file = data.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Selecciona un archivo de audio" }, { status: 400 });
  if (!file.size || file.size > MAX_AUDIO_BYTES) return Response.json({ error: "El audio debe pesar entre 1 byte y 5 MB" }, { status: 413 });
  if (!["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/wave", "audio/ogg", "application/ogg"].includes(file.type)) {
    return Response.json({ error: "Solo MP3, WAV u OGG" }, { status: 415 });
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = detectAudioExtension(bytes);
  if (!ext) return Response.json({ error: "El contenido no parece ser MP3, WAV u OGG" }, { status: 415 });
  try {
    const filename = await saveAudio(bytes, ext);
    return Response.json({ url: `/api/audio/${filename}`, filename, size: bytes.length }, { status: 201 });
  } catch { return Response.json({ error: "No se pudo guardar el audio. Comprueba permisos del directorio." }, { status: 500 }); }
}
