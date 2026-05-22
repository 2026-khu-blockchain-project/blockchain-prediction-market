import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FlaskConical, Loader2, RefreshCw } from 'lucide-react';
import { isPolyPredictConfigured } from '../contracts/polyPredict';
import { usePolyPredictDemo } from '../hooks/usePolyPredictDemo';
import {
  AlertMessage,
  buttonStyles,
  cn,
  fieldStyles,
  PageShell,
  SectionHeader,
  StatusBadge,
  SurfaceCard,
} from '../components/ui';

export function PracticePage() {
  const demo = usePolyPredictDemo();
  const [mintAmt, setMintAmt] = useState('10');
  const [approveAmt, setApproveAmt] = useState('100');

  const deadlinePassed =
    Number(demo.market.deadline) <= Math.floor(Date.now() / 1000);
  const stateLabel = demo.market.state === 0 ? '진행 중' : demo.market.state === 2 ? '정산 완료' : String(demo.market.state);

  return (
    <PageShell>
      <SectionHeader
        eyebrow="연습 모드"
        title="CTF 예측 시장 연습"
        description="지갑 없이 USDC·YES/NO 포지션 발행·정산·클레임 흐름을 시뮬레이션합니다. proj 연습 모드와 동일한 로직입니다."
        action={
          <div className="flex flex-wrap gap-2">
            <Link className={buttonStyles('secondary')} to="/markets">
              온체인 시장 목록
            </Link>
            {isPolyPredictConfigured && (
              <Link className={buttonStyles('primary')} to="/markets/0">
                체인 모드 상세
              </Link>
            )}
          </div>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <StatusBadge tone="admin">
          <FlaskConical className="mr-1 inline h-3.5 w-3.5" />
          연습 전용
        </StatusBadge>
        <StatusBadge tone={demo.market.state === 2 ? 'resolved' : 'open'}>{stateLabel}</StatusBadge>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <SurfaceCard className="p-6">
          <h2 className="text-lg font-black text-slate-950">연결 · 역할</h2>
          <p className="mt-2 text-sm text-slate-600">
            데모 지갑을 연결한 뒤 일반 사용자 또는 관리자(owner) 역할을 선택하세요.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {!demo.connected ? (
              <button
                className={buttonStyles('primary')}
                disabled={demo.busy}
                type="button"
                onClick={() => void demo.connect()}
              >
                {demo.busy && <Loader2 className="h-4 w-4 animate-spin" />}
                데모 지갑 연결
              </button>
            ) : (
              <button className={buttonStyles('secondary')} type="button" onClick={demo.disconnect}>
                연결 해제
              </button>
            )}
            <button
              className={cn(
                buttonStyles('secondary'),
                demo.role === 'user' ? 'ring-2 ring-emerald-300' : '',
              )}
              disabled={!demo.connected}
              type="button"
              onClick={() => demo.setRole('user')}
            >
              일반 사용자
            </button>
            <button
              className={cn(
                buttonStyles('secondary'),
                demo.role === 'owner' ? 'ring-2 ring-amber-300' : '',
              )}
              disabled={!demo.connected}
              type="button"
              onClick={() => demo.setRole('owner')}
            >
              관리자
            </button>
          </div>

          {demo.connected && (
            <p className="mt-4 text-xs font-bold text-slate-500">
              주소: {demo.address?.slice(0, 10)}...{demo.address?.slice(-4)}
            </p>
          )}
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <h2 className="text-lg font-black text-slate-950">시장 정보</h2>
          <p className="mt-3 text-xl font-black text-slate-950">{demo.market.question}</p>
          <p className="mt-2 text-sm text-slate-600">{demo.market.description}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="font-bold text-slate-500">담보</dt>
              <dd className="font-black">{demo.formatUsdc(demo.market.totalCollateral)} USDC</dd>
            </div>
            <div>
              <dt className="font-bold text-slate-500">내 YES / NO</dt>
              <dd className="font-black">
                {demo.formatUsdc(demo.yesBal)} / {demo.formatUsdc(demo.noBal)}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-slate-500">가상 USDC</dt>
              <dd className="font-black">{demo.formatUsdc(demo.usdcBal)}</dd>
            </div>
            <div>
              <dt className="font-bold text-slate-500">마감</dt>
              <dd className="font-black">{deadlinePassed ? '마감됨' : '진행 중'}</dd>
            </div>
          </dl>
        </SurfaceCard>
      </div>

      {demo.error && (
        <div className="mt-6">
          <AlertMessage tone="error">{demo.error}</AlertMessage>
        </div>
      )}

      <SurfaceCard className="mt-6 p-6">
        <h2 className="text-lg font-black text-slate-950">액션</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">USDC 승인 (연습)</span>
            <input
              className={cn(fieldStyles, 'mt-2')}
              value={approveAmt}
              onChange={(e) => setApproveAmt(e.target.value)}
            />
            <button
              className={cn(buttonStyles('secondary'), 'mt-2 w-full')}
              disabled={!demo.connected || demo.busy}
              type="button"
              onClick={() => void demo.approve(approveAmt)}
            >
              승인 시뮬레이션
            </button>
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">포지션 발행 (mintShares)</span>
            <input
              className={cn(fieldStyles, 'mt-2')}
              value={mintAmt}
              onChange={(e) => setMintAmt(e.target.value)}
            />
            <button
              className={cn(buttonStyles('primary'), 'mt-2 w-full bg-emerald-600 hover:bg-emerald-700')}
              disabled={!demo.connected || demo.busy || demo.role !== 'user'}
              type="button"
              onClick={() => void demo.mint(mintAmt)}
            >
              YES·NO 동시 발행
            </button>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className={buttonStyles('secondary')}
            disabled={!demo.connected || demo.busy}
            type="button"
            onClick={demo.demoSkipDeadline}
          >
            마감 시각을 지금으로
          </button>
          <button
            className={buttonStyles('secondary')}
            disabled={!demo.connected || !demo.isOwner || demo.busy}
            type="button"
            onClick={() => void demo.resolve('YES')}
          >
            YES로 정산
          </button>
          <button
            className={buttonStyles('secondary')}
            disabled={!demo.connected || !demo.isOwner || demo.busy}
            type="button"
            onClick={() => void demo.resolve('NO')}
          >
            NO로 정산
          </button>
          <button
            className={buttonStyles('primary')}
            disabled={!demo.connected || demo.role !== 'user' || demo.busy}
            type="button"
            onClick={() => void demo.claim()}
          >
            보상 청구
          </button>
          <button className={buttonStyles('secondary')} type="button" onClick={demo.resetDemo}>
            <RefreshCw className="h-4 w-4" />
            초기화
          </button>
        </div>
      </SurfaceCard>

      <div className="mt-6">
      <AlertMessage tone="info">
        <span className="inline-flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          패리뮤추얼 풀 베팅은 <Link className="font-bold underline" to="/pool">풀 배팅 마켓</Link>
          페이지에서 연습·체인 모드로 이용할 수 있습니다.
        </span>
      </AlertMessage>
      </div>
    </PageShell>
  );
}
