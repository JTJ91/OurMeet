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
  { id: "q01", axis: "EI", pole: "E", text: "낯선 사람에게 먼저 말을 건다." },
  { id: "q02", axis: "EI", pole: "I", text: "낯선 사람에게 먼저 말 걸기 어렵다." },
  { id: "q03", axis: "EI", pole: "E", text: "생각이 덜 정리돼도 먼저 말한다.", checkPair: "c1", checkKind: "OPPOSITE" },
  { id: "q04", axis: "EI", pole: "I", text: "생각을 정리한 뒤에 말한다.", checkPair: "c1", checkKind: "OPPOSITE" },
  { id: "q05", axis: "EI", pole: "E", text: "사람들과 있으면 힘이 난다." },
  { id: "q06", axis: "EI", pole: "I", text: "혼자 있어야 힘이 난다." },
  { id: "q07", axis: "EI", pole: "E", text: "여럿이 있으면 말이 많아진다." },
  { id: "q08", axis: "EI", pole: "I", text: "여럿이 있으면 말이 줄어든다." },
  { id: "q09", axis: "EI", pole: "E", text: "약속이 생기면 기분이 좋아진다." },
  { id: "q10", axis: "EI", pole: "I", text: "약속이 많아지면 피곤하다." },
  { id: "q11", axis: "EI", pole: "E", text: "처음 보는 사람에게 질문을 잘 한다." },
  { id: "q12", axis: "EI", pole: "I", text: "처음 보는 사람에게 질문하기 망설여진다." },
  { id: "q13", axis: "EI", pole: "E", text: "궁금하면 바로 물어본다." },
  { id: "q14", axis: "EI", pole: "I", text: "궁금하면 먼저 스스로 찾아본다." },
  { id: "q15", axis: "EI", pole: "E", text: "갑자기 생긴 약속도 잘 나간다." },

  // =========================
  // NS (15)
  // =========================
  { id: "q16", axis: "NS", pole: "N", text: "설명을 들으면 큰 뜻부터 본다." },
  { id: "q17", axis: "NS", pole: "S", text: "설명을 들으면 정확한 내용부터 본다." },
  { id: "q18", axis: "NS", pole: "N", text: "한 가지를 보면 다른 가능성이 떠오른다." },
  { id: "q19", axis: "NS", pole: "S", text: "한 가지를 보면 지금 사실부터 본다." },
  { id: "q20", axis: "NS", pole: "N", text: "새 일을 하면 먼저 아이디어를 떠올린다." },
  { id: "q21", axis: "NS", pole: "S", text: "새 일을 하면 먼저 방법을 확인한다." },
  { id: "q22", axis: "NS", pole: "N", text: "말 속의 숨은 의미를 자주 생각한다.", checkPair: "c2", checkKind: "OPPOSITE" },
  { id: "q23", axis: "NS", pole: "S", text: "말은 들은 그대로 받아들인다.", checkPair: "c2", checkKind: "OPPOSITE" },
  { id: "q24", axis: "NS", pole: "N", text: "앞으로 생길 일을 자주 상상한다." },
  { id: "q25", axis: "NS", pole: "S", text: "지금 해야 할 일에 더 집중한다." },
  { id: "q26", axis: "NS", pole: "N", text: "새로운 방법을 찾는 게 재미있다." },
  { id: "q27", axis: "NS", pole: "S", text: "검증된 방법을 쓰는 게 편하다." },
  { id: "q28", axis: "NS", pole: "N", text: "정답이 있어도 다른 답을 떠올린다." },
  { id: "q29", axis: "NS", pole: "S", text: "정답이 있으면 그대로 따르는 게 좋다." },
  { id: "q30", axis: "NS", pole: "N", text: "'만약에'라는 생각을 자주 한다." },

  // =========================
  // TF (15)
  // =========================
  { id: "q31", axis: "TF", pole: "T", text: "문제가 생기면 해결책부터 찾는다." },
  { id: "q32", axis: "TF", pole: "F", text: "문제가 생기면 마음부터 살핀다." },
  { id: "q33", axis: "TF", pole: "T", text: "판단할 때 기준이 분명해야 한다." },
  { id: "q34", axis: "TF", pole: "F", text: "판단할 때 사람 마음도 중요하다." },
  { id: "q35", axis: "TF", pole: "T", text: "의견이 다르면 맞는 이유부터 말한다." },
  { id: "q36", axis: "TF", pole: "F", text: "의견이 다르면 기분 상하지 않게 말한다." },
  { id: "q37", axis: "TF", pole: "T", text: "친한 사이여도 잘못은 바로 말한다." },
  { id: "q38", axis: "TF", pole: "F", text: "친한 사이일수록 말투를 더 조심한다." },
  { id: "q39", axis: "TF", pole: "T", text: "설명을 들으면 논리가 맞는지 본다." },
  { id: "q40", axis: "TF", pole: "F", text: "설명을 들으면 상대 마음을 먼저 본다." },
  { id: "q41", axis: "TF", pole: "T", text: "칭찬보다 고칠 점을 듣는 게 좋다." },
  { id: "q42", axis: "TF", pole: "F", text: "고칠 점도 부드럽게 말하는 게 좋다." },
  { id: "q43", axis: "TF", pole: "T", text: "결정할 때 공정한 규칙을 먼저 본다." },
  { id: "q44", axis: "TF", pole: "F", text: "결정할 때 각자 사정을 먼저 본다." },
  { id: "q45", axis: "TF", pole: "T", text: "급하면 감정보다 결론이 먼저다." },

  // =========================
  // JP (15)
  // =========================
  { id: "q46", axis: "JP", pole: "J", text: "약속 시간은 미리 정해야 편하다." },
  { id: "q47", axis: "JP", pole: "P", text: "약속 시간은 나중에 정해도 괜찮다." },
  { id: "q48", axis: "JP", pole: "J", text: "일을 시작하기 전에 계획을 세운다." },
  { id: "q49", axis: "JP", pole: "P", text: "일은 하면서 계획을 바꾼다." },
  { id: "q50", axis: "JP", pole: "J", text: "마감보다 먼저 끝내면 마음이 편하다." },
  { id: "q51", axis: "JP", pole: "P", text: "마감이 가까워야 집중이 잘 된다." },
  { id: "q52", axis: "JP", pole: "J", text: "할 일을 적어두고 체크한다." },
  { id: "q53", axis: "JP", pole: "P", text: "할 일은 상황에 따라 바로 정한다." },
  { id: "q54", axis: "JP", pole: "J", text: "결정은 빨리 내리는 편이다.", checkPair: "c3", checkKind: "OPPOSITE" },
  { id: "q55", axis: "JP", pole: "P", text: "결정은 충분히 보고 천천히 내린다.", checkPair: "c3", checkKind: "OPPOSITE" },
  { id: "q56", axis: "JP", pole: "J", text: "정리된 환경에서 더 잘 집중한다." },
  { id: "q57", axis: "JP", pole: "P", text: "조금 어수선해도 집중할 수 있다." },
  { id: "q58", axis: "JP", pole: "J", text: "계획이 갑자기 바뀌면 불편하다." },
  { id: "q59", axis: "JP", pole: "P", text: "계획이 갑자기 바뀌어도 괜찮다." },
  { id: "q60", axis: "JP", pole: "J", text: "시작한 일은 끝내야 마음이 놓인다." },
];
