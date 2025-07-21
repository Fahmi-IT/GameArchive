import axios from 'axios';

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

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get title from query parameter instead of route parameter
    const { title } = req.query;

    if (!title) {
      return res.status(400).json({ error: 'Title parameter is required' });
    }

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

    res.status(200).json(response.data);
  } catch (error) {
    console.error('IGDB API error:', error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
}