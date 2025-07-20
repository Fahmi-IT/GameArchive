import React, { useContext, useMemo } from 'react';
import { CompareContext } from '../contexts/CompareContext';
import ComparisonCharts from '../components/ComparisonCharts';
import './css/ComparePage.css';

const ComparePage = () => {
  console.log('ComparePage rendering...');

  const context = useContext(CompareContext);

  const compareList = context?.compareList || []; // Use optional chaining and default empty array

  // Parse and normalize game data for charts
  const chartData = useMemo(() => {
    console.log('Computing chart data...');
    if (compareList.length !== 2) return null; // Return null if not enough data for charts

    const [game1, game2] = compareList;

    const parseNumber = (value, defaultValue = 0) => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
        return isNaN(parsed) ? defaultValue : parsed;
      }
      return defaultValue;
    };

    const parseOwners = (ownersStr) => {
      if (!ownersStr) return 0;
      const match = ownersStr.toString().match(/[\d,]+/);
      if (match) {
        const num = parseFloat(match[0].replace(/,/g, ''));
        return num / 1000000; // Convert to millions for better chart display
      }
      return 0;
    };

    const parseRating = (rating) => {
      const parsed = parseNumber(rating);
      return Math.min(parsed, 100); // Cap at 100
    };

    const parsePlaytime = (playtime) => {
      const parsed = parseNumber(playtime);
      return parsed > 1000 ? parsed / 60 : parsed; // If > 1000, assume minutes, convert to hours
    };

    const reviewsRatingsData = [
      {
        metric: 'User Rating',
        [game1.game.name || 'Game 1']: parseRating(game1.game.aggregated_rating || game1.game.rating),
        [game2.game.name || 'Game 2']: parseRating(game2.game.aggregated_rating || game2.game.rating)
      },
      {
        metric: 'Review Score',
        [game1.game.name || 'Game 1']: parseNumber(game1.game.total_rating) || parseRating(game1.game.aggregated_rating) || 75,
        [game2.game.name || 'Game 2']: parseNumber(game2.game.total_rating) || parseRating(game2.game.aggregated_rating) || 75
      },
      {
        metric: 'Owners (Millions)',
        [game1.game.name || 'Game 1']: parseOwners(game1.game.owners || game1.game.player_count) || 1,
        [game2.game.name || 'Game 2']: parseOwners(game2.game.owners || game2.game.player_count) || 1
      }
    ];

    // Chart 2 Data: Price, Average Playtime, User Ratings (Radar Chart)
    const radarData = [
      {
        subject: 'Price ($)',
        [game1.game.name || 'Game 1']: parseNumber(game1.game.price || game1.game.initial_price) || 20,
        [game2.game.name || 'Game 2']: parseNumber(game2.game.price || game2.game.initial_price) || 20,
        fullMark: 100
      },
      {
        subject: 'Avg Playtime (hrs)',
        [game1.game.name || 'Game 1']: Math.min(parsePlaytime(game1.game.average_playtime || game1.game.playtime_forever) || 10, 100),
        [game2.game.name || 'Game 2']: Math.min(parsePlaytime(game2.game.average_playtime || game2.game.playtime_forever) || 10, 100),
        fullMark: 100
      },
      {
        subject: 'User Rating',
        [game1.game.name || 'Game 1']: parseRating(game1.game.aggregated_rating || game1.game.rating) || 75,
        [game2.game.name || 'Game 2']: parseRating(game2.game.aggregated_rating || game2.game.rating) || 75,
        fullMark: 100
      }
    ];

    return { reviewsRatingsData, radarData };
  }, [compareList]); // Dependency: compareList

  console.log('Rendering JSX...');

  return (
    <div className="compare-page">
      <h1 className="page-title">
        <span className="game-icon">式</span>
        Compare <span className="highlight">Games</span>
      </h1>

      {compareList.length === 0 ? (
        <div className="empty-state">
          <p>識 No games added for comparison yet.</p>
          <p className="empty-state-subtitle">
            Start exploring and add games to see detailed comparisons here!
          </p>
        </div>
      ) : compareList.length === 1 ? (
        <div className="single-game-state">
          <p>投 Add one more game to unlock comparison charts!</p>
          <div className="compare-container">
            {compareList.map(({ game, steamAppId }) => (
              <div key={steamAppId} className="compare-card">
                <h2 className="card-title">
                  軸 {game.name}
                </h2>
                <p className="card-info">
                  <span className="card-info-label">Steam App ID:</span> {steamAppId}
                </p>
                <p className="card-info">
                  <span className="card-info-label">Rating:</span> {
                    game.aggregated_rating
                      ? `${game.aggregated_rating.toFixed(1)}/100`
                      : 'Not Available'
                  }
                </p>
                {game.genres && (
                  <p className="card-info">
                    <span className="card-info-label">Genres:</span> {
                      Array.isArray(game.genres)
                        ? game.genres.map(g => g.name || g).join(', ')
                        : 'Not specified'
                    }
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <ComparisonCharts chartData={chartData} compareList={compareList} />
      )}
    </div>
  );
};

export default ComparePage;