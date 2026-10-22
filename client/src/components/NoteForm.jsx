import React, { useState, useEffect } from 'react';

const COLOR_PALETTE = [
  { label: 'Default', value: '#ffffff', border: '#cbd5e1' },
  { label: 'Peach', value: '#fee2e2', border: '#fca5a5' },
  { label: 'Amber', value: '#fef3c7', border: '#fcd34d' },
  { label: 'Mint', value: '#d1fae5', border: '#6ee7b7' },
  { label: 'Sky', value: '#e0f2fe', border: '#7dd3fc' },
  { label: 'Lavender', value: '#ede9fe', border: '#c4b5fd' },
];

const NoteForm = ({ noteToEdit, onSave, onCancel, isSaving }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [pinned, setPinned] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title || '');
      setContent(noteToEdit.content || '');
      setTagsInput(noteToEdit.tags ? noteToEdit.tags.join(', ') : '');
      setPinned(noteToEdit.pinned || false);
      setColor(noteToEdit.color || '#ffffff');
    } else {
      setTitle('');
      setContent('');
      setTagsInput('');
      setPinned(false);
      setColor('#ffffff');
    }
    setErrors({});
  }, [noteToEdit]);

  const validate = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }

    if (content.length > 5000) {
      newErrors.content = 'Content cannot exceed 5000 characters';
    }

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const uniqueTags = [...new Set(parsedTags)];
    if (uniqueTags.length > 10) {
      newErrors.tags = 'Maximum of 10 tags allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    onSave({
      title: title.trim(),
      content: content.trim(),
      tags: [...new Set(parsedTags)],
      pinned,
      color,
    });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-card"
        style={{ backgroundColor: color !== '#ffffff' ? color : '#ffffff' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{noteToEdit ? 'Edit Note' : 'Create New Note'}</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onCancel}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="note-form">
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="title">
                Title <span className="required-star">*</span>
              </label>
              <span className={`char-count ${title.length > 100 ? 'char-exceeded' : ''}`}>
                {title.length}/100
              </span>
            </div>
            <input
              id="title"
              type="text"
              placeholder="e.g. Sprint planning"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? 'input-error' : ''}
              autoFocus
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="content">Content</label>
              <span className={`char-count ${content.length > 5000 ? 'char-exceeded' : ''}`}>
                {content.length}/5000
              </span>
            </div>
            <textarea
              id="content"
              rows="6"
              placeholder="Write your note details here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={errors.content ? 'input-error' : ''}
            ></textarea>
            {errors.content && <span className="error-message">{errors.content}</span>}
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="tags">Tags (comma-separated, max 10)</label>
            </div>
            <input
              id="tags"
              type="text"
              placeholder="e.g. work, meeting, cubrics"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className={errors.tags ? 'input-error' : ''}
            />
            {errors.tags && <span className="error-message">{errors.tags}</span>}
            <small className="form-hint">Separate multiple tags with commas</small>
          </div>

          {/* Color Palette Picker */}
          <div className="form-group">
            <label className="color-picker-label">Note Color</label>
            <div className="color-palette-options">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`color-swatch ${color === c.value ? 'selected' : ''}`}
                  style={{ backgroundColor: c.value, borderColor: c.border }}
                  onClick={() => setColor(c.value)}
                  title={c.label}
                  aria-label={`Select ${c.label} color`}
                >
                  {color === c.value && <span className="swatch-check">✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group-checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
              />
              <span>📌 Pin note to top</span>
            </label>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : noteToEdit ? 'Save Changes' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteForm;
