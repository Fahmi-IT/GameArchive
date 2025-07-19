const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/:appid', async (req, res) => {
  try {
    const response = await axios.get(`https://steamspy.com/api.php`, {
      params: {
        request: 'appdetails',
        appid: req.params.appid
      }
    });
    res.json(response.data || { message: 'No results found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;