import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import "./css/GameSearch.css";
import { useLanguage } from '../contexts/LanguageContext'; // Import useLanguage

const GameSearch = ({ onResults, initialQuery }) => {
  const [title, setTitle] = useState(initialQuery || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const suggestionRefs = useRef([]);

  const { language } = useLanguage(); // Use the language context

  // Define text strings for localization
  const text = {
    en: {
      searchPlaceholder: "Search for a game",
      searching: "Searching...",
      searchButton: "Search",
      noSteamAppIdFound: "No Steam App ID found", // Although not directly used here, good to keep consistent
      failedToFetchSteamData: "Failed to fetch Steam data" // Although not directly used here, good to keep consistent
    },
    fr: {
      searchPlaceholder: "Rechercher un jeu",
      searching: "Recherche...",
      searchButton: "Rechercher",
      noSteamAppIdFound: "Aucun ID d'application Steam trouvé",
      failedToFetchSteamData: "Échec de la récupération des données Steam"
    }
  };

  const t = text[language]; // Get the translation object for the current language

  // Debounced search for suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (title.trim() && title.length > 1) {
        fetchSuggestions(title);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [title]);

  const fetchSuggestions = async (query) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/igdb/${query}`);
      const topResults = response.data.slice(0, 5);
      setSuggestions(topResults);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (searchQuery = title) => {
    const queryToUse = searchQuery || title;
    if (!queryToUse.trim()) return;
    
    setShowSuggestions(false);
    
    try {
      const igdb = await axios.get(`http://localhost:5000/api/igdb/${queryToUse}`);
      onResults(igdb.data, queryToUse);
    } catch (err) {
      console.error(err);
      onResults([], queryToUse);
    }
  };

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSearch(initialQuery);
    }
  }, [initialQuery, handleSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      selectSuggestion(suggestions[selectedIndex]);
    } else {
      handleSearch();
    }
  };

  const selectSuggestion = (suggestion) => {
    setTitle(suggestion.name);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    handleSearch(suggestion.name);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
      case 'Tab':
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          e.preventDefault();
          selectSuggestion(suggestions[selectedIndex]);
        }
        break;
      default:
        // Allow other keys to function normally
        break;
    }
  };

  const handleInputChange = (e) => {
    setTitle(e.target.value);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  return (
    <div className="game-search-container">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="search-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            placeholder={t.searchPlaceholder}
            value={title}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="game-search-input"
            autoComplete="off"
          />
          
          {showSuggestions && (suggestions.length > 0 || isLoading) && (
            <div className="suggestions-dropdown">
              {isLoading ? (
                <div className="suggestion-item loading">
                  {t.searching} {/* Localized */}
                </div>
              ) : (
                suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.id}
                    ref={el => suggestionRefs.current[index] = el}
                    className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                    onClick={() => selectSuggestion(suggestion)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="suggestion-name">{suggestion.name}</div>
                    {suggestion.first_release_date && (
                      <div className="suggestion-year">
                        {new Date(suggestion.first_release_date * 1000).getFullYear()}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        
        <button 
          type="submit"
          className="game-search-button"
          disabled={!title.trim()}
        >
          {t.searchButton} {/* Localized */}
        </button>
      </form>
    </div>
  );
};

export default GameSearch;