import axios from 'axios';

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

    const response = await axios.get('https://api.rawg.io/api/games', {
      params: {
        key: process.env.RAWG_API_KEY,
        search: title
      }
    });

    res.status(200).json(response.data.results[0] || { message: 'No results found' });
  } catch (error) {
    console.error('RAWG API error:', error.message);
    res.status(500).json({ error: error.message });
  }
}