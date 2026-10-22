import React, { useState } from 'react';

const NoteCard = ({ note, onEdit, onDelete, onTogglePin, onTagClick }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete(note._id);
    } else {
      setConfirmDelete(true);
    }
  };

  return (
    <div className={`note-card ${note.pinned ? 'pinned-note' : ''}`}>
      <div className="note-card-header">
        <h3 className="note-title">{note.title}</h3>
        <button
          type="button"
          className={`pin-btn ${note.pinned ? 'is-pinned' : ''}`}
          onClick={() => onTogglePin(note._id, !note.pinned)}
          title={note.pinned ? 'Unpin note' : 'Pin note to top'}
          aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
        >
          {note.pinned ? '📌' : '📍'}
        </button>
      </div>

      <div className="note-body">
        {note.content ? (
          <p className="note-content">{note.content}</p>
        ) : (
          <p className="note-content empty-content">(No content)</p>
        )}
      </div>

      {note.tags && note.tags.length > 0 && (
        <div className="note-tags">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="note-tag"
              onClick={() => onTagClick && onTagClick(tag)}
              title={`Filter by #${tag}`}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="note-card-footer">
        <span className="note-date">
          Updated: {formatDate(note.updatedAt || note.createdAt)}
        </span>

        <div className="note-actions">
          <button
            type="button"
            className="btn-icon edit-btn"
            onClick={() => onEdit(note)}
            title="Edit note"
            aria-label="Edit note"
          >
            ✏️ Edit
          </button>

          {confirmDelete ? (
            <div className="delete-confirm-group">
              <button
                type="button"
                className="btn-danger btn-sm"
                onClick={handleDeleteClick}
              >
                Confirm?
              </button>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn-icon delete-btn"
              onClick={handleDeleteClick}
              title="Delete note"
              aria-label="Delete note"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
