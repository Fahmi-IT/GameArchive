import './css/Navbar.css';
import { useLanguage } from '../contexts/LanguageContext';

export default function Navbar({ setCurrentPage }) {
  const { language, toggleLanguage } = useLanguage();

  const navItems = {
    en: [
      { key: "home", label: "Home" },
      { key: "search", label: "Search" },
      { key: "compare", label: "Compare" },
      { key: "faq", label: "FAQ" },
      { key: "review", label: "Leave a Review" },
    ],
    fr: [
      { key: "home", label: "Accueil" },
      { key: "search", label: "Recherche" },
      { key: "compare", label: "Comparer" },
      { key: "faq", label: "FAQ" },
      { key: "review", label: "Laisser un Avis" },
    ]
  };

  return (
    <nav className="navbar-container">
      <div className="nav-center-wrapper">
        <ul className="nav-center">
          {navItems[language].map(({ key, label }) => (
            <li key={key}>
              <button onClick={() => setCurrentPage(key)}>{label}</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="nav-right">
        <button onClick={toggleLanguage} className="language-toggle">
          {language === 'en' ? 'FR' : 'EN'}
        </button>
      </div>
    </nav>
  );
}
