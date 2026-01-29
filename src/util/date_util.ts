/**
 * 날짜 유틸리티 함수
 */

/**
 * Date를 "YYYY-MM-DD" 문자열로 변환
 * @param date - 날짜
 * @returns 포맷된 문자열
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * DateTime을 "HH:mm" 형식으로 변환
 * @param dateTime - 날짜/시간
 * @returns "HH:mm" 형식 문자열
 */
export function formatTime(dateTime: Date | null): string {
  if (!dateTime) return '';

  const hours = String(dateTime.getHours()).padStart(2, '0');
  const minutes = String(dateTime.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 생년월일에서 나이 계산
 * @param birthDate - 생년월일
 * @returns 나이
 */
export function calculateAge(birthDate: Date | null): number {
  if (!birthDate) return 0;

  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  // 생일이 아직 안 지났으면 -1
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}
