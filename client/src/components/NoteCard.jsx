import React, { useState } from 'react';

const NoteCard = ({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  onTagClick,
  isTrashView = false,
  onRestore,
  onPermanentDelete,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

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
      if (isTrashView && onPermanentDelete) {
        onPermanentDelete(note._id);
      } else {
        onDelete(note._id);
      }
    } else {
      setConfirmDelete(true);
    }
  };

  // Export as Plain Text (.txt)
  const handleExportTxt = () => {
    const textData = `Title: ${note.title}
Tags: ${note.tags && note.tags.length ? note.tags.join(', ') : 'None'}
Updated: ${formatDate(note.updatedAt || note.createdAt)}
----------------------------------------
${note.content || ''}`;

    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.title.replace(/[^a-z0-9_-]/gi, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // Export as Markdown (.md)
  const handleExportMd = () => {
    const mdData = `# ${note.title}

*Tags: ${note.tags && note.tags.length ? note.tags.map((t) => `#${t}`).join(' ') : 'None'}*  
*Last Updated: ${formatDate(note.updatedAt || note.createdAt)}*

---

${note.content || ''}
`;

    const blob = new Blob([mdData], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.title.replace(/[^a-z0-9_-]/gi, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const cardBgColor = note.color && note.color !== '#ffffff' ? note.color : '#ffffff';

  return (
    <div
      className={`note-card ${note.pinned && !isTrashView ? 'pinned-note' : ''}`}
      style={{ backgroundColor: cardBgColor }}
    >
      <div className="note-card-header">
        <h3 className="note-title">{note.title}</h3>

        {!isTrashView && (
          <button
            type="button"
            className={`pin-btn ${note.pinned ? 'is-pinned' : ''}`}
            onClick={() => onTogglePin(note._id, !note.pinned)}
            title={note.pinned ? 'Unpin note' : 'Pin note to top'}
            aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
          >
            {note.pinned ? '📌' : '📍'}
          </button>
        )}
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
          {isTrashView ? (
            /* Trash Actions */
            <div className="trash-card-actions">
              <button
                type="button"
                className="btn-icon restore-btn"
                onClick={() => onRestore && onRestore(note._id)}
                title="Restore note to active dashboard"
              >
                ♻️ Restore
              </button>

              {confirmDelete ? (
                <div className="delete-confirm-group">
                  <button
                    type="button"
                    className="btn-danger btn-sm"
                    onClick={handleDeleteClick}
                  >
                    Delete Forever?
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
                  title="Permanently delete note"
                >
                  🗑️
                </button>
              )}
            </div>
          ) : (
            /* Active Note Actions */
            <>
              {/* Export Menu */}
              <div className="export-menu-container">
                <button
                  type="button"
                  className="btn-icon export-trigger-btn"
                  onClick={() => setShowExportMenu((prev) => !prev)}
                  title="Export note"
                  aria-label="Export note"
                >
                  📥
                </button>

                {showExportMenu && (
                  <div className="export-dropdown">
                    <button type="button" onClick={handleExportTxt}>
                      📄 Text (.txt)
                    </button>
                    <button type="button" onClick={handleExportMd}>
                      📝 Markdown (.md)
                    </button>
                  </div>
                )}
              </div>

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
                    Trash?
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
                  title="Move note to trash"
                  aria-label="Move note to trash"
                >
                  🗑️
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
