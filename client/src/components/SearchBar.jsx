import React, { useState, useEffect } from 'react';

const SearchBar = ({ onSearch, initialValue = '' }) => {
  const [term, setTerm] = useState(initialValue);

  // Debounce search input by 400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(term);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [term, onSearch]);

  const handleClear = () => {
    setTerm('');
    onSearch('');
  };

  return (
    <div className="search-bar">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        placeholder="Search notes by title or content..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="search-input"
      />
      {term && (
        <button
          type="button"
          onClick={handleClear}
          className="search-clear-btn"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBar;
