import { Activity } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { WalletConnectButton } from './WalletConnectButton';
import { cn } from './ui';

const navItems = [
  { label: '시장', to: '/markets' },
  { label: '연습', to: '/practice' },
  { label: '풀 베팅', to: '/pool' },
  { label: '내 포지션', to: '/portfolio' },
  { label: '이용 방법', to: '/how-it-works' },
  { label: '관리자', to: '/admin' },
];

function navLinkClass(isActive: boolean) {
  return cn(
    'shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-bold transition duration-150 focus:outline-none focus:ring-2 focus:ring-slate-300',
    isActive
      ? 'bg-slate-950 text-white shadow-sm shadow-slate-950/10'
      : 'text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm',
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex min-h-20 w-full max-w-7xl flex-wrap items-center gap-4 px-5 sm:px-6 lg:px-8">
        <NavLink className="flex shrink-0 items-center gap-3" to="/">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm shadow-slate-950/20">
            <Activity className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="whitespace-nowrap text-base font-black leading-5 tracking-tight">
              Polymarket Lite
            </p>
            <p className="mt-0.5 whitespace-nowrap text-xs font-bold text-slate-500">
              Onchain Prediction Market
            </p>
          </div>
        </NavLink>

        <nav className="scrollbar-none order-3 flex w-full items-center gap-1 overflow-x-auto rounded-full bg-slate-100/80 p-1 md:order-none md:ml-auto md:w-auto">
          {navItems.map((item) => (
            <NavLink
              className={({ isActive }) => navLinkClass(isActive)}
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto md:ml-3">
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
