export default function Navbar({ setCurrentPage }) {
  const navItems = [
    { key: "home", label: "Home" },
    { key: "search", label: "Search" },
    { key: "faq", label: "FAQ" },
    { key: "review", label: "Leave a Review" },
  ];

  return (
    <nav className="bg-gray-800 p-4 text-white shadow-md">
      <ul className="flex gap-6 justify-center">
        {navItems.map(({ key, label }) => (
          <li key={key}>
            <button
              onClick={() => setCurrentPage(key)}
              className="hover:text-yellow-300 transition duration-200"
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}