export type SavedGroup = {
  id: string;
  name: string;
  lastSeenAt: number;

  myMemberId?: string;  // 그룹별 내 memberId
  myNickname?: string;  // 그룹별 내 별명
  myMbti?: string;      // 그룹별 내 MBTI
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

export function upsertSavedGroup(input: {
  id: string;
  name: string;
  myMemberId?: string;
  myNickname?: string;
  myMbti?: string;
}) {
  if (typeof window === "undefined") return;

  const now = Date.now();
  const prev = readSavedGroups();
  const prevItem = prev.find((g) => g.id === input.id);

  // ✅ 기존 값 유지 + 새 값 있으면 덮어쓰기
  const nextItem: SavedGroup = {
    id: input.id,
    name: input.name,
    lastSeenAt: now,

    myMemberId: input.myMemberId ?? prevItem?.myMemberId,
    myNickname: input.myNickname ?? prevItem?.myNickname,
    myMbti: input.myMbti ?? prevItem?.myMbti,
  };

  const next: SavedGroup[] = [
    nextItem,
    ...prev.filter((g) => g.id !== input.id),
  ].slice(0, 20);

  localStorage.setItem(KEY, JSON.stringify(next));
}

export function removeSavedGroup(groupId: string) {
  if (typeof window === "undefined") return;
  const prev = readSavedGroups();
  const next = prev.filter((g) => g.id !== groupId);
  localStorage.setItem(KEY, JSON.stringify(next));
}
