import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

function LogoMark() {
  return (
    <svg
      className="navbar-logo-mark"
      viewBox="0 0 64 64"
      width="26"
      height="26"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
        <path d="M16 17 L32 32" />
        <path d="M16 47 L32 32" />
        <path d="M32 32 L48 17" />
        <path d="M32 32 L48 47" />
      </g>
      <g fill="currentColor">
        <circle cx="16" cy="17" r="5" />
        <circle cx="16" cy="47" r="5" />
        <circle cx="32" cy="32" r="6.5" />
        <circle cx="48" cy="17" r="5" />
        <circle cx="48" cy="47" r="5" />
      </g>
    </svg>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <nav className="navbar" id="site-nav">
      <div className="container navbar-container">
        <NavLink to="/" className="navbar-logo" id="nav-logo-link" onClick={close}>
          <LogoMark />
          theo0x1337<span>.dev</span>
        </NavLink>

        <button
          className="navbar-toggle"
          id="nav-mobile-toggle"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen(prev => !prev)}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className={`navbar-menu${isOpen ? ' open' : ''}`} id="nav-desktop-menu">
          <NavLink to="/" className="navbar-link" id="nav-home-link" onClick={close}>
            Home
          </NavLink>
          <NavLink to="/experience" className="navbar-link" id="nav-exp-link" onClick={close}>
            Experience
          </NavLink>
          <NavLink to="/blog" className="navbar-link" id="nav-blog-link" onClick={close}>
            Blog
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
