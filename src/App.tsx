/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PWAPrompt } from './components/PWAPrompt';
import { OfflineNotification } from './components/OfflineNotification';
import { Home } from './pages/Home';
import { useEffect, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { BlogProvider } from './lib/BlogContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy load non-critical heavy routes for massive chunk speed gains
const CategoryPage = lazy(() => import('./pages/CategoryPage').then(m => ({ default: m.CategoryPage })));
const ArticlePage = lazy(() => import('./pages/ArticlePage').then(m => ({ default: m.ArticlePage })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Privacy = lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })));
const Terms = lazy(() => import('./pages/Terms').then(m => ({ default: m.Terms })));
const Disclaimer = lazy(() => import('./pages/Disclaimer').then(m => ({ default: m.Disclaimer })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const OffersVault = lazy(() => import('./pages/OffersVault').then(m => ({ default: m.OffersVault })));
const Support = lazy(() => import('./pages/Support').then(m => ({ default: m.Support })));

function SuspenseLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#0a0a0c]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-brand-cyan/20 border-t-brand-cyan animate-spin" />
        <span className="text-[10px] uppercase tracking-widest text-[#06b6d4]/60 font-mono">Loading...</span>
      </div>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0c] text-white overflow-x-hidden w-full relative">
      {!isAdminPage && <Navbar />}
      <div className="flex-grow">
        <ErrorBoundary>
          <Suspense fallback={<SuspenseLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/vault" element={<OffersVault />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy-policy" element={<Privacy />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms-of-service" element={<Terms />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/support" element={<Support />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/category/:categoryId" element={<CategoryPage />} />
              <Route path="/:categoryId" element={<CategoryPage />} />
              <Route path="/article/:articleId" element={<ArticlePage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>
      {!isAdminPage && <Footer />}
      <PWAPrompt />
      <OfflineNotification />
    </div>
  );
}

export default function App() {
  return (
    <BlogProvider>
      <Router>
        <ScrollToTop />
        <AppContent />
      </Router>
    </BlogProvider>
  );
}

