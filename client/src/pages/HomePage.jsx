import "./css/HomePage.css";
import { useState } from 'react';

const HomePage = ({ setCurrentPage, setInitialSearchQuery }) => {
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="homepage">
      <h1>
        Welcome to <span className="highlight">Game Stats Hub</span>
      </h1>
      <p>Discover game stats, reviews, and more.</p>
      
      <div className="search-container">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            className="search-input"
            placeholder="Search for games, reviews, or stats..."
            value={searchQuery}
            onChange={handleInputChange}
          />
          <button type="submit" className="search-button">
            Search
            <span className="search-icon"> 🔍</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default HomePage;