import { useEffect, useRef, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn, SurfaceCard } from './ui';

type MarketChartProps = {
  candidateAChance: number;
  candidateBChance: number;
  outcomeAName: string;
  outcomeBName: string;
};

interface ChartDataPoint {
  time: string;
  yes: number;
  no: number;
}

export function MarketChart({
  candidateAChance,
  candidateBChance,
  outcomeAName,
  outcomeBName,
}: MarketChartProps) {
  const yesVal = Number(candidateAChance.toFixed(1));
  const noVal = Number(candidateBChance.toFixed(1));

  // 초기 과거 가상 거래 데이터
  const [history, setHistory] = useState<ChartDataPoint[]>([
    { time: '22:10', yes: 48, no: 52 },
    { time: '22:15', yes: 52, no: 48 },
    { time: '22:20', yes: 50, no: 50 },
    { time: '22:25', yes: 47, no: 53 },
    { time: '22:30', yes: 51, no: 49 },
  ]);

  const prevPriceRef = useRef<number>(yesVal);
  const isFirstRender = useRef<boolean>(true);

  useEffect(() => {
    if (isFirstRender.current) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      setHistory((prev) => [
        ...prev,
        { time: timeStr, yes: yesVal, no: noVal }
      ]);
      prevPriceRef.current = yesVal;
      isFirstRender.current = false;
      return;
    }

    if (prevPriceRef.current !== yesVal) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      setHistory((prev) => {
        const base = prev.length >= 15 ? prev.slice(1) : prev;
        return [
          ...base,
          {
            time: timeStr,
            yes: yesVal,
            no: noVal,
          },
        ];
      });
      prevPriceRef.current = yesVal;
    }
  }, [yesVal, noVal]);

  return (
    <SurfaceCard className="overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-black text-slate-950">실시간 가격 추이 및 확률 분포</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            현재 온체인 예치금 비율을 기준으로 실시간 계산한 가격 추이(센트 ¢)입니다.
          </p>
        </div>
      </div>

      <div className="p-6 bg-slate-950 text-white rounded-b-3xl">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">실시간 가격 추이 (센트 ¢)</span>
          <div className="flex gap-4 text-xs font-bold">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> {outcomeAName} (YES)
            </span>
            <span className="flex items-center gap-1 text-blue-400">
              <span className="h-2 w-2 rounded-full bg-blue-500" /> {outcomeBName} (NO)
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* 차트 영역 */}
          <div className="h-[220px] w-full md:w-3/4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#475569" fontSize={10} tickLine={false} axisLine={false} orientation="right" unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                  formatter={(value, name) => [`${value}%`, name === 'yes' ? `${outcomeAName} 가격` : `${outcomeBName} 가격`]}
                />
                <Line
                  type="monotone"
                  dataKey="yes"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="no"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 우측 실시간 수치판 영역 */}
          <div className="flex w-full md:w-1/4 flex-row md:flex-col justify-around md:justify-center md:gap-6 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
            <div className="text-center md:text-left">
              <span className="text-xs font-bold text-slate-400 block mb-1">{outcomeAName}</span>
              <div className="flex items-baseline justify-center md:justify-start gap-1">
                <span className="text-3xl font-black text-emerald-400">{yesVal}%</span>
                <span className="text-xs font-bold text-slate-500">({yesVal}¢)</span>
              </div>
            </div>
            <div className="text-center md:text-left mt-0 md:mt-4">
              <span className="text-xs font-bold text-slate-400 block mb-1">{outcomeBName}</span>
              <div className="flex items-baseline justify-center md:justify-start gap-1">
                <span className="text-3xl font-black text-blue-400">{noVal}%</span>
                <span className="text-xs font-bold text-slate-500">({noVal}¢)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
