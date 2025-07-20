import React, { createContext, useState, useContext } from 'react';

export const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState([]);

  const addToCompare = (newGame) => {
    setCompareList((prevList) => {
      const updatedList = [...prevList];

      // Avoid duplicates
      if (updatedList.find(item => item.steamAppId === newGame.steamAppId)) {
        return updatedList;
      }

      // If list has 2 items, remove the oldest (first)
      if (updatedList.length >= 2) {
        updatedList.shift();
      }

      updatedList.push(newGame);
      return updatedList;
    });
  };

  return (
    <CompareContext.Provider value={{ compareList, addToCompare }}>
      {children}
    </CompareContext.Provider>
  );
};
