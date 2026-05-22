import { Navigate, Route, Routes } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { NetworkWarning } from './components/NetworkWarning';
import { AdminPage } from './pages/AdminPage';
import { HomePage } from './pages/HomePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { MarketDetailPage } from './pages/MarketDetailPage';
import { MarketsPage } from './pages/MarketsPage';
import { PoolMarketPage } from './pages/PoolMarketPage';
import { PracticePage } from './pages/PracticePage';
import { PortfolioPage } from './pages/PortfolioPage';

export default function App() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />
      <NetworkWarning />
      <div className="min-h-[calc(100vh-8rem)]">
        <Routes>
          <Route element={<HomePage />} path="/" />
          <Route element={<MarketsPage />} path="/markets" />
          <Route element={<MarketDetailPage />} path="/markets/:marketId" />
          <Route element={<PortfolioPage />} path="/portfolio" />
          <Route element={<AdminPage />} path="/admin" />
          <Route element={<HowItWorksPage />} path="/how-it-works" />
          <Route element={<PracticePage />} path="/practice" />
          <Route element={<PoolMarketPage />} path="/pool" />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </div>
      <Footer />
    </main>
  );
}
