import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const MAX_AUDIO_BYTES = 5 * 1024 * 1024;
export const AUDIO_ID = /^[a-f0-9-]{36}\.(mp3|wav|ogg)$/;
export const audioDirectory = () => process.env.UMBRAL_AUDIO_DIR || path.join(process.cwd(), ".umbral-audio");

export function detectAudioExtension(bytes: Buffer): "mp3" | "wav" | "ogg" | null {
  if (bytes.length < 12) return null;
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WAVE") return "wav";
  if (bytes.toString("ascii", 0, 4) === "OggS") return "ogg";
  if (bytes.toString("ascii", 0, 3) === "ID3" ||
      (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)) return "mp3";
  return null;
}
export async function saveAudio(bytes: Buffer, ext: "mp3" | "wav" | "ogg") {
  const dir = audioDirectory();
  await mkdir(dir, { recursive: true, mode: 0o700 });
  const filename = `${crypto.randomUUID()}.${ext}`;
  await writeFile(path.join(dir, filename), bytes, { flag: "wx", mode: 0o600 });
  return filename;
}
export async function readAudio(id: string) {
  if (!AUDIO_ID.test(id)) return null;
  try { return await readFile(path.join(audioDirectory(), id)); }
  catch { return null; }
}
