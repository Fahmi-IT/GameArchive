const express = require('express');
const axios = require('axios');
const router = express.Router();

const RAWG_API_KEY = process.env.RAWG_API_KEY;

router.get('/:title', async (req, res) => {
  try {
    const response = await axios.get('https://api.rawg.io/api/games', {
      params: {
        key: RAWG_API_KEY,
        search: req.params.title
      }
    });
    res.json(response.data.results[0] || { message: 'No results found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;