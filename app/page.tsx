export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-6">
      
      <h1 className="text-5xl font-bold mb-6">
        moimrank 🔥 (논알콜록 화이팅)
      </h1>

      <p className="text-xl text-center mb-8 max-w-xl">
        우리 모임에서 누가 제일 잘 맞을까?
        <br />
        닉네임과 MBTI만 입력하면 케미 랭킹을 확인할 수 있어요.
      </p>

      <div className="flex gap-4">
        <button className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition">
          모임 만들기
        </button>

        <button className="bg-indigo-800 px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition">
          모임 입장하기
        </button>
      </div>

    </main>
  );
}
