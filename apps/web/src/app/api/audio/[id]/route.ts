import { AUDIO_ID, readAudio } from "@/features/live/audio-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!AUDIO_ID.test(id)) return new Response("Archivo no válido", { status: 400 });
  const bytes = await readAudio(id);
  if (!bytes) return new Response("Archivo no encontrado", { status: 404 });
  const type = id.endsWith(".mp3") ? "audio/mpeg" : id.endsWith(".wav") ? "audio/wav" : "audio/ogg";
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": type,
      "Content-Length": String(bytes.length),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    },
  });
}
