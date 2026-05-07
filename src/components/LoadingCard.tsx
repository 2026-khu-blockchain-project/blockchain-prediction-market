import { SurfaceCard } from './ui';

export function LoadingCard({
  label = '온체인 데이터를 불러오는 중입니다...',
}: {
  label?: string;
}) {
  return (
    <SurfaceCard className="overflow-hidden p-6">
      <div className="animate-pulse space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-slate-100" />
          <div className="space-y-2">
            <div className="h-3 w-28 rounded-full bg-slate-100" />
            <div className="h-4 w-44 rounded-full bg-slate-100" />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="h-24 rounded-2xl bg-slate-100" />
          <div className="h-24 rounded-2xl bg-slate-100" />
          <div className="h-24 rounded-2xl bg-slate-100" />
        </div>
        <div className="h-3 w-2/3 rounded-full bg-slate-100" />
      </div>
      <p className="mt-6 text-sm font-bold text-slate-500">{label}</p>
    </SurfaceCard>
  );
}
