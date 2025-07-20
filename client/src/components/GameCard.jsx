import React from 'react';
import './css/GameCard.css';

const GameCard = ({ game, onClick }) => {
  const releaseDate = game.first_release_date
    ? new Date(game.first_release_date * 1000).toLocaleDateString()
    : 'N/A';

  const coverUrl = game.cover?.url ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` : null;

  // Helper function to get rating class based on score
  const getRatingClass = (rating) => {
    if (!rating || rating === 'N/A') return 'rating-na';
    if (rating >= 80) return 'rating-high';
    if (rating >= 60) return 'rating-medium';
    return 'rating-low';
  };

  // Helper function to format ESRB rating
  const getESRBRating = () => {
    if (!game.age_ratings || game.age_ratings.length === 0) return 'N/A';
    
    const rating = game.age_ratings[0].rating;
    const esrbMap = {
      1: 'RP', // Rating Pending
      2: 'EC', // Early Childhood
      3: 'E',  // Everyone
      4: 'E10+', // Everyone 10+
      5: 'T',  // Teen
      6: 'M',  // Mature
      7: 'AO', // Adults Only
    };
    
    return esrbMap[rating] || 'N/A';
  };

  const rating = game.aggregated_rating ? game.aggregated_rating.toFixed(1) : 'N/A';
  const ratingClass = getRatingClass(game.aggregated_rating);

  return (
    <div className="game-card-container" onClick={onClick}>
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={`${game.name} Cover`}
          className="game-cover"
          loading="lazy"
        />
      ) : (
        <div className="game-cover-placeholder">
          <span>No Image Available</span>
        </div>
      )}
      
      <h3 className="game-title">{game.name}</h3>
      
      <div className="game-info">
        <div className="game-info-item release-date">
          <span className="game-info-label">Release:</span>
          <span className="game-info-value">{releaseDate}</span>
        </div>
        
        <div className="game-info-item rating">
          <span className="game-info-label">Rating:</span>
          <span className={`game-info-value ${ratingClass}`}>{rating}</span>
        </div>
        
        <div className="game-info-item esrb">
          <span className="game-info-label">ESRB:</span>
          <span className="game-info-value">{getESRBRating()}</span>
        </div>
      </div>
    </div>
  );
};

export default GameCard;