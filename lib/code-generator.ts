// Character pool without ambiguous characters: 0/O, 1/I/L, 8/B
const SAFE_CHARS = "2345679ACDEFGHJKMNPQRSTUVWXYZ";

/**
 * Sinh mã học viên 6 ký tự ngẫu nhiên, không trùng lặp
 */
export function generateStudentCode(length = 6): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * SAFE_CHARS.length);
    result += SAFE_CHARS[randomIndex];
  }
  return result;
}

/**
 * Chuẩn hóa mã khi người dùng nhập vào (chuyển hoa, xóa khoảng trắng)
 */
export function normalizeCode(input: string): string {
  if (!input) return "";
  return input.trim().toUpperCase().replace(/\s+/g, "");
}
