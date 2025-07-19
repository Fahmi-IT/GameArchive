const express = require('express');
const axios = require('axios');
const router = express.Router();

// Fetch OAuth token from Twitch
const getAccessToken = async () => {
  const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
    params: {
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      grant_type: 'client_credentials'
    }
  });
  return response.data.access_token;
};

// IGDB search route
router.get('/:title', async (req, res) => {
  try {
    const title = req.params.title;

    const token = await getAccessToken();

    const query = `
      search "${title}";
      fields name, first_release_date, aggregated_rating, age_ratings.rating, cover.url; 
      limit 50;
    `;

    const response = await axios.post('https://api.igdb.com/v4/games', query, {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
        'Accept': 'application/json'
      }
    });

    if (!response.data || response.data.length === 0) {
      return res.status(404).json({ error: `No game found for "${title}"` });
    }

    res.json(response.data);
  } catch (error) {
    console.error('IGDB API error:', error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;