import './css/Navbar.css';

export default function Navbar({ setCurrentPage }) {
  const navItems = [
    { key: "home", label: "Home" },
    { key: "search", label: "Search" },
    { key: "faq", label: "FAQ" },
    { key: "review", label: "Leave a Review" },
  ];

  return (
    <nav>
      <ul>
        {navItems.map(({ key, label }) => (
          <li key={key}>
            <button onClick={() => setCurrentPage(key)}>
              {label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}