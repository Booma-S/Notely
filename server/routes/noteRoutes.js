const express = require('express');
const router = express.Router();
const {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  emptyTrash,
} = require('../controllers/noteController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getNotes)
  .post(protect, createNote);

// Empty trash route (must come before /:id)
router.delete('/trash/empty', protect, emptyTrash);

router.route('/:id')
  .put(protect, updateNote)
  .delete(protect, deleteNote);

module.exports = router;
