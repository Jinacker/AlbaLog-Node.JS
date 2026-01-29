import { parse as uuidParse, stringify as uuidStringify } from 'uuid';

/**
 * UUID string -> Uint8Array(16 bytes) whose .buffer is ArrayBuffer (not ArrayBufferLike)
 */
export function uuidToBin(uuid: string): Uint8Array<ArrayBuffer> {
  const bytes = uuidParse(uuid); // Uint8Array<ArrayBufferLike>

  // ✅ ArrayBuffer로 backing buffer를 강제하는 방법:
  // 1) ArrayBuffer를 새로 만들고
  // 2) 복사해서 채운다
  const ab = new ArrayBuffer(bytes.length);
  const out = new Uint8Array(ab);
  out.set(bytes);

  return out as Uint8Array<ArrayBuffer>;
}

export function binToUuid(bin: Uint8Array): string {
  return uuidStringify(bin);
}
