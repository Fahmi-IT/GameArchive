import React, { useState } from 'react';
import axios from 'axios';

const GameSearch = ({ onResults }) => {
  const [title, setTitle] = useState('');

  const handleSearch = async () => {
    try {
      const igdb = await axios.get(`http://localhost:5000/api/igdb/${title}`);
      onResults(igdb.data, title); // Send the array of results
    } catch (err) {
      console.error(err);
      onResults([]); // Empty results on error
    }
  };

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Search for a game"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 mr-2 w-64"
      />
      <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded">
        Search
      </button>
    </div>
  );
};

export default GameSearch;
