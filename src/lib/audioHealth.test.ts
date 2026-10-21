import { describe, expect, it } from 'vitest';
import { isAudioPayload, isTrustedAudioUrl } from '../../supabase/functions/_shared/audioHealth';

describe('audio source verification rules', () => {
  it('accepts audio only when MIME type and file signature agree', () => {
    expect(isAudioPayload('audio/mpeg', new Uint8Array([0x49, 0x44, 0x33, 0x04]))).toBe(true);
    expect(isAudioPayload('audio/ogg', new Uint8Array([0x4f, 0x67, 0x67, 0x53]))).toBe(true);
    expect(isAudioPayload('text/html', new Uint8Array([0x49, 0x44, 0x33]))).toBe(false);
    expect(isAudioPayload('audio/mpeg', new Uint8Array([0x3c, 0x68, 0x74, 0x6d, 0x6c]))).toBe(false);
  });

  it('allows HTTPS Archive.org sources and rejects unrelated hosts', () => {
    expect(isTrustedAudioUrl('https://archive.org/download/item/track.mp3')).toBe(true);
    expect(isTrustedAudioUrl('https://ia800123.us.archive.org/0/items/item/track.mp3')).toBe(true);
    expect(isTrustedAudioUrl('http://archive.org/download/item/track.mp3')).toBe(false);
    expect(isTrustedAudioUrl('https://example.com/track.mp3')).toBe(false);
  });
});