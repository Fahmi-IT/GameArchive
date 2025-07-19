import React, { useState } from 'react';
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import FAQPage from "./pages/FAQPage";
import ReviewPage from "./pages/ReviewPage";
import SearchPage from "./pages/SearchPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage />;
      case "search":
        return <SearchPage />;
      case "faq":
        return <FAQPage />;
      case "review":
        return <ReviewPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <>
      <Navbar setCurrentPage={setCurrentPage} />
      <main className="p-4">{renderPage()}</main>
    </>
  );
}