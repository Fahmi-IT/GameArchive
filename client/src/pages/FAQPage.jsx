import "./css/FAQPage.css";

const FAQPage = () => (
  <div className="faq-page">
    <div className="faq-content">
      <h2 className="faq-title">
        <span className="question-icon">❓</span>
        Frequently Asked Questions
      </h2>
      
      <ul className="faq-list">
        <li className="faq-item">
          <strong className="faq-question">Where is the data from?</strong>
          <p className="faq-answer">
            IGDB, RAWG, SteamSpy, and other trusted gaming APIs.
          </p>
        </li>
        
        <li className="faq-item">
          <strong className="faq-question">Can I see pricing?</strong>
          <p className="faq-answer">
            Currently we're exploring Steam pricing support.
          </p>
        </li>
        
        <li className="faq-item">
          <strong className="faq-question">How often is the data updated?</strong>
          <p className="faq-answer">
            Data is fetched live at the time of search.
          </p>
        </li>

        <li className="faq-item">
          <strong className="faq-question">Why can't I see the game I'm looking for?</strong>
          <p className="faq-answer">
            Either your game is not in our database, or it may be under a different name. Try searching with different keywords.
          </p>
        </li>

        <li className="faq-item">
          <strong className="faq-question">Where does the rating come from?</strong>
          <p className="faq-answer">
            The rating data comes from IGDB and RAWG, which use Metacritic ratings and user reviews.
          </p>
        </li>

        <li className="faq-item">
          <strong className="faq-question">Why do you limit the search results to the Top 50?</strong>
          <p className="faq-answer">
            If you are unable to find your game within the top 50 results, try refining your search query or checking the spelling. We limit results to ensure performance and relevance.
          </p>
        </li>

        <li className="faq-item">
          <strong className="faq-question">What is the date format?</strong>
          <p className="faq-answer">
            Month / Day / Year (MM/DD/YYYY).
          </p>
        </li>
      </ul>
    </div>
  </div>
);

export default FAQPage;