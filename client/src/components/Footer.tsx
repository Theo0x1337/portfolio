import { Mail, Github, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer" id="site-footer">
      <div className="container footer-container">
        <p>&copy; {new Date().getFullYear()} Theo Bernardin. Lead Data Engineer. Built with React, TypeScript, and Node.js.</p>
        <div className="footer-links" id="footer-social-links">
          <a href="mailto:contact@theo0x1337.dev" className="footer-link" aria-label="Email" title="Email">
            <Mail size={18} />
          </a>
          <a href="https://github.com/Theo0x1337" target="_blank" rel="noopener noreferrer" className="footer-link" aria-label="GitHub" title="GitHub">
            <Github size={18} />
          </a>
          <a href="https://www.linkedin.com/in/theo-bernardin/" target="_blank" rel="noopener noreferrer" className="footer-link" aria-label="LinkedIn" title="LinkedIn">
            <Linkedin size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
