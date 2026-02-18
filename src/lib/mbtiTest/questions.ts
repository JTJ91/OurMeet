// app/lib/mbtiTest/questions.ts
export type Axis = "EI" | "NS" | "TF" | "JP";
export type Pole = "E" | "I" | "N" | "S" | "T" | "F" | "J" | "P";

export type CheckKind = "OPPOSITE";

export type Question = {
  id: string;        // q01 ~ q60
  axis: Axis;
  pole: Pole;        // "동의"할수록 이 pole 점수가 올라감
  text: string;
  weight?: number;   // 기본 1
  checkPair?: "c1" | "c2" | "c3";   // ✅ 일관성 체크용(서로 반대 문항)
  checkKind?: CheckKind;            // ✅ 현재는 OPPOSITE만 사용
};

export const QUESTIONS: Question[] = [
  // =========================
  // EI (15)
  // =========================
  { id: "q01", axis: "EI", pole: "E", text: "모임에서 먼저 인사하는 편이다." },
  { id: "q02", axis: "EI", pole: "I", text: "모임에서는 먼저 분위기를 보고 말한다." },
  { id: "q03", axis: "EI", pole: "E", text: "생각나면 바로 의견을 말한다.", checkPair: "c1", checkKind: "OPPOSITE" },
  { id: "q04", axis: "EI", pole: "I", text: "말하기 전에 생각을 정리한다.", checkPair: "c1", checkKind: "OPPOSITE" },
  { id: "q05", axis: "EI", pole: "E", text: "사람들과 오래 있으면 힘이 난다." },
  { id: "q06", axis: "EI", pole: "I", text: "혼자 쉬는 시간이 꼭 필요하다." },
  { id: "q07", axis: "EI", pole: "E", text: "처음 만난 사람에게도 질문을 잘 한다." },
  { id: "q08", axis: "EI", pole: "I", text: "낯선 자리에서는 말수가 줄어든다." },
  { id: "q09", axis: "EI", pole: "E", text: "갑자기 잡힌 약속도 즐겁다." },
  { id: "q10", axis: "EI", pole: "I", text: "갑자기 잡힌 약속은 부담스럽다." },
  { id: "q11", axis: "EI", pole: "E", text: "궁금한 것은 바로 물어보는 편이다." },
  { id: "q12", axis: "EI", pole: "I", text: "궁금한 것은 먼저 혼자 찾아본다." },
  { id: "q13", axis: "EI", pole: "E", text: "회의에서 침묵이 길면 먼저 말문을 연다." },
  { id: "q14", axis: "EI", pole: "I", text: "여럿이 있어도 필요한 말만 하는 편이다." },
  { id: "q15", axis: "EI", pole: "E", text: "활동적인 일정이 많을수록 기분이 좋아진다." },

  // =========================
  // NS (15)
  // =========================
  { id: "q16", axis: "NS", pole: "N", text: "가만히 있어도 여러 상상이나 망상이 계속 떠오른다." },
  { id: "q17", axis: "NS", pole: "S", text: "가만히 있을 때는 상상보다 지금 할 일 생각이 더 많다." },
  { id: "q18", axis: "NS", pole: "N", text: "한 생각이 끝나기 전에 다른 생각이 이어져, 머릿속이 자주 시끄럽다." },
  { id: "q19", axis: "NS", pole: "S", text: "생각이 꼬리를 물기보다, 한 가지씩 차분히 정리해서 생각하는 편이다." },
  { id: "q20", axis: "NS", pole: "N", text: "새 일을 시작하면 아이디어가 먼저 나온다." },
  { id: "q21", axis: "NS", pole: "S", text: "새 일을 시작하면 필요한 자료부터 찾는다." },
  { id: "q22", axis: "NS", pole: "N", text: "말 속의 숨은 뜻을 자주 생각한다.", checkPair: "c2", checkKind: "OPPOSITE" },
  { id: "q23", axis: "NS", pole: "S", text: "말은 들은 그대로 이해하는 편이다.", checkPair: "c2", checkKind: "OPPOSITE" },
  { id: "q24", axis: "NS", pole: "N", text: "앞으로 일어날 장면을 자주 상상한다." },
  { id: "q25", axis: "NS", pole: "S", text: "지금 해야 할 일에 먼저 집중한다." },
  { id: "q26", axis: "NS", pole: "N", text: "정답이 있어도 다른 방법을 떠올린다." },
  { id: "q27", axis: "NS", pole: "S", text: "검증된 방법을 그대로 쓰는 게 편하다." },
  { id: "q28", axis: "NS", pole: "N", text: "비유나 아이디어로 설명하는 걸 좋아한다." },
  { id: "q29", axis: "NS", pole: "S", text: "실제 예시가 있어야 이해가 쉽다." },
  { id: "q30", axis: "NS", pole: "N", text: "'만약에'를 가정해보는 걸 자주 한다." },

  // =========================
  // TF (15)
  // =========================
  { id: "q31", axis: "TF", pole: "T", text: "누가 고민을 말하면 해결 순서부터 정리해 준다." },
  { id: "q32", axis: "TF", pole: "F", text: "누가 고민을 말하면 먼저 \"힘들었겠다\"고 공감한다." },
  { id: "q33", axis: "TF", pole: "T", text: "감정보다 문제의 원인을 찾는 게 먼저라고 본다." },
  { id: "q34", axis: "TF", pole: "F", text: "원인보다 지금 그 사람 마음 상태가 더 중요하다고 본다." },
  { id: "q35", axis: "TF", pole: "T", text: "위로만 하기보다 지금 바로 할 행동을 정해 주는 편이다." },
  { id: "q36", axis: "TF", pole: "F", text: "조언하기 전에 충분히 들어주는 게 더 중요하다고 본다." },
  { id: "q37", axis: "TF", pole: "T", text: "갈등이 생기면 사실과 근거를 먼저 정리한다." },
  { id: "q38", axis: "TF", pole: "F", text: "갈등이 생기면 상처받지 않게 말하는 걸 먼저 신경 쓴다." },
  { id: "q39", axis: "TF", pole: "T", text: "급한 상황에서는 감정보다 역할 분담을 먼저 한다." },
  { id: "q40", axis: "TF", pole: "F", text: "급한 상황에서도 서로 진정할 말을 먼저 건넨다." },
  { id: "q41", axis: "TF", pole: "T", text: "상담이 끝날 때는 결론이 나와야 깔끔하다고 느낀다." },
  { id: "q42", axis: "TF", pole: "F", text: "상담이 끝날 때는 결론보다 마음이 편해지는 게 중요하다." },
  { id: "q43", axis: "TF", pole: "T", text: "실수 후에는 위로보다 같은 실수를 막을 규칙이 먼저라고 본다." },
  { id: "q44", axis: "TF", pole: "F", text: "실수 후에는 규칙보다 먼저 사과와 관계 회복이 필요하다고 본다." },
  { id: "q45", axis: "TF", pole: "T", text: "친구가 속상해해도 맞고 틀린 판단은 분리해서 본다." },

  // =========================
  // JP (15)
  // =========================
  { id: "q46", axis: "JP", pole: "J", text: "여행 전에 일정표를 먼저 만든다." },
  { id: "q47", axis: "JP", pole: "P", text: "여행은 큰 틀만 정하고 가도 괜찮다." },
  { id: "q48", axis: "JP", pole: "J", text: "여행 예약과 시간은 미리 확정해야 편하다." },
  { id: "q49", axis: "JP", pole: "P", text: "여행 중에는 현장 분위기에 맞춰 코스를 바꾸는 게 좋다." },
  { id: "q50", axis: "JP", pole: "J", text: "계획보다 일정이 늦어지면 마음이 급해진다." },
  { id: "q51", axis: "JP", pole: "P", text: "일정이 늦어져도 여유 있게 맞춘다." },
  { id: "q52", axis: "JP", pole: "J", text: "계획이 바뀌면 대안 순서를 다시 정리한다." },
  { id: "q53", axis: "JP", pole: "P", text: "계획이 바뀌면 바로 다른 선택으로 움직인다." },
  { id: "q54", axis: "JP", pole: "J", text: "예상 못 한 변수가 생기면 스트레스를 크게 받는다.", checkPair: "c3", checkKind: "OPPOSITE" },
  { id: "q55", axis: "JP", pole: "P", text: "예상 못 한 변수가 생겨도 금방 적응한다.", checkPair: "c3", checkKind: "OPPOSITE" },
  { id: "q56", axis: "JP", pole: "J", text: "여행 준비물은 체크리스트로 챙긴다." },
  { id: "q57", axis: "JP", pole: "P", text: "여행 준비물은 빠진 게 있으면 가서 사도 된다고 생각한다." },
  { id: "q58", axis: "JP", pole: "J", text: "정해둔 순서가 깨지면 집중이 잘 안 된다." },
  { id: "q59", axis: "JP", pole: "P", text: "순서가 바뀌면 다른 방법을 바로 찾는다." },
  { id: "q60", axis: "JP", pole: "J", text: "할 일을 끝내고 쉬어야 마음이 놓인다." },
];
