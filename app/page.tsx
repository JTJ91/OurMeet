export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center px-6">
      
      {/* 로고 */}
      <h1 className="text-4xl font-bold mb-4 tracking-tight">
        moimrank
      </h1>

      {/* 설명 */}
      <p className="text-lg text-gray-600 text-center max-w-xl mb-10 leading-relaxed">
        우리 모임에서 누가 제일 잘 맞을까?
        <br />
        닉네임과 MBTI만 입력하면
        <br />
        모임 내 케미 랭킹을 확인할 수 있어요.
      </p>

      {/* 버튼 */}
      <div className="flex gap-4">
        <button className="bg-black text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
          모임 만들기
        </button>

        <button className="border border-gray-300 px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-100 transition">
          모임 입장하기
        </button>
      </div>

      {/* 하단 설명 */}
      <div className="mt-16 text-xs text-gray-400">
        친구들과 재미로 즐기는 관계 분석 서비스
      </div>

    </main>
  );
}
