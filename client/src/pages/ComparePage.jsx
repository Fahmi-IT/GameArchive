import React, { useContext, useMemo } from 'react';
import { CompareContext } from '../contexts/CompareContext';
import { useLanguage } from '../contexts/LanguageContext';
import ComparisonCharts from '../components/ComparisonCharts';
import './css/ComparePage.css';

const ComparePage = () => {
  const { language } = useLanguage();
  const { compareList = [] } = useContext(CompareContext);

  const text = {
    en: {
      title: "Compare",
      subtitle: "Games",
      emptyMsg: "No games added for comparison yet.",
      emptyHint: "Start exploring and add games to see detailed comparisons here!",
      oneGameMsg: "Add one more game to unlock comparison charts!",
      steamAppId: "Steam App ID",
      rating: "Rating",
      genres: "Genres",
      notAvailable: "Not Available",
      notSpecified: "Not specified"
    },
    fr: {
      title: "Comparer",
      subtitle: "des Jeux",
      emptyMsg: "Aucun jeu ajouté pour la comparaison.",
      emptyHint: "Commencez à explorer et ajoutez des jeux pour voir des comparaisons détaillées ici !",
      oneGameMsg: "Ajoutez un autre jeu pour afficher les graphiques de comparaison !",
      steamAppId: "ID Steam",
      rating: "Note",
      genres: "Genres",
      notAvailable: "Non disponible",
      notSpecified: "Non spécifié"
    }
  };

  const t = text[language];

  const chartData = useMemo(() => {
    if (compareList.length !== 2) return null;

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
        return num / 1000000;
      }
      return 0;
    };

    const parseRating = (rating) => {
      const parsed = parseNumber(rating);
      return Math.min(parsed, 100);
    };

    const parsePlaytime = (playtime) => {
      const parsed = parseNumber(playtime);
      return parsed > 1000 ? parsed / 60 : parsed;
    };

    const reviewsRatingsData = [
      {
        metric: 'User Rating',
        [game1.game.name || 'Game 1']: parseRating(game1.game.aggregated_rating),
        [game2.game.name || 'Game 2']: parseRating(game2.game.aggregated_rating || game2.game.rating)
      },
      {
        metric: 'Metascore',
        [game1.game.name || 'Game 1']: parseNumber(game1.game.total_rating) || parseRating(game1.game.metascore) || 75,
        [game2.game.name || 'Game 2']: parseNumber(game2.game.total_rating) || parseRating(game2.game.metascore) || 75
      },
      {
        metric: 'Owners (Millions)',
        [game1.game.name || 'Game 1']: parseOwners(game1.game.owners || game1.game.player_count) || 1,
        [game2.game.name || 'Game 2']: parseOwners(game2.game.owners || game2.game.player_count) || 1
      }
    ];

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
        [game1.game.name || 'Game 1']: parseRating(game1.game.aggregated_rating) || 75,
        [game2.game.name || 'Game 2']: parseRating(game2.game.aggregated_rating) || 75,
        fullMark: 100
      }
    ];

    return { reviewsRatingsData, radarData };
  }, [compareList]);

  return (
    <div className="compare-page">
      <h1 className="page-title">
        <span className="game-icon">📊</span>
        {t.title} <span className="highlight">{t.subtitle}</span>
      </h1>

      {compareList.length === 0 ? (
        <div className="empty-state">
          <p>{t.emptyMsg}</p>
          <p className="empty-state-subtitle">{t.emptyHint}</p>
        </div>
      ) : compareList.length === 1 ? (
        <div className="single-game-state">
          <p>{t.oneGameMsg}</p>
          <div className="compare-container">
            {compareList.map(({ game, steamAppId }) => (
              <div key={steamAppId} className="compare-card">
                <h2 className="card-title">{game.name}</h2>
                <p className="card-info">
                  <span className="card-info-label">{t.steamAppId}:</span> {steamAppId}
                </p>
                <p className="card-info">
                  <span className="card-info-label">{t.rating}:</span> {
                    game.aggregated_rating
                      ? `${game.aggregated_rating.toFixed(1)}/100`
                      : t.notAvailable
                  }
                </p>
                {game.genres && (
                  <p className="card-info">
                    <span className="card-info-label">{t.genres}:</span> {
                      Array.isArray(game.genres)
                        ? game.genres.map(g => g.name || g).join(', ')
                        : t.notSpecified
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
