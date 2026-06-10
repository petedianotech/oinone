/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PWAPrompt } from './components/PWAPrompt';
import { Home } from './pages/Home';
import { CategoryPage } from './pages/CategoryPage';
import { ArticlePage } from './pages/ArticlePage';
import { About } from './pages/About';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Disclaimer } from './pages/Disclaimer';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { OffersVault } from './pages/OffersVault';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BlogProvider } from './lib/BlogContext';

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
    <div className="flex flex-col min-h-screen bg-[#0a0a0c] text-white">
      {!isAdminPage && <Navbar />}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vault" element={<OffersVault />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy-policy" element={<Privacy />} />
          <Route path="/terms-of-service" element={<Terms />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/:categoryId" element={<CategoryPage />} />
          <Route path="/article/:articleId" element={<ArticlePage />} />
        </Routes>
      </div>
      {!isAdminPage && <Footer />}
      <PWAPrompt />
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

