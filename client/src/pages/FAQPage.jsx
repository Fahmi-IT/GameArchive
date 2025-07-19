const FAQPage = () => (
  <div className="p-6">
    <h2 className="text-3xl font-semibold mb-4">❓ Frequently Asked Questions</h2>
    <ul className="space-y-4">
      <li>
        <strong>Where is the data from?</strong><br />
        IGDB, RAWG, SteamSpy, and other trusted gaming APIs.
      </li>
      <li>
        <strong>Can I see pricing?</strong><br />
        Currently we’re exploring Steam pricing support.
      </li>
      <li>
        <strong>How often is the data updated?</strong><br />
        Data is fetched live at the time of search.
      </li>
    </ul>
  </div>
);

export default FAQPage;
