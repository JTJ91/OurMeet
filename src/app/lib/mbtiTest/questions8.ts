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
  // E/I (친화력 + 에너지)
  // =========================
  {
    id: "q01",
    axis: "EI",
    pole: "E",
    text: "처음 만난 사람과도 금방 편하게 대화가 이어지는 편이다.",
    checkPair: "c1",
    checkKind: "OPPOSITE",
  },
  {
    id: "q02",
    axis: "EI",
    pole: "I",
    text: "사람을 만나고 나면 혼자만의 시간이 있어야 에너지가 다시 충전된다.",
    checkPair: "c1",
    checkKind: "OPPOSITE",
  },


  // =========================
  // N/S (상상력 중심)
  // =========================
  {
    id: "q03",
    axis: "NS",
    pole: "N",
    text: "가만히 있어도 새로운 아이디어나 상상이 계속 떠오르는 편이다.",
    checkPair: "c2",
    checkKind: "OPPOSITE",
  },
  {
    id: "q04",
    axis: "NS",
    pole: "S",
    text: "막연한 상상보다는 눈에 보이고 확인된 정보가 훨씬 편하다.",
    checkPair: "c2",
    checkKind: "OPPOSITE",
  },



  // =========================
  // T/F (공감 vs 해결)
  // =========================
  {
    id: "q05",
    axis: "TF",
    pole: "T",
    text: "누군가 힘들다고 말하면, 나는 공감보다 해결 방법을 제시하는 쪽에 가깝다.",
    checkPair: "c3",
    checkKind: "OPPOSITE",
  },
  {
    id: "q06",
    axis: "TF",
    pole: "F",
    text: "누군가 힘들다고 말하면, 나는 해결책보다 그 감정을 이해해주는 쪽에 가깝다.",
    checkPair: "c3",
    checkKind: "OPPOSITE",
  },


  // =========================
  // J/P (스트레스 + 계획 스타일)
  // =========================
  {
    id: "q07",
    axis: "JP",
    pole: "J",
    text: "이미 세운 계획이 틀어지면 예상보다 스트레스를 크게 받는 편이다.",
    checkPair: "c4",
    checkKind: "OPPOSITE",
  },
  {
    id: "q08",
    axis: "JP",
    pole: "P",
    text: "처음부터 세세하게 계획을 세우기보다, 큰 틀만 정하고 상황에 맞춰 움직이는 편이다.",
    checkPair: "c4",
    checkKind: "OPPOSITE",
  },

];
