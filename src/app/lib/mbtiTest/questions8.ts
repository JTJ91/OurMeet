// app/lib/mbtiTest/questions-8.ts
export type Axis = "EI" | "NS" | "TF" | "JP";
export type Pole = "E" | "I" | "N" | "S" | "T" | "F" | "J" | "P";
export type CheckKind = "OPPOSITE";

export type Question = {
  id: string;        // q01 ~ q08
  axis: Axis;
  pole: Pole;        // "동의(Yes)"할수록 이 pole 점수가 올라감
  text: string;
  weight?: number;   // 기본 1
  checkPair?: "c1" | "c2" | "c3" | "c4";
  checkKind?: CheckKind;
};

export const QUESTIONS_8: Question[] = [
  // =========================
  // E/I
  // =========================
  {
    id: "q01",
    axis: "EI",
    pole: "I",
    text: "사람들과 오래 어울리고 나면, 보통 에너지가 충전되기보다 더 방전되는 편인가요?",
    checkPair: "c1",
    checkKind: "OPPOSITE",
  },
  {
    id: "q02",
    axis: "EI",
    pole: "E",
    text: "혼자 생각에 잠기는 시간보다, 사람·활동·이벤트 같은 ‘바깥 세계’를 경험할 때 더 에너지가 나는 편인가요?",
    checkPair: "c1",
    checkKind: "OPPOSITE",
  },

  // =========================
  // S/N
  // =========================
  {
    id: "q03",
    axis: "NS",
    pole: "S",
    text: "새로운 걸 배울 때, 추상적인 이론이나 가능성보다 ‘구체적인 사실’과 ‘현실 예시’를 더 선호하나요?",
    checkPair: "c2",
    checkKind: "OPPOSITE",
  },
  {
    id: "q04",
    axis: "NS",
    pole: "N",
    text: "눈앞의 사실을 그대로 보기보다, 그 안에 숨은 의미나 앞으로 어떻게 될지 상상하는 편인가요?",
    checkPair: "c2",
    checkKind: "OPPOSITE",
  },

  // =========================
  // T/F
  // =========================
  {
    id: "q05",
    axis: "TF",
    pole: "T",
    text: "결정을 내릴 때, 사람들의 기분보다 ‘맞고 틀림’이나 ‘공정한 기준’을 더 중요하게 생각하나요?",
    checkPair: "c3",
    checkKind: "OPPOSITE",
  },
  {
    id: "q06",
    axis: "TF",
    pole: "F",
    text: "결정을 내릴 때, 논리적으로 맞는지보다 사람들의 기분과 분위기를 더 중요하게 생각하나요?",
    checkPair: "c3",
    checkKind: "OPPOSITE",
  },

  // =========================
  // J/P
  // =========================
  {
    id: "q07",
    axis: "JP",
    pole: "J",
    text: "일정이 갑자기 바뀌면 마음이 불편해지는 편인가요?",
    checkPair: "c4",
    checkKind: "OPPOSITE",
  },
  {
    id: "q08",
    axis: "JP",
    pole: "P",
    text: "여행/약속은 큰 틀만 잡아두고, 현장에서 분위기 보고 바꾸는 게 더 편한가요?",
    checkPair: "c4",
    checkKind: "OPPOSITE",
  },
];
