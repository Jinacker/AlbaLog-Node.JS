/**
 * UUID 유틸리티 함수
 */

/**
 * UUID 문자열을 Uint8Array(Buffer)로 변환
 * @param uuid - UUID 문자열 (예: "550e8400-e29b-41d4-a716-446655440000")
 * @returns Uint8Array
 */
export function uuidToBuffer(uuid: string): Uint8Array {
  const hex = uuid.replace(/-/g, '');
  return Buffer.from(hex, 'hex');
}

/**
 * Buffer(Binary UUID)를 문자열 UUID로 변환
 * @param buffer - Uint8Array 형식의 UUID
 * @returns 문자열 UUID
 */
export function bufferToUuid(buffer: Uint8Array): string {
  const hex = Buffer.from(buffer).toString('hex');
  return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`;
}
