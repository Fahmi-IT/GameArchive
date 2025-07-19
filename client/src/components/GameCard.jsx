import React from 'react';

const GameCard = ({ game }) => {
  const releaseDate = game.first_release_date
    ? new Date(game.first_release_date * 1000).toLocaleDateString()
    : 'N/A';

  const coverUrl = game.cover?.url ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` : null;

  return (
    <div className="border p-4 rounded shadow-md m-2 w-64">
      {coverUrl && (
        <img
          src={coverUrl}
          alt={`${game.name} Cover`}
          className="w-full h-80 object-cover rounded mb-3"
        />
      )}
      <h3 className="text-xl font-bold mb-2">{game.name}</h3>
      <p><strong>Release Date:</strong> {releaseDate}</p>
      <p><strong>Rating:</strong> {game.aggregated_rating?.toFixed(1) || 'N/A'}</p>
      <p><strong>ESRB:</strong> {game.age_ratings?.[0]?.rating || 'N/A'}</p>
    </div>
  );
};

export default GameCard;
