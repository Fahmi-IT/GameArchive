import React, { useState, useEffect } from 'react';
import './css/ComparisonCharts.css';
import { useLanguage } from '../contexts/LanguageContext';

const ComparisonCharts = ({ chartData, compareList }) => {
  const [steamSpyData, setSteamSpyData] = useState({});
  const [loading, setLoading] = useState(true);
  const [reviewsViewMode, setReviewsViewMode] = useState('total'); // 'total' or 'percentage'
  const { language } = useLanguage();

  // Define distinct colors for each game
  const gameColors = {
    game1: {
      primary: '#00d4ff', // Cyan blue
      secondary: '#0ea5e9', // Sky blue
      gradient: 'linear-gradient(135deg, #00d4ff, #0ea5e9)'
    },
    game2: {
      primary: '#8b5cf6', // Purple
      secondary: '#a855f7', // Violet
      gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)'
    }
  };

  // Define text strings for localization
  const text = {
    en: {
      loadingSteamData: "Loading enhanced Steam data...",
      gameStatisticsComparison: "📊 Game Statistics Comparison",
      vsText: "VS",
      reviewsRatingsMetrics: "📈 Reviews & Ratings Metrics",
      costPerformanceMetrics: "💰 Cost & Performance Metrics",
      detailedGameInformation: "🎮 Detailed Game Information",
      userScore: "User Score (0 - 100)",
      metascore: "Metascore (0 - 100)",
      steamReviewsRatio: "Steam Reviews (Positive/Negative)",
      avgPlaytimeHrs: "Average Playtime (hours)",
      steamPrice: "Steam Price ($)",
      costPerHour: "Cost per Hour ($)",
      totalNumbers: "Total Numbers",
      percentage: "Percentage",
      positive: "✓ Positive",
      negative: "✗ Negative",
      metric: "Metric",
      better: "Better",
      tie: "Tie",
      steamId: "Steam ID",
      igdbRating: "IGDB Rating",
      developer: "Developer",
      publisher: "Publisher",
      steamPositive: "Steam Positive",
      steamNegative: "Steam Negative",
      owners: "Owners",
      avgPlaytime: "Avg Playtime",
      genres: "Genres",
      notSpecified: "Not specified",
      steamData: "Steam Data",
      noSteamAppIdFound: "No Steam App ID found",
      failedToFetchSteamData: "Failed to fetch Steam data"
    },
    fr: {
      loadingSteamData: "Chargement des données Steam améliorées...",
      gameStatisticsComparison: "📊 Comparaison des Statistiques de Jeux",
      vsText: "CONTRE",
      reviewsRatingsMetrics: "📈 Avis & Métriques de Notes",
      costPerformanceMetrics: "💰 Coût & Métriques de Performance",
      detailedGameInformation: "🎮 Informations Détaillées du Jeu",
      userScore: "Score Utilisateur (0 - 100)",
      metascore: "Metascore (0 - 100)",
      steamReviewsRatio: "Avis Steam (Positif/Négatif)",
      avgPlaytimeHrs: "Temps de Jeu Moyen (heures)",
      steamPrice: "Prix Steam ($)",
      costPerHour: "Coût par Heure ($)",
      totalNumbers: "Nombres Totaux",
      percentage: "Pourcentage",
      positive: "✓ Positif",
      negative: "✗ Négatif",
      metric: "Métrique",
      better: "Mieux",
      tie: "Égalité",
      steamId: "ID Steam",
      igdbRating: "Note IGDB",
      developer: "Développeur",
      publisher: "Éditeur",
      steamPositive: "Positifs Steam",
      steamNegative: "Négatifs Steam",
      owners: "Propriétaires",
      avgPlaytime: "Temps de Jeu Moyen",
      genres: "Genres",
      notSpecified: "Non spécifié",
      steamData: "Données Steam",
      noSteamAppIdFound: "Aucun ID d'application Steam trouvé",
      failedToFetchSteamData: "Échec de la récupération des données Steam"
    }
  };

  const t = text[language];

  console.log(chartData);
  console.log(compareList);

  useEffect(() => {
    const fetchAllSteamSpyData = async () => {
      if (!compareList || compareList.length !== 2) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const steamDataPromises = compareList.map(async ({ steamAppId, game }) => {
          try {
            let appId = steamAppId;
            let metascore = 'N/A';

            // If we don't have a Steam app ID, search for it
            if (!appId) {
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
                    
                    if (currentIncludes && !currentIncludes) return current;
                    if (!currentIncludes && bestIncludes) return best;
                    
                    // Fall back to first result
                    return best;
                  });
                }

                console.log(`Found Steam game: ${bestMatch.name} (ID: ${bestMatch.id})`);
                metascore = bestMatch.metascore || 'N/A';
                appId = bestMatch.id;
              }
            }

            if (appId) {
              // Fetch SteamSpy data
              const res = await fetch(`/api/steamspy?appid=${appId}`);
              const data = await res.json();
              return {
                steamAppId: appId,
                gameName: game.name,
                metascore,
                data: data.error ? { error: data.error } : data
              };
            } else {
              return {
                steamAppId: null,
                gameName: game.name,
                metascore: 'N/A',
                data: { error: t.noSteamAppIdFound }
              };
            }
          } catch (err) {
            console.error(`Error fetching Steam data for ${game.name}:`, err);
            return {
              steamAppId: steamAppId || null,
              gameName: game.name,
              metascore: 'N/A',
              data: { error: t.failedToFetchSteamData }
            };
          }
        });

        const results = await Promise.all(steamDataPromises);
        const steamDataMap = {};
        results.forEach((result, index) => {
          steamDataMap[index] = result;
        });
        
        setSteamSpyData(steamDataMap);
      } catch (error) {
        console.error('Error fetching SteamSpy data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllSteamSpyData();
  }, [compareList, t.failedToFetchSteamData, t.noSteamAppIdFound]);

  if (!chartData || !compareList || compareList.length !== 2) {
    return null;
  }

  const game1Name = compareList[0].game.name || 'Game 1';
  const game2Name = compareList[1].game.name || 'Game 2';

  // Enhanced chart data with SteamSpy information
  const getEnhancedChartData = () => {
    if (loading || !steamSpyData[0] || !steamSpyData[1]) {
      return {
        reviewsRatingsData: [],
        costPerformanceData: []
      };
    }

    const game1Steam = steamSpyData[0].data;
    const game2Steam = steamSpyData[1].data;
    const game1 = compareList[0].game;
    const game2 = compareList[1].game;

    // Calculate playtime in hours
    const game1Playtime = game1Steam.average_forever ? (game1Steam.average_forever / 60) : 0;
    const game2Playtime = game2Steam.average_forever ? (game2Steam.average_forever / 60) : 0;

    // Calculate Steam prices in dollars
    const game1Price = game1Steam.price ? (game1Steam.price / 100) : 0;
    const game2Price = game2Steam.price ? (game2Steam.price / 100) : 0;

    // Calculate cost per hour
    const game1CostPerHour = game1Price > 0 && game1Playtime > 0 ? game1Price / game1Playtime : 0;
    const game2CostPerHour = game2Price > 0 && game2Playtime > 0 ? game2Price / game2Playtime : 0;

    // Reviews and Ratings Data (First Graph)
    const reviewsRatingsData = [
      {
        metric: t.userScore,
        [game1Name]: game1.aggregated_rating || 0,
        [game2Name]: game2.aggregated_rating || 0,
        maxValue: 100
      },
      {
        metric: t.metascore,
        [game1Name]: steamSpyData[0].metascore !== 'N/A' ? steamSpyData[0].metascore : 0,
        [game2Name]: steamSpyData[1].metascore !== 'N/A' ? steamSpyData[1].metascore : 0,
        maxValue: 100
      },
      {
        metric: t.steamReviewsRatio,
        type: 'stacked',
        [game1Name]: {
          positive: game1Steam.positive || 0,
          negative: game1Steam.negative || 0,
          total: (game1Steam.positive || 0) + (game1Steam.negative || 0)
        },
        [game2Name]: {
          positive: game2Steam.positive || 0,
          negative: game2Steam.negative || 0,
          total: (game2Steam.positive || 0) + (game2Steam.negative || 0)
        }
      }
    ];

    // Cost and Performance Data (Second Graph)
    const costPerformanceData = [
      {
        metric: t.avgPlaytimeHrs,
        [game1Name]: parseFloat(game1Playtime.toFixed(2)),
        [game2Name]: parseFloat(game2Playtime.toFixed(2)),
        maxValue: Math.max(game1Playtime, game2Playtime)
      },
      {
        metric: t.steamPrice,
        [game1Name]: parseFloat(game1Price.toFixed(2)),
        [game2Name]: parseFloat(game2Price.toFixed(2)),
        maxValue: Math.max(game1Price, game2Price)
      },
      {
        metric: t.costPerHour,
        [game1Name]: parseFloat(game1CostPerHour.toFixed(2)),
        [game2Name]: parseFloat(game2CostPerHour.toFixed(2)),
        maxValue: Math.max(game1CostPerHour, game2CostPerHour)
      }
    ];

    return {
      reviewsRatingsData,
      costPerformanceData
    };
  };

  const enhancedChartData = getEnhancedChartData();

  // Custom Bar Chart Component
  const CustomBarChart = ({ data, title, reviewsViewMode, setReviewsViewMode }) => {
    return (
      <div className="custom-bar-chart">
        <h3 className="chart-title">{title}</h3>
        
        {/* Toggle for Steam Reviews */}
        {data.some(item => item.type === 'stacked') && (
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
        )}
        
        <div className="chart-container">
          {data.map((item, index) => {
            if (item.type === 'stacked') {
              // Stacked bar chart for Steam Reviews
              return (
                <div key={index} className="bar-group stacked-group">
                  <div className="metric-label">{item.metric}</div>
                  <div className="bars-container">
                    {[game1Name, game2Name].map((gameName, gameIndex) => {
                      const gameData = item[gameName];
                      const positive = gameData.positive || 0;
                      const negative = gameData.negative || 0;
                      const total = gameData.total || 1;
                      
                      let positiveDisplay, negativeDisplay, positiveWidth, negativeWidth;
                      
                      if (reviewsViewMode === 'percentage') {
                        positiveDisplay = `${((positive / total) * 100).toFixed(1)}%`;
                        negativeDisplay = `${((negative / total) * 100).toFixed(1)}%`;
                        positiveWidth = (positive / total) * 100;
                        negativeWidth = (negative / total) * 100;
                      } else {
                        positiveDisplay = positive.toLocaleString();
                        negativeDisplay = negative.toLocaleString();
                        const maxTotal = Math.max(item[game1Name].total, item[game2Name].total);
                        positiveWidth = maxTotal > 0 ? (positive / maxTotal) * 100 : 0;
                        negativeWidth = maxTotal > 0 ? (negative / maxTotal) * 100 : 0;
                      }
                      
                      return (
                        <div key={gameIndex} className="bar-item stacked-item">
                          <div className="bar-label">{gameName}</div>
                          <div className="stacked-bar-wrapper">
                            <div className="stacked-bar-container">
                              <div 
                                className="stacked-bar positive-bar" 
                                style={{ width: `${positiveWidth}%` }}
                              >
                                <span className="bar-value positive-value">{positiveDisplay}</span>
                              </div>
                              <div 
                                className="stacked-bar negative-bar" 
                                style={{ width: `${negativeWidth}%` }}
                              >
                                <span className="bar-value negative-value">{negativeDisplay}</span>
                              </div>
                            </div>
                            <div className="stacked-legend">
                              <span className="legend-item positive-legend">{t.positive}</span>
                              <span className="legend-item negative-legend">{t.negative}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            } else {
              // Regular bar chart with distinct colors for each game
              const maxValue = item.maxValue || Math.max(
                item[game1Name] || 0, 
                item[game2Name] || 0
              );
              
              return (
                <div key={index} className="bar-group">
                  <div className="metric-label">{item.metric}</div>
                  <div className="bars-container">
                    <div className="bar-item">
                      <div className="bar-label">{game1Name}</div>
                      <div className="bar-wrapper">
                        <div 
                          className="bar bar-game1" 
                          style={{ 
                            width: `${maxValue > 0 ? (item[game1Name] / maxValue) * 100 : 0}%`,
                            minWidth: '20px',
                            background: gameColors.game1.gradient
                          }}
                        >
                          <span className="bar-value">
                            {item.metric.includes(t.avgPlaytimeHrs)
                              ? `${item[game1Name]?.toFixed(2)}h`
                              : item.metric.includes(t.steamPrice)
                              ? `$${item[game1Name]?.toFixed(2)}`
                              : item.metric.includes(t.costPerHour)
                              ? `$${item[game1Name]?.toFixed(2)}`
                              : item.metric.toLowerCase().includes('score')
                              ? `${item[game1Name]?.toFixed(1)}`
                              : item[game1Name]?.toLocaleString?.() || item[game1Name]?.toFixed?.(1) || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bar-item">
                      <div className="bar-label">{game2Name}</div>
                      <div className="bar-wrapper">
                        <div 
                          className="bar bar-game2" 
                          style={{ 
                            width: `${maxValue > 0 ? (item[game2Name] / maxValue) * 100 : 0}%`,
                            minWidth: '20px',
                            background: gameColors.game2.gradient
                          }}
                        >
                          <span className="bar-value">
                            {item.metric.includes(t.avgPlaytimeHrs)
                              ? `${item[game2Name]?.toFixed(2)}h`
                              : item.metric.includes(t.steamPrice)
                              ? `$${item[game2Name]?.toFixed(2)}`
                              : item.metric.includes(t.costPerHour)
                              ? `$${item[game2Name]?.toFixed(2)}`
                              : item.metric.toLowerCase().includes('score')
                              ? `${item[game2Name]?.toFixed(1)}`
                              : item[game2Name]?.toLocaleString?.() || item[game2Name]?.toFixed?.(1) || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="charts-container">
        <div className="game-comparison-header">
          <h2>{t.gameStatisticsComparison}</h2>
          <div className="games-being-compared">
            <span className="game-name">{game1Name}</span>
            <span className="vs-text">{t.vsText}</span>
            <span className="game-name">{game2Name}</span>
          </div>
        </div>
        <div className="loading-container">
          <p><em>{t.loadingSteamData}</em></p>
        </div>
      </div>
    );
  }

  return (
    <div className="charts-container">
      {/* First Chart: Reviews & Ratings */}
      <div className="chart-section">
        <CustomBarChart 
          data={enhancedChartData.reviewsRatingsData} 
          title={t.reviewsRatingsMetrics}
          reviewsViewMode={reviewsViewMode}
          setReviewsViewMode={setReviewsViewMode}
        />
      </div>

      {/* Second Chart: Cost & Performance */}
      <div className="chart-section">
        <CustomBarChart 
          data={enhancedChartData.costPerformanceData} 
          title={t.costPerformanceMetrics}
        />
      </div>
    </div>
  );
};

export default ComparisonCharts;