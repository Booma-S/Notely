const mongoose = require('mongoose');
const Note = require('../models/Note');

// @desc    Get all notes for authenticated user (supports active vs trashed)
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res, next) => {
  try {
    const { search, tag, pinned, trashed } = req.query;

    // Base query scoped to the authenticated owner
    const query = { user: req.user._id };

    // Separate active notes from trashed notes
    if (trashed === 'true' || trashed === true) {
      query.isTrashed = true;
    } else {
      query.isTrashed = { $ne: true };
    }

    // Search filter across title and content (case-insensitive)
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { content: searchRegex }];
    }

    // Tag filter
    if (tag && tag.trim()) {
      query.tags = tag.trim().toLowerCase();
    }

    // Pinned filter
    if (pinned !== undefined) {
      if (pinned === 'true' || pinned === true) {
        query.pinned = true;
      } else if (pinned === 'false' || pinned === false) {
        query.pinned = false;
      }
    }

    // Default order: pinned notes first, then most recently updated
    const notes = await Note.find(query).sort({ pinned: -1, updatedAt: -1 });

    res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res, next) => {
  try {
    const { title, content, tags, pinned, color } = req.body;

    if (!title || !title.trim()) {
      res.status(400);
      throw new Error('Title is required');
    }

    if (title.trim().length > 100) {
      res.status(400);
      throw new Error('Title cannot exceed 100 characters');
    }

    if (content && content.length > 5000) {
      res.status(400);
      throw new Error('Content cannot exceed 5000 characters');
    }

    let parsedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        parsedTags = tags;
      } else if (typeof tags === 'string') {
        parsedTags = tags.split(',').map((t) => t.trim());
      }
      const uniqueCleanTags = [
        ...new Set(
          parsedTags
            .map((t) => (typeof t === 'string' ? t.trim().toLowerCase() : ''))
            .filter((t) => t.length > 0)
        ),
      ];
      if (uniqueCleanTags.length > 10) {
        res.status(400);
        throw new Error('Maximum of 10 tags allowed');
      }
      parsedTags = uniqueCleanTags;
    }

    // The user field is strictly set from req.user, never from req.body
    const note = await Note.create({
      user: req.user._id,
      title: title.trim(),
      content: content ? content.trim() : '',
      tags: parsedTags,
      pinned: typeof pinned === 'boolean' ? pinned : Boolean(pinned === 'true'),
      color: color && typeof color === 'string' ? color.trim() : '#ffffff',
      isTrashed: false,
    });

    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400);
      throw new Error('Invalid note ID format');
    }

    // Only whitelisted fields can be updated
    const updateData = {};
    const { title, content, tags, pinned, color, isTrashed } = req.body;

    if (title !== undefined) {
      if (!title || !title.trim()) {
        res.status(400);
        throw new Error('Title cannot be empty');
      }
      if (title.trim().length > 100) {
        res.status(400);
        throw new Error('Title cannot exceed 100 characters');
      }
      updateData.title = title.trim();
    }

    if (content !== undefined) {
      if (content && content.length > 5000) {
        res.status(400);
        throw new Error('Content cannot exceed 5000 characters');
      }
      updateData.content = content ? content.trim() : '';
    }

    if (tags !== undefined) {
      let parsedTags = [];
      if (Array.isArray(tags)) {
        parsedTags = tags;
      } else if (typeof tags === 'string') {
        parsedTags = tags.split(',').map((t) => t.trim());
      }
      const uniqueCleanTags = [
        ...new Set(
          parsedTags
            .map((t) => (typeof t === 'string' ? t.trim().toLowerCase() : ''))
            .filter((t) => t.length > 0)
        ),
      ];
      if (uniqueCleanTags.length > 10) {
        res.status(400);
        throw new Error('Maximum of 10 tags allowed');
      }
      updateData.tags = uniqueCleanTags;
    }

    if (pinned !== undefined) {
      updateData.pinned = typeof pinned === 'boolean' ? pinned : Boolean(pinned === 'true');
    }

    if (color !== undefined) {
      updateData.color = typeof color === 'string' ? color.trim() : '#ffffff';
    }

    if (isTrashed !== undefined) {
      updateData.isTrashed = Boolean(isTrashed);
    }

    // Owner-scoped update: only updates if the note belongs to req.user
    const updatedNote = await Note.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedNote) {
      res.status(404);
      throw new Error('Note not found');
    }

    res.status(200).json(updatedNote);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a note (Soft delete to trash, or permanent delete if already trashed or ?permanent=true)
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400);
      throw new Error('Invalid note ID format');
    }

    const note = await Note.findOne({ _id: id, user: req.user._id });

    if (!note) {
      res.status(404);
      throw new Error('Note not found');
    }

    // Permanent delete if already trashed or explicitly requested
    if (permanent === 'true' || note.isTrashed) {
      await Note.findOneAndDelete({ _id: id, user: req.user._id });
      return res.status(200).json({
        message: 'Note deleted successfully',
        id: id,
        permanent: true,
      });
    }

    // Soft delete (move to trash)
    note.isTrashed = true;
    await note.save();

    res.status(200).json({
      message: 'Note deleted successfully',
      id: id,
      isTrashed: true,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Empty all notes in trash for authenticated user
// @route   DELETE /api/notes/trash/empty
// @access  Private
const emptyTrash = async (req, res, next) => {
  try {
    await Note.deleteMany({ user: req.user._id, isTrashed: true });
    res.status(200).json({
      message: 'Trash emptied successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  emptyTrash,
};
