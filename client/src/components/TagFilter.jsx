import React from 'react';

const TagFilter = ({ tags = [], selectedTag, onSelectTag }) => {
  if (!tags.length) return null;

  return (
    <div className="tag-filter-container">
      <span className="tag-filter-label">Filter by tag:</span>
      <div className="tag-chips">
        <button
          type="button"
          className={`tag-chip ${!selectedTag ? 'active' : ''}`}
          onClick={() => onSelectTag('')}
        >
          All Notes
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            className={`tag-chip ${selectedTag === tag ? 'active' : ''}`}
            onClick={() => onSelectTag(selectedTag === tag ? '' : tag)}
          >
            #{tag}
            {selectedTag === tag && <span className="chip-remove"> ×</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TagFilter;
