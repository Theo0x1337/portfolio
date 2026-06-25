import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LogoSpinner from './components/LogoSpinner';
import './App.css';

// Routes are code-split so navigating between pages loads each chunk on demand,
// showing the rotating brand glyph while it arrives.
const Home = lazy(() => import('./pages/Home'));
const Experience = lazy(() => import('./pages/Experience'));
const Blog = lazy(() => import('./pages/Blog'));
const Admin = lazy(() => import('./pages/Admin'));

function App() {
  return (
    <Router>
      <Navbar />

      <main className="main-content" id="main-content-layout">
        <Suspense fallback={<LogoSpinner fullscreen />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/experience" element={<Experience />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<Blog />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </Router>
  );
}

export default App;
