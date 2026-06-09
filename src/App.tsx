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

export default function App() {
  return (
    <BlogProvider>
      <Router>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
          <Navbar />
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/:categoryId" element={<CategoryPage />} />
              <Route path="/article/:articleId" element={<ArticlePage />} />
            </Routes>
          </div>
          <Footer />
          <PWAPrompt />
        </div>
      </Router>
    </BlogProvider>
  );
}

