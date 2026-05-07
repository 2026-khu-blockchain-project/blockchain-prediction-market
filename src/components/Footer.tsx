export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/70">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-5 py-8 text-sm text-slate-500 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-black text-slate-900">Polymarket Lite</p>
          <p className="mt-1">블록체인 프로젝트용 테스트넷 dApp</p>
        </div>
        <p className="font-semibold">현재 Sepolia 테스트넷 기준으로 동작합니다.</p>
      </div>
    </footer>
  );
}
