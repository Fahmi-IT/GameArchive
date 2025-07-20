import React, { useState } from 'react';
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import FAQPage from "./pages/FAQPage";
import ReviewPage from "./pages/ReviewPage";
import SearchPage from "./pages/SearchPage";

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [initialSearchQuery, setInitialSearchQuery] = useState('');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage 
            setCurrentPage={setCurrentPage}
            setInitialSearchQuery={setInitialSearchQuery}
          />
        );
      case 'search':
        return (
          <SearchPage 
            initialSearchQuery={initialSearchQuery}
            clearInitialSearchQuery={() => setInitialSearchQuery('')}
          />
        );
      case 'faq':
        return <FAQPage />; // Your FAQ component
      case 'review':
        return <ReviewPage />; // Your review component
      default:
        return (
          <HomePage 
            setCurrentPage={setCurrentPage}
            setInitialSearchQuery={setInitialSearchQuery}
          />
        );
    }
  };

  return (
    <div className="App">
      <Navbar setCurrentPage={setCurrentPage} />
      {renderPage()}
    </div>
  );
};

export default App;