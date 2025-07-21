import "./css/FAQPage.css";
import { useLanguage } from "../contexts/LanguageContext";

const FAQPage = () => {
  const { language } = useLanguage();

  const text = {
    en: {
      title: "Frequently Asked Questions",
      questions: [
        {
          q: "Where is the data from?",
          a: "IGDB, RAWG, SteamSpy, and other trusted gaming APIs."
        },
        {
          q: "How often is the data updated?",
          a: "Data is fetched live at the time of search."
        },
        {
          q: "Why can't I see the game I'm looking for?",
          a: "Either your game is not in our database, or it may be under a different name. Try searching with different keywords."
        },
        {
          q: "Where does the rating come from?",
          a: "The rating data comes from IGDB and RAWG, which use Metacritic ratings and user reviews."
        },
        {
          q: "Why do you limit the search results to the Top 50?",
          a: "If you are unable to find your game within the top 50 results, try refining your search query or checking the spelling. We limit results to ensure performance and relevance."
        },
        {
          q: "What is the date format?",
          a: "Month / Day / Year (MM/DD/YYYY)."
        }
      ]
    },
    fr: {
      title: "Foire Aux Questions",
      questions: [
        {
          q: "D'où viennent les données ?",
          a: "IGDB, RAWG, SteamSpy et d'autres API de jeux fiables."
        },
        {
          q: "À quelle fréquence les données sont-elles mises à jour ?",
          a: "Les données sont récupérées en temps réel lors de la recherche."
        },
        {
          q: "Pourquoi je ne trouve pas le jeu que je cherche ?",
          a: "Soit le jeu n'est pas dans notre base de données, soit il est enregistré sous un autre nom. Essayez avec des mots-clés différents."
        },
        {
          q: "D'où viennent les évaluations ?",
          a: "Les évaluations proviennent d'IGDB et de RAWG, utilisant les notes Metacritic et les avis des utilisateurs."
        },
        {
          q: "Pourquoi limitez-vous les résultats de recherche au Top 50 ?",
          a: "Si vous ne trouvez pas votre jeu parmi les 50 premiers résultats, essayez d'affiner votre recherche ou vérifiez l'orthographe. La limite permet de garantir performance et pertinence."
        },
        {
          q: "Quel est le format de date ?",
          a: "Mois / Jour / Année (MM/JJ/AAAA)."
        }
      ]
    }
  };

  const { title, questions } = text[language];

  return (
    <div className="faq-page">
      <div className="faq-content">
        <h2 className="faq-title">
          <span className="question-icon">❓</span>
          {title}
        </h2>

        <ul className="faq-list">
          {questions.map(({ q, a }, idx) => (
            <li className="faq-item" key={idx}>
              <strong className="faq-question">{q}</strong>
              <p className="faq-answer">{a}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FAQPage;
