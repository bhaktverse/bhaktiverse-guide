const ARCHIVE_HOST = /(^|\.)archive\.org$/i;

export function isTrustedAudioUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ARCHIVE_HOST.test(url.hostname);
  } catch {
    return false;
  }
}

export function isAudioPayload(contentType: string, bytes: Uint8Array): boolean {
  const mime = contentType.split(';', 1)[0].trim().toLowerCase();
  if (!(mime.startsWith('audio/') || mime === 'application/ogg')) return false;

  if (startsWith(bytes, [0x49, 0x44, 0x33]) || startsWith(bytes, [0x4f, 0x67, 0x67, 0x53])) return true;
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) || startsWith(bytes, [0x66, 0x4c, 0x61, 0x43])) return true;
  if (bytes.length >= 8 && String.fromCharCode(...bytes.slice(4, 8)) === 'ftyp') return true;

  const limit = Math.min(bytes.length - 1, 32);
  for (let i = 0; i < limit; i += 1) {
    if (bytes[i] === 0xff && (bytes[i + 1] & 0xe0) === 0xe0) return true;
  }
  return false;
}

function startsWith(bytes: Uint8Array, prefix: number[]): boolean {
  return bytes.length >= prefix.length && prefix.every((value, index) => bytes[index] === value);
}

async function readSample(response: Response, maxBytes = 4096): Promise<Uint8Array> {
  if (!response.body) return new Uint8Array();
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (size < maxBytes) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      const chunk = value.subarray(0, maxBytes - size);
      chunks.push(chunk);
      size += chunk.length;
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
  const sample = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    sample.set(chunk, offset);
    offset += chunk.length;
  }
  return sample;
}

export interface VerifiedAudioSource {
  url: string;
  contentType: string;
  contentLength: number | null;
}

export async function probeAudioUrl(value: string, timeoutMs = 6000): Promise<VerifiedAudioSource | null> {
  if (!isTrustedAudioUrl(value)) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let nextUrl = value;

  try {
    for (let redirects = 0; redirects <= 5; redirects += 1) {
      if (!isTrustedAudioUrl(nextUrl)) return null;
      const response = await fetch(nextUrl, {
        method: 'GET',
        headers: { Range: 'bytes=0-4095' },
        redirect: 'manual',
        signal: controller.signal,
      });

      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        await response.body?.cancel().catch(() => undefined);
        if (!location || redirects === 5) return null;
        nextUrl = new URL(location, nextUrl).toString();
        continue;
      }

      if (response.status !== 200 && response.status !== 206) {
        await response.body?.cancel().catch(() => undefined);
        return null;
      }

      const contentType = response.headers.get('content-type') ?? '';
      const contentLength = Number(response.headers.get('content-length') ?? 0) || null;
      const sample = await readSample(response);
      if (!isAudioPayload(contentType, sample)) return null;

      return {
        url: response.url || nextUrl,
        contentType: contentType.split(';', 1)[0].trim(),
        contentLength,
      };
    }
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
  return null;
}