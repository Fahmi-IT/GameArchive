import React, { useState, useEffect } from 'react';
import './css/ComparisonCharts.css';
import { useLanguage } from '../contexts/LanguageContext'; // Import useLanguage

const ComparisonCharts = ({ chartData, compareList }) => {
  const [steamSpyData, setSteamSpyData] = useState({});
  const [loading, setLoading] = useState(true);
  const [reviewsViewMode, setReviewsViewMode] = useState('total'); // 'total' or 'percentage'
  const { language } = useLanguage(); // Use the language context

  // Define text strings for localization
  const text = {
    en: {
      loadingSteamData: "Loading enhanced Steam data...",
      // Removed "Game Statistics Comparison"
      vsText: "VS",
      reviewsPerformanceMetrics: "📈 Reviews & Performance Metrics",
      overallPerformanceComparison: "🎯 Overall Performance Comparison",
      // Removed "Detailed Game Information"
      steamReviews: "Steam Reviews",
      avgPlaytimeHrs: "Avg Playtime (hrs)",
      metascore: "Metascore",
      steamPrice: "Steam Price ($)",
      totalNumbers: "Total Numbers",
      percentage: "Percentage",
      positive: "✓ Positive",
      negative: "✗ Negative",
      metric: "Metric",
      better: "Better",
      tie: "Tie",
      // Removed other detailed card fields
      notAvailable: "N/A",
      notSpecified: "Not specified",
      owners: "Owners",
      averagePlaytime: "Average Playtime",
      peakPlayers: "Peak Players",
      price: "Price",
      developers: "Developers",
      publishers: "Publishers",
      releaseDate: "Release Date",
      platforms: "Platforms",
      categories: "Categories",
      genres: "Genres",
      tags: "Tags",
      // For detailed card errors
      steamData: "Steam Data"
    },
    fr: {
      loadingSteamData: "Chargement des données Steam améliorées...",
      // Removed "Game Statistics Comparison"
      vsText: "VS",
      reviewsPerformanceMetrics: "📈 Critiques et Métriques de Performance",
      overallPerformanceComparison: "🎯 Comparaison des Performances Générales",
      // Removed "Detailed Game Information"
      steamReviews: "Critiques Steam",
      avgPlaytimeHrs: "Temps de jeu moyen (heures)",
      metascore: "Metascore",
      steamPrice: "Prix Steam ($)",
      totalNumbers: "Nombres Totaux",
      percentage: "Pourcentage",
      positive: "✓ Positif",
      negative: "✗ Négatif",
      metric: "Métrique",
      better: "Meilleur",
      tie: "Égalité",
      // Removed other detailed card fields
      notAvailable: "N/D",
      notSpecified: "Non spécifié",
      owners: "Propriétaires",
      averagePlaytime: "Temps de jeu moyen",
      peakPlayers: "Joueurs de pointe",
      price: "Prix",
      developers: "Développeurs",
      publishers: "Éditeurs",
      releaseDate: "Date de sortie",
      platforms: "Plateformes",
      categories: "Catégories",
      genres: "Genres",
      tags: "Tags",
      // For detailed card errors
      steamData: "Données Steam"
    }
  };

  const t = text[language];

  useEffect(() => {
    const fetchSteamSpyData = async (appId) => {
      if (!appId) return null;
      try {
        const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(`https://steamspy.com/api.php?request=appdetails&appid=${appId}`)}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.name) { // Check if data is valid (e.g., not an error object)
          return data;
        } else {
          return { error: "Data not available" };
        }
      } catch (error) {
        console.error(`Error fetching SteamSpy data for ${appId}:`, error);
        return { error: "Failed to fetch data" };
      }
    };

    const loadSteamSpyData = async () => {
      setLoading(true);
      const data = {};
      for (const game of compareList) {
        if (game.steamAppId) {
          data[game.steamAppId] = await fetchSteamSpyData(game.steamAppId);
        }
      }
      setSteamSpyData(data);
      setLoading(false);
    };

    if (compareList.length > 0) {
      loadSteamSpyData();
    } else {
      setLoading(false);
    }
  }, [compareList]);


  if (loading) {
    return <div className="loading-container">{t.loadingSteamData}</div>;
  }

  const game1 = compareList[0];
  const game2 = compareList[1];

  const getBarWidth = (value, max) => {
    if (max === 0) return '0%';
    return `${(value / max) * 100}%`;
  };

  const getReviewPercentages = (gameReviews) => {
    const totalReviews = gameReviews.positive + gameReviews.negative;
    if (totalReviews === 0) {
      return { positive: 0, negative: 0, total: 0 };
    }
    return {
      positive: (gameReviews.positive / totalReviews) * 100,
      negative: (gameReviews.negative / totalReviews) * 100,
      total: totalReviews
    };
  };

  const game1Reviews = steamSpyData[game1?.steamAppId] || {};
  const game2Reviews = steamSpyData[game2?.steamAppId] || {};

  const game1ReviewPercentages = getReviewPercentages(game1Reviews);
  const game2ReviewPercentages = getReviewPercentages(game2Reviews);

  const maxTotalReviews = Math.max(
    game1ReviewPercentages.total || 0,
    game2ReviewPercentages.total || 0
  );

  const getWinnerClass = (val1, val2, higherIsBetter = true) => {
    if (val1 === undefined || val2 === undefined || val1 === null || val2 === null) return '';
    if (higherIsBetter) {
      if (val1 > val2) return 'game1-wins';
      if (val2 > val1) return 'game2-wins';
    } else { // Lower is better (e.g., price)
      if (val1 < val2) return 'game1-wins';
      if (val2 < val1) return 'game2-wins';
    }
    return 'tie';
  };

  return (
    <div className="charts-container">
      <div className="game-comparison-header">
        <div className="games-being-compared">
          <span className="game-name">{game1?.name || 'Game 1'}</span>
          <span className="vs-text">{t.vsText}</span>
          <span className="game-name">{game2?.name || 'Game 2'}</span>
        </div>
      </div>

      <div className="main-charts-grid"> {/* New container for side-by-side charts */}
        {/* Reviews & Performance Metrics */}
        <div className="chart-section custom-radar-comparison"> {/* Reusing class for styling consistency */}
          <h3 className="chart-title">{t.reviewsPerformanceMetrics}</h3>
          <div className="chart-controls">
            <button
              className={`toggle-btn ${reviewsViewMode === 'total' ? 'active' : ''}`}
              onClick={() => setReviewsViewMode('total')}
            >
              {t.totalNumbers}
            </button>
            <button
              className={`toggle-btn ${reviewsViewMode === 'percentage' ? 'active' : ''}`}
              onClick={() => setReviewsViewMode('percentage')}
            >
              {t.percentage}
            </button>
          </div>

          <div className="stacked-group">
            <div className="stacked-item">
              <div className="bar-label">{t.steamReviews}</div>
              <div className="stacked-bar-container">
                {reviewsViewMode === 'total' ? (
                  <>
                    <div
                      className="stacked-bar positive-bar"
                      style={{ width: `${getBarWidth(game1Reviews.positive || 0, maxTotalReviews)}` }}
                    >
                      {game1Reviews.positive !== undefined ? game1Reviews.positive : t.notAvailable}
                    </div>
                    <div
                      className="stacked-bar negative-bar"
                      style={{ width: `${getBarWidth(game1Reviews.negative || 0, maxTotalReviews)}` }}
                    >
                      {game1Reviews.negative !== undefined ? game1Reviews.negative : t.notAvailable}
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className="stacked-bar positive-bar"
                      style={{ width: `${game1ReviewPercentages.positive}%` }}
                    >
                      {game1ReviewPercentages.positive.toFixed(1)}%
                    </div>
                    <div
                      className="stacked-bar negative-bar"
                      style={{ width: `${game1ReviewPercentages.negative}%` }}
                    >
                      {game1ReviewPercentages.negative.toFixed(1)}%
                    </div>
                  </>
                )}
              </div>
              <div className="stacked-legend">
                <span className="legend-item positive-legend">{game1?.name || 'Game 1'} - {t.positive}</span>
                <span className="legend-item negative-legend">{game1?.name || 'Game 1'} - {t.negative}</span>
              </div>
            </div>
            {game2 && (
              <div className="stacked-item">
                <div className="bar-label">{t.steamReviews}</div>
                <div className="stacked-bar-container">
                  {reviewsViewMode === 'total' ? (
                    <>
                      <div
                        className="stacked-bar positive-bar"
                        style={{ width: `${getBarWidth(game2Reviews.positive || 0, maxTotalReviews)}` }}
                      >
                        {game2Reviews.positive !== undefined ? game2Reviews.positive : t.notAvailable}
                      </div>
                      <div
                        className="stacked-bar negative-bar"
                        style={{ width: `${getBarWidth(game2Reviews.negative || 0, maxTotalReviews)}` }}
                      >
                        {game2Reviews.negative !== undefined ? game2Reviews.negative : t.notAvailable}
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className="stacked-bar positive-bar"
                        style={{ width: `${game2ReviewPercentages.positive}%` }}
                      >
                        {game2ReviewPercentages.positive.toFixed(1)}%
                      </div>
                      <div
                        className="stacked-bar negative-bar"
                        style={{ width: `${game2ReviewPercentages.negative}%` }}
                      >
                        {game2ReviewPercentages.negative.toFixed(1)}%
                      </div>
                    </>
                  )}
                </div>
                <div className="stacked-legend">
                  <span className="legend-item positive-legend">{game2?.name || 'Game 2'} - {t.positive}</span>
                  <span className="legend-item negative-legend">{game2?.name || 'Game 2'} - {t.negative}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Overall Performance Comparison (Bar Chart) */}
        <div className="chart-section custom-bar-chart">
          <h3 className="chart-title">{t.overallPerformanceComparison}</h3>
          <div className="bars-container">
            {/* IGDB Rating */}
            <div className="bar-group">
              <div className="metric-label">IGDB Rating</div>
              <div className="bar-item">
                <span className="bar-label">{game1?.name || 'Game 1'}</span>
                <div className="bar-wrapper">
                  <div
                    className="bar bar-game1"
                    style={{ width: getBarWidth(game1?.aggregated_rating || 0, 100) }}
                  >
                    <span className="bar-value">
                      {game1?.aggregated_rating ? `${game1.aggregated_rating.toFixed(1)}/100` : t.notAvailable}
                    </span>
                  </div>
                </div>
              </div>
              {game2 && (
                <div className="bar-item">
                  <span className="bar-label">{game2?.name || 'Game 2'}</span>
                  <div className="bar-wrapper">
                    <div
                      className="bar bar-game2"
                      style={{ width: getBarWidth(game2?.aggregated_rating || 0, 100) }}
                    >
                      <span className="bar-value">
                        {game2?.aggregated_rating ? `${game2.aggregated_rating.toFixed(1)}/100` : t.notAvailable}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Metascore */}
            <div className="bar-group">
              <div className="metric-label">{t.metascore}</div>
              <div className="bar-item">
                <span className="bar-label">{game1?.name || 'Game 1'}</span>
                <div className="bar-wrapper">
                  <div
                    className="bar bar-game1"
                    style={{ width: getBarWidth(game1?.metacritic?.rating || 0, 100) }}
                  >
                    <span className="bar-value">
                      {game1?.metacritic?.rating ? `${game1.metacritic.rating}/100` : t.notAvailable}
                    </span>
                  </div>
                </div>
              </div>
              {game2 && (
                <div className="bar-item">
                  <span className="bar-label">{game2?.name || 'Game 2'}</span>
                  <div className="bar-wrapper">
                    <div
                      className="bar bar-game2"
                      style={{ width: getBarWidth(game2?.metacritic?.rating || 0, 100) }}
                    >
                      <span className="bar-value">
                        {game2?.metacritic?.rating ? `${game2.metacritic.rating}/100` : t.notAvailable}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Price (needs logic to handle 0 price / free games) */}
            <div className="bar-group">
              <div className="metric-label">{t.steamPrice}</div>
              <div className="bar-item">
                <span className="bar-label">{game1?.name || 'Game 1'}</span>
                <div className="bar-wrapper">
                  <div
                    className="bar bar-game1"
                    style={{ width: getBarWidth(steamSpyData[game1?.steamAppId]?.price || 0, Math.max(steamSpyData[game1?.steamAppId]?.price || 0, steamSpyData[game2?.steamAppId]?.price || 0, 1)) }}
                  >
                    <span className="bar-value">
                      {steamSpyData[game1?.steamAppId]?.price !== undefined ? `$${(steamSpyData[game1.steamAppId].price / 100).toFixed(2)}` : t.notAvailable}
                    </span>
                  </div>
                </div>
              </div>
              {game2 && (
                <div className="bar-item">
                  <span className="bar-label">{game2?.name || 'Game 2'}</span>
                  <div className="bar-wrapper">
                    <div
                      className="bar bar-game2"
                      style={{ width: getBarWidth(steamSpyData[game2?.steamAppId]?.price || 0, Math.max(steamSpyData[game1?.steamAppId]?.price || 0, steamSpyData[game2?.steamAppId]?.price || 0, 1)) }}
                    >
                      <span className="bar-value">
                        {steamSpyData[game2?.steamAppId]?.price !== undefined ? `$${(steamSpyData[game2.steamAppId].price / 100).toFixed(2)}` : t.notAvailable}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Average Playtime */}
            <div className="bar-group">
              <div className="metric-label">{t.avgPlaytimeHrs}</div>
              <div className="bar-item">
                <span className="bar-label">{game1?.name || 'Game 1'}</span>
                <div className="bar-wrapper">
                  <div
                    className="bar bar-game1"
                    style={{ width: getBarWidth(steamSpyData[game1?.steamAppId]?.average_forever || 0, Math.max(steamSpyData[game1?.steamAppId]?.average_forever || 0, steamSpyData[game2?.steamAppId]?.average_forever || 0, 1)) }}
                  >
                    <span className="bar-value">
                      {steamSpyData[game1?.steamAppId]?.average_forever !== undefined ? `${(steamSpyData[game1.steamAppId].average_forever / 60).toFixed(1)} hrs` : t.notAvailable}
                    </span>
                  </div>
                </div>
              </div>
              {game2 && (
                <div className="bar-item">
                  <span className="bar-label">{game2?.name || 'Game 2'}</span>
                  <div className="bar-wrapper">
                    <div
                      className="bar bar-game2"
                      style={{ width: getBarWidth(steamSpyData[game2?.steamAppId]?.average_forever || 0, Math.max(steamSpyData[game1?.steamAppId]?.average_forever || 0, steamSpyData[game2?.steamAppId]?.average_forever || 0, 1)) }}
                    >
                      <span className="bar-value">
                        {steamSpyData[game2?.steamAppId]?.average_forever !== undefined ? `${(steamSpyData[game2.steamAppId].average_forever / 60).toFixed(1)} hrs` : t.notAvailable}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Removed Detailed Game Information section */}
    </div>
  );
};

export default ComparisonCharts;