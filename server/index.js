require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/igdb', require('./routes/igdb'));
app.use('/api/rawg', require('./routes/rawg'));
app.use('/api/steamspy', require('./routes/steamspy'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));