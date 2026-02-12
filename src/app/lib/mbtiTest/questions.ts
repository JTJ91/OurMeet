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
  { id: "q01", axis: "EI", pole: "E", text: "모임에 가면 내가 먼저 말문을 트는 경우가 많다." },
  { id: "q02", axis: "EI", pole: "I", text: "모임에서는 자연스럽게 ‘듣는 쪽’이 된다." },
  { id: "q03", axis: "EI", pole: "E", text: "생각이 정리 안 돼도 말하다 보면 정리가 된다.", checkPair: "c1", checkKind: "OPPOSITE" },
  { id: "q04", axis: "EI", pole: "I", text: "말하기 전에 머릿속으로 정리부터 하고 말한다.", checkPair: "c1", checkKind: "OPPOSITE" },

  { id: "q05", axis: "EI", pole: "E", text: "새로운 사람들과 만나면 긴장보다 기대가 더 크다." },
  { id: "q06", axis: "EI", pole: "I", text: "낯선 사람들과 오래 있으면 에너지가 빨리 줄어든다." },
  { id: "q07", axis: "EI", pole: "E", text: "단톡/모임에서 ‘먼저 제안’하는 편이다." },
  { id: "q08", axis: "EI", pole: "I", text: "단톡/모임에서 한 번 말하기까지 시간이 걸린다." },
  { id: "q09", axis: "EI", pole: "E", text: "주말에 집에만 있으면 오히려 답답해진다." },
  { id: "q10", axis: "EI", pole: "I", text: "주말에는 사람 만남보다 혼자 쉬는 게 더 달다." },
  { id: "q11", axis: "EI", pole: "E", text: "여럿이 왁자지껄 떠드는 분위기가 싫지 않다." },
  { id: "q12", axis: "EI", pole: "I", text: "조용히 소수로 이야기하는 자리가 훨씬 편하다." },
  { id: "q13", axis: "EI", pole: "E", text: "처음 보는 사람에게도 질문을 잘 던지는 편이다." },
  { id: "q14", axis: "EI", pole: "I", text: "처음 보는 사람에게 말을 거는 건 부담스럽다." },
  { id: "q15", axis: "EI", pole: "E", text: "즉흥 번개 약속이 생기면 ‘일단 가자’가 먼저 나온다." },

  // =========================
  // NS (15)
  // =========================
  { id: "q16", axis: "NS", pole: "N", text: "대화에서 ‘결국 어떤 의미냐’가 더 중요하게 느껴진다." },
  { id: "q17", axis: "NS", pole: "S", text: "대화에서 ‘정확히 뭐가 있었냐’가 더 중요하게 느껴진다." },
  { id: "q18", axis: "NS", pole: "N", text: "설명을 들을 때 큰 방향(핵심)부터 잡아야 편하다." },
  { id: "q19", axis: "NS", pole: "S", text: "설명을 들을 때 예시/사례가 없으면 와닿지 않는다." },
  { id: "q20", axis: "NS", pole: "N", text: "한 가지 이야기를 들으면 연관된 다른 생각이 줄줄 나온다." },
  { id: "q21", axis: "NS", pole: "S", text: "새 아이디어를 들으면 현실적으로 가능한지부터 따진다." },

  { id: "q22", axis: "NS", pole: "N", text: "말을 들을 때 ‘숨은 의도’가 뭐였을지 생각하는 편이다.", checkPair: "c2", checkKind: "OPPOSITE" },
  { id: "q23", axis: "NS", pole: "S", text: "말을 들을 때 ‘말 그대로’ 받아들이는 편이다.", checkPair: "c2", checkKind: "OPPOSITE" },

  { id: "q24", axis: "NS", pole: "N", text: "규칙이 있으면 ‘왜 이렇게 만들었지?’부터 궁금해진다." },
  { id: "q25", axis: "NS", pole: "S", text: "규칙이 있으면 ‘어떻게 하면 되지?’가 먼저 궁금해진다." },
  { id: "q26", axis: "NS", pole: "N", text: "대화가 조금 두루뭉술해도 흐름만 잡히면 괜찮다." },
  { id: "q27", axis: "NS", pole: "S", text: "대화가 두루뭉술하면 구체적으로 다시 확인하고 싶다." },
  { id: "q28", axis: "NS", pole: "N", text: "정답이 있어도 더 나은 방법을 자꾸 떠올린다." },
  { id: "q29", axis: "NS", pole: "S", text: "검증된 방식대로 하면 마음이 편하다." },
  { id: "q30", axis: "NS", pole: "N", text: "‘만약에~’ 같은 가정 이야기가 재밌는 편이다." },

  // =========================
  // TF (15)
  // =========================
  { id: "q31", axis: "TF", pole: "T", text: "결정할 때 ‘누가 더 맞는지’가 먼저 떠오른다." },
  { id: "q32", axis: "TF", pole: "F", text: "결정할 때 ‘누가 상처받을지’가 먼저 떠오른다." },
  { id: "q33", axis: "TF", pole: "T", text: "피드백은 듣기 좋게보다 정확하게 말하는 게 낫다." },
  { id: "q34", axis: "TF", pole: "F", text: "피드백은 내용보다 말투/표현이 더 중요할 때가 많다." },
  { id: "q35", axis: "TF", pole: "T", text: "논쟁이 생기면 감정보다 결론(정리)이 먼저다." },
  { id: "q36", axis: "TF", pole: "F", text: "논쟁이 생기면 결론보다 분위기(관계)가 먼저다." },
  { id: "q37", axis: "TF", pole: "T", text: "친한 사이여도 비효율적이면 ‘바로’ 말하는 편이다." },
  { id: "q38", axis: "TF", pole: "F", text: "친한 사이일수록 ‘돌려’ 말하게 되는 편이다." },
  { id: "q39", axis: "TF", pole: "T", text: "설명을 들으면 논리적으로 맞는지부터 체크한다." },
  { id: "q40", axis: "TF", pole: "F", text: "설명을 들으면 그 사람이 어떤 마음인지부터 느껴진다." },
  { id: "q41", axis: "TF", pole: "T", text: "일이 급하면 기분이 좀 상해도 결정을 내리는 편이다." },
  { id: "q42", axis: "TF", pole: "F", text: "일이 급해도 사람 마음이 무너지면 결국 더 손해라고 느낀다." },
  { id: "q43", axis: "TF", pole: "T", text: "문제가 생기면 ‘원인’부터 찾는 편이다." },
  { id: "q44", axis: "TF", pole: "F", text: "문제가 생기면 ‘사람 상태’부터 챙기는 편이다." },
  { id: "q45", axis: "TF", pole: "T", text: "판단할 때 개인 사정보다 공정한 기준이 더 중요하다." },

  // =========================
  // JP (15)
  // =========================
  { id: "q46", axis: "JP", pole: "J", text: "약속은 날짜/시간이 확정돼야 마음이 편하다." },
  { id: "q47", axis: "JP", pole: "P", text: "약속은 대충 잡고 상황 보며 조정하는 게 편하다." },
  { id: "q48", axis: "JP", pole: "J", text: "무언가 시작할 때 ‘순서/계획’을 먼저 잡는다." },
  { id: "q49", axis: "JP", pole: "P", text: "무언가 시작할 때 ‘일단 해보면서’ 맞춘다." },
  { id: "q50", axis: "JP", pole: "J", text: "마감이 멀어도 미리 해두면 마음이 편하다." },
  { id: "q51", axis: "JP", pole: "P", text: "마감이 가까워져야 집중이 잘 된다." },

  { id: "q52", axis: "JP", pole: "J", text: "할 일은 적어두고 체크하면서 처리하는 편이다." },
  { id: "q53", axis: "JP", pole: "P", text: "할 일 목록은 있어도 자주 바뀌는 편이라 크게 안 묶는다." },

  { id: "q54", axis: "JP", pole: "J", text: "결정은 빨리 내려야 일이 앞으로 간다.", checkPair: "c3", checkKind: "OPPOSITE" },
  { id: "q55", axis: "JP", pole: "P", text: "결정은 최대한 늦게 하는 게 마음이 편하다.", checkPair: "c3", checkKind: "OPPOSITE" },

  { id: "q56", axis: "JP", pole: "J", text: "정리된 환경이 아니면 집중이 잘 안 된다." },
  { id: "q57", axis: "JP", pole: "P", text: "조금 어질러져 있어도 크게 신경 쓰지 않는다." },
  { id: "q58", axis: "JP", pole: "J", text: "계획이 갑자기 바뀌면 스트레스를 받는다." },
  { id: "q59", axis: "JP", pole: "P", text: "계획이 바뀌어도 그때그때 맞추면 된다." },
  { id: "q60", axis: "JP", pole: "J", text: "일은 ‘마무리’까지 끝내야 마음이 놓인다." },
];
