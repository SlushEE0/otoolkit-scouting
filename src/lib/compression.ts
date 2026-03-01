/**
 * Compression & QR Chunking Utilities
 *
 * Uses lz-string for browser-safe compression of JSON payloads.
 * Implements a chunking protocol for QR code transfer when
 * compressed data exceeds the QR size limit.
 *
 * QR Chunking Protocol:
 * Each QR code contains a JSON object:
 * {
 *   "s": "session-id",   // shared across all chunks in a batch
 *   "i": 0,              // chunk index (0-based)
 *   "t": 3,              // total number of chunks
 *   "d": "..."           // compressed data fragment
 * }
 */

import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";

/** Maximum characters per QR code payload */
const MAX_QR_CHARS = 1800;

/** Overhead for chunk envelope JSON structure */
const CHUNK_ENVELOPE_OVERHEAD = 80;

export interface QRChunk {
  /** Session ID shared across all chunks */
  s: string;
  /** Chunk index (0-based) */
  i: number;
  /** Total number of chunks */
  t: number;
  /** Compressed data fragment */
  d: string;
}

/**
 * Compress a JSON-serializable value to a URI-safe string.
 */
export function compressData(data: unknown): string {
  const json = JSON.stringify(data);
  return compressToEncodedURIComponent(json);
}

/**
 * Decompress a URI-safe string back to parsed JSON.
 */
export function decompressData<T = unknown>(compressed: string): T {
  const json = decompressFromEncodedURIComponent(compressed);
  if (!json) throw new Error("Failed to decompress data");
  return JSON.parse(json) as T;
}

/**
 * Split compressed data into QR-ready chunks.
 * Each chunk is a JSON string ≤ MAX_QR_CHARS.
 */
export function createQRChunks(
  compressed: string,
  sessionId: string
): QRChunk[] {
  const maxDataPerChunk = MAX_QR_CHARS - CHUNK_ENVELOPE_OVERHEAD;

  if (compressed.length <= maxDataPerChunk) {
    return [{ s: sessionId, i: 0, t: 1, d: compressed }];
  }

  const chunks: QRChunk[] = [];
  let offset = 0;

  while (offset < compressed.length) {
    chunks.push({
      s: sessionId,
      i: chunks.length,
      t: 0, // will be set after
      d: compressed.slice(offset, offset + maxDataPerChunk)
    });
    offset += maxDataPerChunk;
  }

  // Set total count on every chunk
  for (const chunk of chunks) {
    chunk.t = chunks.length;
  }

  return chunks;
}

/**
 * Reassemble chunks into the original compressed string.
 */
export function reassembleChunks(chunks: QRChunk[]): string {
  const sorted = [...chunks].sort((a, b) => a.i - b.i);
  return sorted.map((c) => c.d).join("");
}
