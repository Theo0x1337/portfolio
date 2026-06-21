import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <nav className="navbar" id="site-nav">
      <div className="container navbar-container">
        <NavLink to="/" className="navbar-logo" id="nav-logo-link" onClick={close}>
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
