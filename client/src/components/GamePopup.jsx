import React, { useState, useEffect, useContext } from 'react';
import { CompareContext } from '../contexts/CompareContext';
import './css/GamePopup.css';

const GamePopup = ({ game, onClose }) => {
  const { addToCompare } = useContext(CompareContext);
  const [activeTab, setActiveTab] = useState(0);
  const releaseDate = game.first_release_date
    ? new Date(game.first_release_date * 1000).toLocaleDateString()
    : 'N/A';

  const [steamSpyData, setSteamSpyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metascore, setMetascore] = useState('N/A');
  const coverUrl = game.cover?.url ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` : null;

  const handleCompareClick = () => {
  const steamAppId = steamSpyData?.appid || game.steam_appid || game.appid || null;

  if (!steamAppId) {
    alert("No Steam App ID found for this game.");
    return;
  }

  addToCompare({
    steamAppId,
    game
  });

  alert("Game added to compare list!");
};

  useEffect(() => {
    const fetchSteamSpyData = async () => {
      try {
        let steamAppId = game.steam_appid || game.appid;
        
        // If we don't have a Steam app ID, search for it
        if (!steamAppId) {
          const searchUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(game.name)}&l=english&cc=US`)}`;
          const searchResponse = await fetch(searchUrl);
          const proxyData = await searchResponse.json();
          const searchData = JSON.parse(proxyData.contents);
          
          if (searchData.items && searchData.items.length > 0) {
            const gameName = game.name.toLowerCase().trim();
            
            // Try exact match first
            let bestMatch = searchData.items.find(item => 
              item.name.toLowerCase().trim() === gameName
            );
            
            // If no exact match, find best partial match
            if (!bestMatch) {
              bestMatch = searchData.items.reduce((best, current) => {
                const currentName = current.name.toLowerCase();
                const bestName = best.name.toLowerCase();
                
                // Prefer matches that start with the search term
                const currentStartsWith = currentName.startsWith(gameName);
                const bestStartsWith = bestName.startsWith(gameName);
                
                if (currentStartsWith && !bestStartsWith) return current;
                if (!currentStartsWith && bestStartsWith) return best;
                
                // Otherwise prefer matches that contain more of the search term
                const currentIncludes = currentName.includes(gameName);
                const bestIncludes = bestName.includes(gameName);
                
                if (currentIncludes && !bestIncludes) return current;
                if (!currentIncludes && bestIncludes) return best;
                
                // Fall back to first result
                return best;
              });
            }

            console.log(`Found Steam game: ${bestMatch.name} (ID: ${bestMatch.id})`);
            console.log(bestMatch.metascore)
            setMetascore(bestMatch.metascore || 'N/A');
            steamAppId = bestMatch.id;
          } else {
            setSteamSpyData({ error: 'No Steam results found' });
            return;
          }
        }

        if (steamAppId) {
          // Use the app ID to fetch SteamSpy data
          const res = await fetch(`/api/steamspy/${steamAppId}`);
          const data = await res.json();
          setSteamSpyData(data);
        } else {
          setSteamSpyData({ error: 'No Steam App ID found' });
        }
      } catch (err) {
        console.error('Error fetching Steam/SteamSpy data:', err);
        setSteamSpyData({ error: 'Failed to fetch Steam data' });
      } finally {
        setLoading(false);
      }
    };

    fetchSteamSpyData();
  }, [game.name]);

  const getRatingClass = (rating) => {
    if (!rating || rating === 'N/A') return 'rating-na';
    if (rating >= 80) return 'rating-high';
    if (rating >= 60) return 'rating-medium';
    return 'rating-low';
  };

  const getESRBRating = () => {
    if (!game.age_ratings || game.age_ratings.length === 0) return 'N/A';

    const rating = game.age_ratings[0].rating;
    const esrbMap = {
      1: 'RP',
      2: 'EC',
      3: 'E',
      4: 'E10+',
      5: 'T',
      6: 'M',
      7: 'AO',
    };

    return esrbMap[rating] || 'N/A';
  };

  const rating = game.aggregated_rating ? game.aggregated_rating.toFixed(1) : 'N/A';
  const ratingClass = getRatingClass(game.aggregated_rating);

  const tabs = [
    {
      name: 'Overview',
      content: (
        <div className="tab-content">
          <div className="popup-info">
            <div><strong>Release:</strong> {releaseDate}</div>
            <div><strong>User Rating:</strong> <span className={ratingClass}>{rating}</span></div>
            <div><strong>ESRB:</strong> {getESRBRating()}</div>
            <div><strong>Metascore:</strong> {metascore}</div>
          </div>
        </div>
      )
    },
    {
      name: 'Steam Stats',
      content: (
        <div className="tab-content">
          {loading ? (
            <p className="loading-steamspy"><em>Loading SteamSpy data...</em></p>
          ) : steamSpyData?.error ? (
            <p className="loading-steamspy"><em>{steamSpyData.error}</em></p>
          ) : (
            <div className="steamspy-info">
              <div><strong>Developer:</strong> {steamSpyData.developer || 'N/A'}</div>
              <div><strong>Publisher:</strong> {steamSpyData.publisher || 'N/A'}</div>
              <div><strong>Positive:</strong> {steamSpyData.positive?.toLocaleString() || 'N/A'}</div>
              <div><strong>Negative:</strong> {steamSpyData.negative?.toLocaleString() || 'N/A'}</div>
              <div><strong>Owners:</strong> {steamSpyData.owners || 'N/A'}</div>
              <div><strong>Steam Price (USD):</strong> ${steamSpyData.price ? (steamSpyData.price / 100).toFixed(2) : 'N/A'}</div>
              <div><strong>Avg Playtime:</strong> {steamSpyData.average_forever ? (steamSpyData.average_forever / 60).toFixed(1) : 'N/A'} hrs</div>
            </div>
          )}
        </div>
      )
    }, 
    {
        name: 'Compare',
        content: (
            <div className="tab-content">
                <p>Want to Compare this game?</p>
                <button onClick={handleCompareClick} className="compare-button">
                    Compare Game
                </button>
            </div>
        )
    }
  ];

  return (
    <div className="game-popup-overlay" onClick={onClose}>
      <div className="game-popup" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>×</button>
        
        {coverUrl ? (
          <img src={coverUrl} alt={`${game.name} Cover`} className="popup-cover" />
        ) : (
          <div className="popup-cover-placeholder">No Image Available</div>
        )}

        <h2 className="popup-title">{game.name}</h2>

        <div className="popup-tabs-container">
          <div className="tab-content-area">
            {tabs[activeTab].content}
          </div>

          <div className="tab-navigation">
            {tabs.map((tab, index) => (
              <button
                key={index}
                className={`tab-orb ${activeTab === index ? 'active' : ''}`}
                onClick={() => setActiveTab(index)}
                title={tab.name}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePopup;