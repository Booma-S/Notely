import React, { useState, useEffect, useCallback, useMemo } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import NoteCard from '../components/NoteCard';
import NoteForm from '../components/NoteForm';
import SearchBar from '../components/SearchBar';
import TagFilter from '../components/TagFilter';
import Loader from '../components/Loader';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  // Modal states for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch notes with optional query parameters
  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (selectedTag.trim()) {
        params.tag = selectedTag.trim();
      }
      if (showPinnedOnly) {
        params.pinned = 'true';
      }

      const { data } = await API.get('/notes', { params });
      setNotes(data);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
      setError(err.response?.data?.message || 'Failed to load notes. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedTag, showPinnedOnly]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Extract all unique tags across notes for the filter
  const allTags = useMemo(() => {
    const tagSet = new Set();
    notes.forEach((note) => {
      if (Array.isArray(note.tags)) {
        note.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet);
  }, [notes]);

  // Separate pinned and unpinned notes when viewing combined list
  const { pinnedNotes, regularNotes } = useMemo(() => {
    const pinned = [];
    const regular = [];
    notes.forEach((note) => {
      if (note.pinned) {
        pinned.push(note);
      } else {
        regular.push(note);
      }
    });
    return { pinnedNotes: pinned, regularNotes: regular };
  }, [notes]);

  // Create or Update note
  const handleSaveNote = async (formData) => {
    setIsSaving(true);
    try {
      if (noteToEdit) {
        // PUT /api/notes/:id
        const { data: updated } = await API.put(`/notes/${noteToEdit._id}`, formData);
        setNotes((prev) =>
          prev.map((n) => (n._id === updated._id ? updated : n))
        );
      } else {
        // POST /api/notes
        const { data: created } = await API.post('/notes', formData);
        setNotes((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
      setNoteToEdit(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save note.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete note
  const handleDeleteNote = async (id) => {
    try {
      await API.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete note.');
    }
  };

  // Toggle Pin status
  const handleTogglePin = async (id, newPinnedState) => {
    try {
      const { data: updated } = await API.put(`/notes/${id}`, { pinned: newPinnedState });
      setNotes((prev) => {
        const nextList = prev.map((n) => (n._id === updated._id ? updated : n));
        // Keep pinned notes first, then latest updated
        return nextList.sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update pin status.');
    }
  };

  const handleOpenCreateModal = () => {
    setNoteToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (note) => {
    setNoteToEdit(note);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNoteToEdit(null);
  };

  const handleTagClick = (tag) => {
    setSelectedTag((prev) => (prev === tag ? '' : tag));
  };

  return (
    <div className="dashboard-layout">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <span className="brand-icon">📝</span>
            <span className="brand-title">Personal Notes</span>
          </div>

          <div className="navbar-user">
            <span className="user-greeting">
              Hello, <strong>{user?.name || 'User'}</strong>
            </span>
            <button
              type="button"
              className="btn-logout"
              onClick={logout}
              title="Log out"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="dashboard-content">
        {/* Controls Section */}
        <section className="dashboard-controls">
          <div className="controls-row">
            <div className="search-wrapper">
              <SearchBar onSearch={setSearchQuery} />
            </div>

            <div className="actions-wrapper">
              <button
                type="button"
                className={`btn-filter ${showPinnedOnly ? 'active' : ''}`}
                onClick={() => setShowPinnedOnly((prev) => !prev)}
                title="Toggle pinned notes only"
              >
                📌 {showPinnedOnly ? 'All Notes' : 'Pinned Only'}
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={handleOpenCreateModal}
              >
                + New Note
              </button>
            </div>
          </div>

          {/* Tag Filter Bar */}
          <TagFilter
            tags={allTags}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
          />
        </section>

        {/* Notes Grid Area */}
        {loading ? (
          <Loader message="Loading your notes..." />
        ) : error ? (
          <div className="state-card error-card">
            <p>{error}</p>
            <button type="button" className="btn-secondary" onClick={fetchNotes}>
              Retry
            </button>
          </div>
        ) : notes.length === 0 ? (
          <div className="state-card empty-card">
            <div className="empty-icon">📂</div>
            <h3>
              {searchQuery || selectedTag || showPinnedOnly
                ? 'No matching notes found'
                : 'No notes yet'}
            </h3>
            <p>
              {searchQuery || selectedTag || showPinnedOnly
                ? 'Try clearing your search or filter tags to see more notes.'
                : 'Get started by creating your very first note!'}
            </p>
            {searchQuery || selectedTag || showPinnedOnly ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag('');
                  setShowPinnedOnly(false);
                }}
              >
                Clear Filters
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={handleOpenCreateModal}
              >
                + Create Note
              </button>
            )}
          </div>
        ) : (
          <div className="notes-container">
            {/* If not filtering by pinned-only, display cleanly separated pinned & other sections */}
            {!showPinnedOnly && pinnedNotes.length > 0 && (
              <div className="notes-section">
                <h2 className="section-title">📌 Pinned Notes ({pinnedNotes.length})</h2>
                <div className="notes-grid">
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      onEdit={handleOpenEditModal}
                      onDelete={handleDeleteNote}
                      onTogglePin={handleTogglePin}
                      onTagClick={handleTagClick}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="notes-section">
              {!showPinnedOnly && pinnedNotes.length > 0 && (
                <h2 className="section-title">Other Notes ({regularNotes.length})</h2>
              )}
              <div className="notes-grid">
                {(showPinnedOnly ? notes : regularNotes).map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteNote}
                    onTogglePin={handleTogglePin}
                    onTagClick={handleTagClick}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Note Form Modal */}
      {isModalOpen && (
        <NoteForm
          noteToEdit={noteToEdit}
          onSave={handleSaveNote}
          onCancel={handleCloseModal}
          isSaving={isSaving}
        />
      )}
    </div>
  );
};

export default Dashboard;
