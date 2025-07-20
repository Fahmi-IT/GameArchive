import React, { useState, useEffect } from 'react';
import './css/ComparisonCharts.css';

const ComparisonCharts = ({ chartData, compareList }) => {
  const [steamSpyData, setSteamSpyData] = useState({});
  const [loading, setLoading] = useState(true);
  const [reviewsViewMode, setReviewsViewMode] = useState('total'); // 'total' or 'percentage'

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

            // If we don't have a Steam app ID, search for it (similar to GamePopup.jsx)
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
                    
                    if (currentIncludes && !bestIncludes) return current;
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
              const res = await fetch(`/api/steamspy/${appId}`);
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
                data: { error: 'No Steam App ID found' }
              };
            }
          } catch (err) {
            console.error(`Error fetching Steam data for ${game.name}:`, err);
            return {
              steamAppId: steamAppId || null,
              gameName: game.name,
              metascore: 'N/A',
              data: { error: 'Failed to fetch Steam data' }
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
  }, [compareList]);

  if (!chartData || !compareList || compareList.length !== 2) {
    return null;
  }

  const game1Name = compareList[0].game.name || 'Game 1';
  const game2Name = compareList[1].game.name || 'Game 2';

  // Enhanced chart data with SteamSpy information
  const getEnhancedChartData = () => {
    if (loading || !steamSpyData[0] || !steamSpyData[1]) {
      return chartData;
    }

    const game1Steam = steamSpyData[0].data;
    const game2Steam = steamSpyData[1].data;

    // Enhanced reviews and ratings data
    const game1Playtime = game1Steam.average_forever ? (game1Steam.average_forever / 60) : 0;
    const game2Playtime = game2Steam.average_forever ? (game2Steam.average_forever / 60) : 0;
    
    const enhancedReviewsData = [
      ...chartData.reviewsRatingsData.map(item => {
        // Ensure user ratings and review scores are out of 100
        if (item.metric.toLowerCase().includes('rating') || item.metric.toLowerCase().includes('score')) {
          return {
            ...item,
            maxValue: 100
          };
        }
        return item;
      }),
      {
        metric: 'Steam Reviews',
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
      },
      {
        metric: 'Avg Playtime (hrs)',
        [game1Name]: parseFloat(game1Playtime.toFixed(2)),
        [game2Name]: parseFloat(game2Playtime.toFixed(2)),
        maxValue: Math.max(game1Playtime, game2Playtime)
      }
    ];

    // Enhanced radar data
    const enhancedRadarData = [
      ...chartData.radarData,
      {
        subject: 'Metascore',
        [game1Name]: steamSpyData[0].metascore !== 'N/A' ? steamSpyData[0].metascore : 0,
        [game2Name]: steamSpyData[1].metascore !== 'N/A' ? steamSpyData[1].metascore : 0
      },
      {
        subject: 'Steam Price ($)',
        [game1Name]: game1Steam.price ? (game1Steam.price / 100) : 0,
        [game2Name]: game2Steam.price ? (game2Steam.price / 100) : 0
      },
      {
        subject: 'Avg Playtime (hrs)',
        [game1Name]: parseFloat(game1Playtime.toFixed(2)),
        [game2Name]: parseFloat(game2Playtime.toFixed(2))
      }
    ];

    return {
      reviewsRatingsData: enhancedReviewsData,
      radarData: enhancedRadarData
    };
  };

  const enhancedChartData = getEnhancedChartData();

  // Custom Bar Chart Component - Fixed to receive props
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
              Total Numbers
            </button>
            <button 
              className={`toggle-btn ${reviewsViewMode === 'percentage' ? 'active' : ''}`}
              onClick={() => setReviewsViewMode('percentage')}
            >
              Percentage
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
                              <span className="legend-item positive-legend">✓ Positive</span>
                              <span className="legend-item negative-legend">✗ Negative</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            } else {
              // Regular bar chart
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
                            minWidth: '20px'
                          }}
                        >
                          <span className="bar-value">
                            {item.metric.includes('Playtime') 
                              ? `${item[game1Name]?.toFixed(2)}h`
                              : item.metric.toLowerCase().includes('rating') || item.metric.toLowerCase().includes('score')
                              ? `${item[game1Name]?.toFixed(1)}/100`
                              : item[game1Name]?.toLocaleString?.() || item[game1Name]?.toFixed?.(1) || 0}
                          </span>
                        </div>
                        {(item.metric.toLowerCase().includes('rating') || item.metric.toLowerCase().includes('score')) && (
                          <div className="max-indicator">100</div>
                        )}
                      </div>
                    </div>
                    <div className="bar-item">
                      <div className="bar-label">{game2Name}</div>
                      <div className="bar-wrapper">
                        <div 
                          className="bar bar-game2" 
                          style={{ 
                            width: `${maxValue > 0 ? (item[game2Name] / maxValue) * 100 : 0}%`,
                            minWidth: '20px'
                          }}
                        >
                          <span className="bar-value">
                            {item.metric.includes('Playtime') 
                              ? `${item[game2Name]?.toFixed(2)}h`
                              : item.metric.toLowerCase().includes('rating') || item.metric.toLowerCase().includes('score')
                              ? `${item[game2Name]?.toFixed(1)}/100`
                              : item[game2Name]?.toLocaleString?.() || item[game2Name]?.toFixed?.(1) || 0}
                          </span>
                        </div>
                        {(item.metric.toLowerCase().includes('rating') || item.metric.toLowerCase().includes('score')) && (
                          <div className="max-indicator">100</div>
                        )}
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

  // Custom Radar Chart Component (simplified as comparison table)
  const CustomRadarComparison = ({ data, title }) => {
    return (
      <div className="custom-radar-comparison">
        <h3 className="chart-title">{title}</h3>
        <div className="comparison-table">
          <div className="comparison-header">
            <div className="metric-header">Metric</div>
            <div className="game-header game1-header">{game1Name}</div>
            <div className="game-header game2-header">{game2Name}</div>
            <div className="winner-header">Better</div>
          </div>
          {data.map((item, index) => {
            const game1Value = item[game1Name] || 0;
            const game2Value = item[game2Name] || 0;
            const winner = game1Value > game2Value ? game1Name : 
                          game2Value > game1Value ? game2Name : 'Tie';
            
            return (
              <div key={index} className="comparison-row">
                <div className="metric-cell">{item.subject}</div>
                <div className="value-cell game1-cell">
                  <div className="value-bar">
                    <div 
                      className="value-fill game1-fill" 
                      style={{ width: `${Math.max(...data.map(d => Math.max(d[game1Name] || 0, d[game2Name] || 0))) > 0 ? (game1Value / Math.max(...data.map(d => Math.max(d[game1Name] || 0, d[game2Name] || 0)))) * 100 : 0}%` }}
                    />
                    <span className="value-text">
                      {item.subject.includes('Price') ? `$${game1Value}` :
                       item.subject.includes('Playtime') ? `${game1Value}h` :
                       `${game1Value.toFixed ? game1Value.toFixed(1) : game1Value}`}
                    </span>
                  </div>
                </div>
                <div className="value-cell game2-cell">
                  <div className="value-bar">
                    <div 
                      className="value-fill game2-fill" 
                      style={{ width: `${Math.max(...data.map(d => Math.max(d[game1Name] || 0, d[game2Name] || 0))) > 0 ? (game2Value / Math.max(...data.map(d => Math.max(d[game1Name] || 0, d[game2Name] || 0)))) * 100 : 0}%` }}
                    />
                    <span className="value-text">
                      {item.subject.includes('Price') ? `$${game2Value}` :
                       item.subject.includes('Playtime') ? `${game2Value}h` :
                       `${game2Value.toFixed ? game2Value.toFixed(1) : game2Value}`}
                    </span>
                  </div>
                </div>
                <div className={`winner-cell ${winner === 'Tie' ? 'tie' : winner === game1Name ? 'game1-wins' : 'game2-wins'}`}>
                  {winner === 'Tie' ? '🤝' : winner === game1Name ? '🏆' : '🥈'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="charts-container">
        <div className="game-comparison-header">
          <h2>📊 Game Statistics Comparison</h2>
          <div className="games-being-compared">
            <span className="game-name">{game1Name}</span>
            <span className="vs-text">VS</span>
            <span className="game-name">{game2Name}</span>
          </div>
        </div>
        <div className="loading-container">
          <p><em>Loading enhanced Steam data...</em></p>
        </div>
      </div>
    );
  }

  return (
    <div className="charts-container">
      <div className="game-comparison-header">
        <h2>📊 Game Statistics Comparison</h2>
        <div className="games-being-compared">
          <span className="game-name">{game1Name}</span>
          <span className="vs-text">VS</span>
          <span className="game-name">{game2Name}</span>
        </div>
      </div>

      {/* Custom Bar Chart - Now passing the required props */}
      <div className="chart-section">
        <CustomBarChart 
          data={enhancedChartData.reviewsRatingsData} 
          title="📈 Reviews & Performance Metrics"
          reviewsViewMode={reviewsViewMode}
          setReviewsViewMode={setReviewsViewMode}
        />
      </div>

      {/* Custom Radar/Comparison Chart */}
      <div className="chart-section">
        <CustomRadarComparison 
          data={enhancedChartData.radarData} 
          title="🎯 Overall Performance Comparison"
        />
      </div>

      {/* Enhanced Game Details Comparison Cards */}
      <div className="detailed-comparison">
        <h3 className="chart-title">🎮 Detailed Game Information</h3>
        <div className="compare-cards-grid">
          {compareList.map(({ game, steamAppId }, index) => {
            const steamData = steamSpyData[index];
            const steamInfo = steamData?.data || {};
            
            return (
              <div key={steamAppId || index} className={`detailed-compare-card ${index === 0 ? 'game-1' : 'game-2'}`}>
                <h4 className="detailed-card-title">
                  {game.name}
                </h4>
                <div className="card-stats">
                  <div className="stat-item">
                    <span className="stat-label">Steam ID:</span>
                    <span className="stat-value">{steamData?.steamAppId || 'N/A'}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">IGDB Rating:</span>
                    <span className="stat-value">
                      {game.aggregated_rating ? `${game.aggregated_rating.toFixed(1)}/100` : 'N/A'}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Metascore:</span>
                    <span className="stat-value">{steamData?.metascore || 'N/A'}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Steam Price:</span>
                    <span className="stat-value">
                      {steamInfo.price ? `$${(steamInfo.price / 100).toFixed(2)}` : 'N/A'}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Developer:</span>
                    <span className="stat-value">{steamInfo.developer || 'N/A'}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Publisher:</span>
                    <span className="stat-value">{steamInfo.publisher || 'N/A'}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Steam Positive:</span>
                    <span className="stat-value">
                      {steamInfo.positive ? steamInfo.positive.toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Steam Negative:</span>
                    <span className="stat-value">
                      {steamInfo.negative ? steamInfo.negative.toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Owners:</span>
                    <span className="stat-value">{steamInfo.owners || 'N/A'}</span>
                  </div>
                  {steamInfo.average_forever && (
                    <div className="stat-item">
                      <span className="stat-label">Avg Playtime:</span>
                      <span className="stat-value">
                        {(steamInfo.average_forever / 60).toFixed(1)} hrs
                      </span>
                    </div>
                  )}
                  {game.genres && (
                    <div className="stat-item genres">
                      <span className="stat-label">Genres:</span>
                      <span className="stat-value">
                        {Array.isArray(game.genres) 
                          ? game.genres.map(g => g.name || g).join(', ')
                          : 'Not specified'
                        }
                      </span>
                    </div>
                  )}
                  {steamInfo.error && (
                    <div className="stat-item error">
                      <span className="stat-label">Steam Data:</span>
                      <span className="stat-value error-text">{steamInfo.error}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ComparisonCharts;