import { useEffect, useState } from 'react';
import { FiGithub, FiMenu, FiX, FiMoon, FiSun } from 'react-icons/fi';
import logo from '../assets/logo.svg';

function Navbar({ theme, onToggleTheme }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        <a className="navbar__brand" href="#about" onClick={closeMenu}>
          <img className="navbar__logo" src={logo} alt="Page Pulse" />
          <span>Page Pulse</span>
        </a>

        <nav className={`navbar__menu ${isMenuOpen ? 'navbar__menu--open' : ''}`} aria-label="Primary navigation">
          <a className="navbar__link" href="#about" onClick={closeMenu}>
            Home
          </a>
          <a className="navbar__link" href="#audit-form" onClick={closeMenu}>
            About
          </a>
          <a className="navbar__link" href="https://github.com" target="_blank" rel="noreferrer" onClick={closeMenu}>
            <FiGithub aria-hidden="true" />
            GitHub
          </a>
          <button type="button" className="button button--ghost navbar__theme-button" onClick={onToggleTheme}>
            {theme === 'dark' ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
            <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>
        </nav>

        <div className="navbar__actions">
          <button type="button" className="button button--ghost navbar__theme-button" onClick={onToggleTheme} aria-label="Toggle dark mode">
            {theme === 'dark' ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
          </button>
          <button
            type="button"
            className="navbar__toggle"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            {isMenuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div className={`navbar__mobile-panel ${isMenuOpen ? 'navbar__mobile-panel--open' : ''}`} id="mobile-navigation">
        <a className="navbar__link" href="#about" onClick={closeMenu}>
          Home
        </a>
        <a className="navbar__link" href="#audit-form" onClick={closeMenu}>
          About
        </a>
        <a className="navbar__link" href="https://github.com" target="_blank" rel="noreferrer" onClick={closeMenu}>
          <FiGithub aria-hidden="true" />
          GitHub
        </a>
      </div>
    </header>
  );
}

export default Navbar;
