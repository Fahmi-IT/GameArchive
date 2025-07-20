import "./css/HomePage.css";
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const HomePage = ({ setCurrentPage, setInitialSearchQuery }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { language } = useLanguage();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setInitialSearchQuery(searchQuery.trim());
      setCurrentPage('search');
      setSearchQuery('');
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const text = {
    en: {
      welcome: "Welcome to",
      tagline: "Discover game stats, reviews, and more.",
      placeholder: "Search for games, reviews, or stats...",
      search: "Search"
    },
    fr: {
      welcome: "Bienvenue à",
      tagline: "Découvrez les statistiques de jeux, les avis, et plus encore.",
      placeholder: "Recherchez des jeux, des avis ou des statistiques...",
      search: "Rechercher"
    }
  };

  const t = text[language];

  return (
    <div className="homepage">
      <h1>
        {t.welcome} <span className="highlight">Game Stats Hub</span>
      </h1>
      <p>{t.tagline}</p>

      <div className="search-container">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            className="search-input"
            placeholder={t.placeholder}
            value={searchQuery}
            onChange={handleInputChange}
          />
          <button type="submit" className="search-button">
            {t.search}
            <span className="search-icon"> 🔍</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default HomePage;
