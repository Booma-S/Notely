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

  // Navigation tab: 'active' | 'trash'
  const [currentTab, setCurrentTab] = useState('active');

  const [notes, setNotes] = useState([]);
  const [trashNotes, setTrashNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering & Search states (for active tab)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  // Modal states for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch active notes
  const fetchActiveNotes = useCallback(async () => {
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

  // Fetch trashed notes
  const fetchTrashNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await API.get('/notes', { params: { trashed: 'true' } });
      setTrashNotes(data);
    } catch (err) {
      console.error('Failed to fetch trash notes:', err);
      setError(err.response?.data?.message || 'Failed to load trash.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch trash count quietly on startup
  const refreshTrashCount = useCallback(async () => {
    try {
      const { data } = await API.get('/notes', { params: { trashed: 'true' } });
      setTrashNotes(data);
    } catch (err) {
      // quiet fail
    }
  }, []);

  useEffect(() => {
    if (currentTab === 'active') {
      fetchActiveNotes();
      refreshTrashCount();
    } else {
      fetchTrashNotes();
    }
  }, [currentTab, fetchActiveNotes, fetchTrashNotes, refreshTrashCount]);

  // Extract all unique tags across active notes
  const allTags = useMemo(() => {
    const tagSet = new Set();
    notes.forEach((note) => {
      if (Array.isArray(note.tags)) {
        note.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet);
  }, [notes]);

  // Separate pinned and unpinned notes
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
        const { data: updated } = await API.put(`/notes/${noteToEdit._id}`, formData);
        setNotes((prev) =>
          prev.map((n) => (n._id === updated._id ? updated : n))
        );
      } else {
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

  // Move note to trash (Soft Delete)
  const handleDeleteNote = async (id) => {
    try {
      await API.delete(`/notes/${id}`);
      const trashedItem = notes.find((n) => n._id === id);
      setNotes((prev) => prev.filter((n) => n._id !== id));
      if (trashedItem) {
        setTrashNotes((prev) => [{ ...trashedItem, isTrashed: true }, ...prev]);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete note.');
    }
  };

  // Restore note from trash
  const handleRestoreNote = async (id) => {
    try {
      const { data: restored } = await API.put(`/notes/${id}`, { isTrashed: false });
      setTrashNotes((prev) => prev.filter((n) => n._id !== id));
      setNotes((prev) => [restored, ...prev]);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to restore note.');
    }
  };

  // Delete note permanently from trash
  const handlePermanentDelete = async (id) => {
    try {
      await API.delete(`/notes/${id}?permanent=true`);
      setTrashNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete note permanently.');
    }
  };

  // Empty entire trash
  const handleEmptyTrash = async () => {
    if (!window.confirm('Are you sure you want to permanently delete all notes in the Trash?')) {
      return;
    }
    try {
      await API.delete('/notes/trash/empty');
      setTrashNotes([]);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to empty trash.');
    }
  };

  // Toggle Pin status
  const handleTogglePin = async (id, newPinnedState) => {
    try {
      const { data: updated } = await API.put(`/notes/${id}`, { pinned: newPinnedState });
      setNotes((prev) => {
        const nextList = prev.map((n) => (n._id === updated._id ? updated : n));
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
        {/* Navigation Tabs (Active Notes vs Trash) */}
        <div className="nav-tabs">
          <button
            type="button"
            className={`nav-tab-btn ${currentTab === 'active' ? 'active' : ''}`}
            onClick={() => setCurrentTab('active')}
          >
            📋 All Notes ({notes.length})
          </button>
          <button
            type="button"
            className={`nav-tab-btn ${currentTab === 'trash' ? 'active' : ''}`}
            onClick={() => setCurrentTab('trash')}
          >
            🗑️ Trash ({trashNotes.length})
          </button>
        </div>

        {/* ACTIVE NOTES TAB */}
        {currentTab === 'active' && (
          <>
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
                <button type="button" className="btn-secondary" onClick={fetchActiveNotes}>
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
                {/* Pinned Section */}
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

                {/* Regular Notes Section */}
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
          </>
        )}

        {/* TRASH CAN TAB */}
        {currentTab === 'trash' && (
          <div className="trash-view-container">
            <div className="trash-header">
              <div>
                <h2>🗑️ Trash Can</h2>
                <p className="trash-subtitle">
                  Notes here can be restored back to your dashboard or deleted forever.
                </p>
              </div>

              {trashNotes.length > 0 && (
                <button
                  type="button"
                  className="btn-danger"
                  onClick={handleEmptyTrash}
                >
                  Empty Trash
                </button>
              )}
            </div>

            {loading ? (
              <Loader message="Loading trash..." />
            ) : trashNotes.length === 0 ? (
              <div className="state-card empty-card">
                <div className="empty-icon">✨</div>
                <h3>Trash is empty</h3>
                <p>Deleted notes will appear here so you can recover them anytime.</p>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setCurrentTab('active')}
                >
                  Back to All Notes
                </button>
              </div>
            ) : (
              <div className="notes-grid">
                {trashNotes.map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    isTrashView={true}
                    onRestore={handleRestoreNote}
                    onPermanentDelete={handlePermanentDelete}
                  />
                ))}
              </div>
            )}
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
