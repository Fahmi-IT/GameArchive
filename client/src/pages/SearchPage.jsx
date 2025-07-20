import { useState, useMemo, useEffect } from 'react';
import GameSearch from '../components/GameSearch';
import GameCard from '../components/GameCard';
import GamePopup from '../components/GamePopup';
import { useLanguage } from '../contexts/LanguageContext';
import "./css/SearchPage.css";

const ITEMS_PER_PAGE = 5;

function longestCommonSubsequence(a, b) {
  if (!a || !b) return 0;
  const m = a.length, n = b.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1].toLowerCase() === b[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[m][n];
}

const SearchPage = ({ initialSearchQuery, clearInitialSearchQuery }) => {
  const { language } = useLanguage();

  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortType, setSortType] = useState('rating');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);

  const text = {
    en: {
      title: "Search Games",
      sortBy: "Sort by:",
      sortOptions: {
        rating: "Aggregated Rating",
        release: "Release Date",
        similarity: "Title Similarity"
      },
      noResults: "No results to show.",
      previous: "Previous",
      next: "Next",
      page: "Page"
    },
    fr: {
      title: "Rechercher des jeux",
      sortBy: "Trier par :",
      sortOptions: {
        rating: "Note moyenne",
        release: "Date de sortie",
        similarity: "Similarité du titre"
      },
      noResults: "Aucun résultat à afficher.",
      previous: "Précédent",
      next: "Suivant",
      page: "Page"
    }
  };

  const t = text[language];

  const handleResults = (games, query) => {
    setResults(games);
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleCardClick = (game) => {
    setSelectedGame(game);
  };

  const closePopup = () => {
    setSelectedGame(null);
  };

  useEffect(() => {
    if (initialSearchQuery && clearInitialSearchQuery) {
      setTimeout(() => clearInitialSearchQuery(), 100);
    }
  }, [initialSearchQuery, clearInitialSearchQuery]);

  const sortedResults = useMemo(() => {
    const sorted = [...results];
    if (sortType === 'rating') {
      sorted.sort((a, b) => (b.aggregated_rating || 0) - (a.aggregated_rating || 0));
    } else if (sortType === 'release') {
      sorted.sort((a, b) => (b.first_release_date || 0) - (a.first_release_date || 0));
    } else if (sortType === 'similarity') {
      if (!searchQuery || !searchQuery.trim()) return sorted;
      return sorted
        .map(game => {
          const title = game.name || '';
          const matchLength = longestCommonSubsequence(searchQuery, title);
          const similarity = matchLength / title.length;
          return { game, similarity };
        })
        .filter(({ similarity }) => similarity > 0)
        .sort((a, b) => b.similarity - a.similarity)
        .map(({ game }) => game);
    }
    return sorted;
  }, [results, sortType, searchQuery]);

  const totalPages = Math.ceil(sortedResults.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = sortedResults.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [results, sortType, searchQuery]);

  return (
    <div className="search-page">
      <div className="search-results-container">
        <h2 className="search-title">
          <span className="controller-icon">🎮</span>
          {t.title}
        </h2>

        <GameSearch 
          onResults={handleResults} 
          initialQuery={initialSearchQuery}
        />

        <div className="sort-container">
          <label htmlFor="sort">{t.sortBy}</label>
          <select
            id="sort"
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
          >
            <option value="rating">{t.sortOptions.rating}</option>
            <option value="release">{t.sortOptions.release}</option>
            <option value="similarity">{t.sortOptions.similarity}</option>
          </select>
        </div>

        {sortedResults.length === 0 ? (
          <p className="no-results">{t.noResults}</p>
        ) : (
          <>
            <div className="games-grid">
              {currentItems.map((game, index) => (
                <div key={game.id || index} className="game-card">
                  <GameCard game={game} onClick={() => handleCardClick(game)} />
                </div>
              ))}
            </div>

            <div className="pagination-container">
              <button
                className="pagination-button"
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={currentPage === 1}
              >
                {t.previous}
              </button>

              <span className="page-info">
                {`${t.page} ${currentPage} ${language === 'en' ? 'of' : 'sur'} ${totalPages}`}
              </span>

              <button
                className="pagination-button"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage === totalPages}
              >
                {t.next}
              </button>
            </div>
          </>
        )}
      </div>

      {selectedGame && (
        <GamePopup
          game={selectedGame}
          onClose={closePopup}
        />
      )}
    </div>
  );
};

export default SearchPage;
