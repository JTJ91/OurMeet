export type SavedGroup = {
  id: string;
  name: string;
  lastSeenAt: number;
};

const KEY = "moimrank:groups";

export function readSavedGroups(): SavedGroup[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedGroup[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function upsertSavedGroup(group: { id: string; name: string }) {
  if (typeof window === "undefined") return;

  const now = Date.now();
  const prev = readSavedGroups();

  // 중복 제거 + 최신으로 올리기
  const next: SavedGroup[] = [
    { id: group.id, name: group.name, lastSeenAt: now },
    ...prev.filter((g) => g.id !== group.id),
  ].slice(0, 20); // 최대 20개만

  localStorage.setItem(KEY, JSON.stringify(next));
}

export function removeSavedGroup(groupId: string) {
  if (typeof window === "undefined") return;
  const prev = readSavedGroups();
  const next = prev.filter((g) => g.id !== groupId);
  localStorage.setItem(KEY, JSON.stringify(next));
}
