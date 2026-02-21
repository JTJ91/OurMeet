export type MbtiTestLocale = "ko" | "en" | "ja";

export const RESULT_NARRATIVE_TITLE: Record<MbtiTestLocale, string> = {
  ko: "유형 현실 포인트",
  en: "Type Reality Note",
  ja: "タイプのリアルポイント",
};

const RESULT_NARRATIVES: Record<MbtiTestLocale, Record<string, readonly string[]>> = {
  ko: {
    INTJ: [
      "본인은 차분하고 전략적인 사람이라고 생각하지만, 주변에서는 그냥 차갑고 자기 확신 강한 사람으로 보일 때가 많아요.",
      "설명하기 귀찮아서 말 안 하는 건데, 남들은 소통 안 한다고 느껴요.",
    ],
    INTP: [
      "논리적으로는 거의 완벽에 가까운데, 실행은 자꾸 미뤄요.",
      "생각은 많은데 행동이 느려서 스스로도 답답해요.",
    ],
    ENTJ: [
      "능력 있고 추진력 강한 건 맞아요.",
      "그런데 사람보다 결과가 더 중요해 보일 때가 많아요.",
      "본인은 효율이라고 생각하지만 상대는 상처받아요.",
    ],
    ENTP: [
      "말은 잘하고 머리도 빨라요.",
      "근데 굳이 안 해도 될 말까지 해서 분위기를 흔들어요.",
      "토론이라 쓰고 승부욕이라 읽어요.",
    ],
    INFJ: [
      "배려 깊은 척하지만 사실 사람을 많이 재요.",
      "한 번 실망하면 티 안 내고 조용히 멀어져요.",
      "기회를 여러 번 주는 것 같지만 속으로는 이미 정리했어요.",
    ],
    INFP: [
      "마음은 정말 착한데, 현실이 마음처럼 안 움직여서 자주 상처받아요.",
      "겉으로는 괜찮다고 하지만 속으로는 오래 곱씹어요.",
    ],
    ENFJ: [
      "남들 감정은 잘 챙기는데, 본인 감정은 방치해요.",
      "그리고 아무도 몰라주면 은근히 서운해요.",
      "리더 아니라고 말하면서 결국 주도권 잡고 있어요.",
    ],
    ENFP: [
      "에너지는 넘치는데 집중은 오래 못 가요.",
      "처음엔 뜨겁고 나중엔 흐려져요.",
      "관심이 식는 속도가 빠른 편이에요.",
    ],
    ISTJ: [
      "책임감은 강한데 융통성은 약해요.",
      "본인 기준에서 벗어나면 답답해해요.",
      "틀린 걸 보면 못 참는 편이에요.",
    ],
    ISFJ: [
      "다 참고 다 배려해요.",
      "그런데 서운한 건 다 기억해요.",
      "표현을 안 해서 괜찮은 줄 알지만 사실 쌓이고 있어요.",
    ],
    ESTJ: [
      "말이 직설적이에요.",
      "본인은 솔직하다고 생각하지만 상대는 상처받아요.",
      "감정보다는 논리와 결과가 우선이에요.",
    ],
    ESFJ: [
      "사람 관계에 진심이에요.",
      "대신 남 시선을 많이 의식해요.",
      "갈등 상황에서 자기 감정은 뒤로 미루는 경우가 많아요.",
    ],
    ISTP: [
      "감정 표현이 적어서 무심해 보여요.",
      "관심 없는 건 진짜로 관심이 없어요.",
      "필요 이상으로 깊게 관여하지 않아요.",
    ],
    ISFP: [
      "순해 보이지만 기분 영향 많이 받아요.",
      "마음이 식으면 설명 없이 조용히 멀어져요.",
      "표현은 적고 감정은 깊어요.",
    ],
    ESTP: [
      "일단 행동부터 해요.",
      "생각은 그다음이에요.",
      "위험을 크게 위험으로 안 느낄 때가 있어요.",
    ],
    ESFP: [
      "분위기와 재미가 중요해요.",
      "재미없으면 집중이 확 떨어져요.",
      "감정이 얼굴에 잘 드러나요.",
    ],
  },
  en: {
    INTJ: [
      "You see yourself as calm and strategic, but people often read you as cold and overly self-assured.",
      "You stay quiet because explaining everything feels tiring, but others take it as poor communication.",
    ],
    INTP: [
      "Your logic is close to flawless, but execution keeps getting delayed.",
      "Your mind is full of ideas, yet your slow action frustrates even you.",
    ],
    ENTJ: [
      "You are capable and highly driven.",
      "But at times, results seem to matter more to you than people.",
      "You call it efficiency, while others experience it as hurt.",
    ],
    ENTP: [
      "You speak well and think fast.",
      "But you sometimes say what did not need to be said and shake the mood.",
      "It looks like debate, but often it is competitiveness.",
    ],
    INFJ: [
      "You seem deeply considerate, but you quietly evaluate people a lot.",
      "Once disappointed, you distance yourself without showing it.",
      "It looks like multiple chances, but inside you may have already moved on.",
    ],
    INFP: [
      "You are genuinely kind, but reality does not move the way your heart wants, so you get hurt often.",
      "You say you are fine on the outside, but you replay it inside for a long time.",
    ],
    ENFJ: [
      "You care for others' feelings well, but neglect your own.",
      "When no one notices, you feel quietly disappointed.",
      "You say you are not the leader, but end up holding the lead anyway.",
    ],
    ENFP: [
      "Your energy is high, but your focus does not last long.",
      "You start hot, then fade later.",
      "Your interest can cool down quickly.",
    ],
    ISTJ: [
      "You have strong responsibility, but low flexibility.",
      "When things move outside your standards, you get frustrated.",
      "You have a hard time letting obvious mistakes slide.",
    ],
    ISFJ: [
      "You endure and care for everyone.",
      "But you remember every hurt feeling.",
      "Because you do not express it, people think you are fine while it keeps piling up.",
    ],
    ESTJ: [
      "Your words are direct.",
      "You see it as honesty, but others can feel wounded.",
      "Logic and results come before emotions.",
    ],
    ESFJ: [
      "You are sincere about relationships.",
      "At the same time, you are very aware of how others see you.",
      "In conflict, you often put your own emotions on hold.",
    ],
    ISTP: [
      "You show little emotion, so you can seem detached.",
      "If you are not interested, you are truly not interested.",
      "You do not get deeply involved beyond what is necessary.",
    ],
    ISFP: [
      "You look gentle, but your mood affects you a lot.",
      "Once your heart cools, you quietly distance yourself without much explanation.",
      "You express little, but feel deeply.",
    ],
    ESTP: [
      "You act first.",
      "Thinking comes after.",
      "At times, you do not feel risk as strongly as others do.",
    ],
    ESFP: [
      "Mood and fun matter to you.",
      "If it is not fun, your focus drops fast.",
      "Your emotions show clearly on your face.",
    ],
  },
  ja: {
    INTJ: [
      "自分では冷静で戦略的だと思っていても、周囲には冷たく自信が強すぎる人に見られがちです。",
      "説明するのが面倒で黙っているだけなのに、相手にはコミュニケーション不足だと受け取られます。",
    ],
    INTP: [
      "論理はほぼ完璧に近いのに、実行はつい先延ばしになりがちです。",
      "考えは多いのに行動が遅く、自分でももどかしくなります。",
    ],
    ENTJ: [
      "能力が高く推進力があるのは確かです。",
      "ただ、人より結果を優先しているように見える場面が多いです。",
      "本人は効率だと思っていても、相手は傷つくことがあります。",
    ],
    ENTP: [
      "話し上手で頭の回転も速いです。",
      "でも言わなくてもいいことまで言ってしまい、空気を揺らすことがあります。",
      "討論というより、勝負欲が前に出やすいです。",
    ],
    INFJ: [
      "配慮深く見えても、実は人をかなり見極めています。",
      "一度失望すると、表に出さず静かに距離を取ります。",
      "何度も機会を与えているようで、内心ではすでに整理していることがあります。",
    ],
    INFP: [
      "本当に優しい心を持っていますが、現実が思い通りに動かず傷つきやすいです。",
      "表では平気そうでも、内面では長く反芻しやすいです。",
    ],
    ENFJ: [
      "他人の感情はよく気にかけますが、自分の感情は後回しにしがちです。",
      "そして誰にも気づかれないと、ひそかに寂しさを感じます。",
      "リーダーではないと言いながら、結局主導権を握っていることが多いです。",
    ],
    ENFP: [
      "エネルギーは高いのに、集中は長く続きにくいです。",
      "最初は熱くても、後半で薄れやすいです。",
      "興味が冷めるスピードが速い傾向があります。",
    ],
    ISTJ: [
      "責任感は強い一方で、柔軟性は低めです。",
      "自分の基準から外れると、強いもどかしさを感じます。",
      "間違いを見ると見過ごしにくいタイプです。",
    ],
    ISFJ: [
      "我慢して配慮を重ねます。",
      "ただ、寂しさや引っかかりは全部覚えています。",
      "言葉にしないので平気に見えても、内側では積み重なっています。",
    ],
    ESTJ: [
      "言い方が率直です。",
      "本人は正直なつもりでも、相手は傷つくことがあります。",
      "感情より論理と結果を優先しやすいです。",
    ],
    ESFJ: [
      "人間関係に本気です。",
      "その分、人の目を強く意識しやすいです。",
      "対立場面では自分の感情を後ろに回すことが多いです。",
    ],
    ISTP: [
      "感情表現が少ないため、無関心に見られがちです。",
      "興味がないことには本当に興味がありません。",
      "必要以上に深く関わろうとはしません。",
    ],
    ISFP: [
      "穏やかに見えても、気分の影響を受けやすいです。",
      "気持ちが冷めると、説明せず静かに距離を取ることがあります。",
      "表現は少なくても、感情は深いです。",
    ],
    ESTP: [
      "まず行動します。",
      "考えるのはその後です。",
      "ときどき、危険を危険として強く感じないことがあります。",
    ],
    ESFP: [
      "場の雰囲気と楽しさを重視します。",
      "楽しくないと集中が一気に落ちます。",
      "感情が表情に出やすいです。",
    ],
  },
};

export function getResultNarrative(locale: MbtiTestLocale, mbti: string) {
  return RESULT_NARRATIVES[locale][mbti];
}
