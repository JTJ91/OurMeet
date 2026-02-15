export const MAX_NICKNAME_UNITS = 6;

function charUnits(ch: string) {
  return /^[\x00-\x7F]$/.test(ch) ? 1 : 2;
}

export function countNicknameUnits(value: string) {
  let total = 0;
  for (const ch of value) total += charUnits(ch);
  return total;
}

export function sanitizeNicknameInput(value: string) {
  const compact = String(value ?? "").replace(/\s/g, "");
  let out = "";
  let used = 0;
  for (const ch of compact) {
    const next = charUnits(ch);
    if (used + next > MAX_NICKNAME_UNITS) break;
    out += ch;
    used += next;
  }
  return out;
}

export function isNicknameLengthValid(value: string) {
  const units = countNicknameUnits(value);
  return units >= 1 && units <= MAX_NICKNAME_UNITS;
}
