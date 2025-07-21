import React, { useState, useEffect, useContext } from 'react';
import { CompareContext } from '../contexts/CompareContext';
import { useLanguage } from '../contexts/LanguageContext';
import './css/GamePopup.css';

const GamePopup = ({ game, onClose }) => {
  const { addToCompare } = useContext(CompareContext);
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState(0);
  const [steamSpyData, setSteamSpyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metascore, setMetascore] = useState('N/A');

  const releaseDate = game.first_release_date
    ? new Date(game.first_release_date * 1000).toLocaleDateString()
    : 'N/A';

  const coverUrl = game.cover?.url
    ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
    : null;

  const text = {
    en: {
      tabs: ['Overview', 'Steam Stats', 'Compare'],
      release: 'Release',
      rating: 'User Rating',
      esrb: 'ESRB',
      metascore: 'Metascore',
      loading: 'Loading SteamSpy data...',
      dev: 'Developer',
      pub: 'Publisher',
      pos: 'Positive',
      neg: 'Negative',
      owners: 'Owners',
      price: 'Steam Price (USD)',
      playtime: 'Avg Playtime',
      comparePrompt: 'Want to Compare this game?',
      compareBtn: 'Compare Game',
      noImage: 'No Image Available',
      errorNoAppId: 'No Steam App ID found for this game.',
      addedToCompare: 'Game added to compare list!',
    },
    fr: {
      tabs: ['Vue d’ensemble', 'Stats Steam', 'Comparer'],
      release: 'Sortie',
      rating: 'Note utilisateur',
      esrb: 'ESRB',
      metascore: 'Metascore',
      loading: 'Chargement des données SteamSpy...',
      dev: 'Développeur',
      pub: 'Éditeur',
      pos: 'Positifs',
      neg: 'Négatifs',
      owners: 'Possesseurs',
      price: 'Prix Steam (USD)',
      playtime: 'Temps de jeu moyen',
      comparePrompt: 'Vous voulez comparer ce jeu ?',
      compareBtn: 'Comparer le jeu',
      noImage: 'Aucune image disponible',
      errorNoAppId: 'Aucun ID Steam trouvé pour ce jeu.',
      addedToCompare: 'Jeu ajouté à la liste de comparaison !',
    }
  };

  const t = text[language];

  const handleCompareClick = () => {
    const steamAppId = steamSpyData?.appid || game.steam_appid || game.appid || null;

    if (!steamAppId) {
      alert(t.errorNoAppId);
      return;
    }

    addToCompare({ steamAppId, game });
    alert(t.addedToCompare);
  };

  useEffect(() => {
    const fetchSteamSpyData = async () => {
      try {
        let steamAppId = game.steam_appid || game.appid;

        if (!steamAppId) {
          const searchUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(game.name)}&l=english&cc=US`)}`;
          const searchResponse = await fetch(searchUrl);
          const proxyData = await searchResponse.json();
          const searchData = JSON.parse(proxyData.contents);

          if (searchData.items && searchData.items.length > 0) {
            const gameName = game.name.toLowerCase().trim();
            let bestMatch = searchData.items.find(item =>
              item.name.toLowerCase().trim() === gameName
            );

            if (!bestMatch) {
              bestMatch = searchData.items.reduce((best, current) => {
                const currentName = current.name.toLowerCase();
                const bestName = best.name.toLowerCase();
                const currentStarts = currentName.startsWith(gameName);
                const bestStarts = bestName.startsWith(gameName);
                if (currentStarts && !bestStarts) return current;
                if (!currentStarts && bestStarts) return best;
                const currentIncludes = currentName.includes(gameName);
                const bestIncludes = bestName.includes(gameName);
                if (currentIncludes && !bestIncludes) return current;
                if (!currentIncludes && bestIncludes) return best;
                return best;
              });
            }

            setMetascore(bestMatch.metascore || 'N/A');
            steamAppId = bestMatch.id;
          } else {
            setSteamSpyData({ error: 'No Steam results found' });
            return;
          }
        }

        if (steamAppId) {
          const res = await fetch(`/api/steamspy/${steamAppId}`);
          const data = await res.json();
          setSteamSpyData(data);
        } else {
          setSteamSpyData({ error: t.errorNoAppId });
        }
      } catch (err) {
        console.error('Error fetching Steam/SteamSpy data:', err);
        setSteamSpyData({ error: 'Failed to fetch Steam data' });
      } finally {
        setLoading(false);
      }
    };

    fetchSteamSpyData();
  }, [game.name, game.appid, game.steam_appid, t.errorNoAppId]);

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
      1: 'RP', 2: 'EC', 3: 'E', 4: 'E10+', 5: 'T', 6: 'M', 7: 'AO'
    };
    return esrbMap[rating] || 'N/A';
  };

  const rating = game.aggregated_rating ? game.aggregated_rating.toFixed(1) : 'N/A';
  const ratingClass = getRatingClass(game.aggregated_rating);

  const tabs = [
    {
      name: t.tabs[0],
      content: (
        <div className="tab-content">
          <div className="popup-info">
            <div><strong>{t.release}:</strong> {releaseDate}</div>
            <div><strong>{t.rating}:</strong> <span className={ratingClass}>{rating}</span></div>
            <div><strong>{t.esrb}:</strong> {getESRBRating()}</div>
            <div><strong>{t.metascore}:</strong> {metascore}</div>
          </div>
        </div>
      )
    },
    {
      name: t.tabs[1],
      content: (
        <div className="tab-content">
          {loading ? (
            <p className="loading-steamspy"><em>{t.loading}</em></p>
          ) : steamSpyData?.error ? (
            <p className="loading-steamspy"><em>{steamSpyData.error}</em></p>
          ) : (
            <div className="steamspy-info">
              <div><strong>{t.dev}:</strong> {steamSpyData.developer || 'N/A'}</div>
              <div><strong>{t.pub}:</strong> {steamSpyData.publisher || 'N/A'}</div>
              <div><strong>{t.pos}:</strong> {steamSpyData.positive?.toLocaleString() || 'N/A'}</div>
              <div><strong>{t.neg}:</strong> {steamSpyData.negative?.toLocaleString() || 'N/A'}</div>
              <div><strong>{t.owners}:</strong> {steamSpyData.owners || 'N/A'}</div>
              <div><strong>{t.price}:</strong> ${steamSpyData.price ? (steamSpyData.price / 100).toFixed(2) : 'N/A'}</div>
              <div><strong>{t.playtime}:</strong> {steamSpyData.average_forever ? (steamSpyData.average_forever / 60).toFixed(1) : 'N/A'} hrs</div>
            </div>
          )}
        </div>
      )
    },
    {
      name: t.tabs[2],
      content: (
        <div className="tab-content">
          <p>{t.comparePrompt}</p>
          <button onClick={handleCompareClick} className="compare-button">
            {t.compareBtn}
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
          <div className="popup-cover-placeholder">{t.noImage}</div>
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
