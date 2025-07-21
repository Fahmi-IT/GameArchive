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
    // Get appid from query parameter instead of route parameter
    const { appid } = req.query;

    if (!appid) {
      return res.status(400).json({ error: 'AppID parameter is required' });
    }

    const response = await axios.get(`https://steamspy.com/api.php`, {
      params: {
        request: 'appdetails',
        appid: appid
      }
    });

    res.status(200).json(response.data || { message: 'No results found' });
  } catch (error) {
    console.error('SteamSpy API error:', error.message);
    res.status(500).json({ error: error.message });
  }
}