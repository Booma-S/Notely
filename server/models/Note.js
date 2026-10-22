const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    content: {
      type: String,
      trim: true,
      maxlength: [5000, 'Content cannot exceed 5000 characters'],
      default: '',
    },
    tags: {
      type: [String],
      validate: [
        {
          validator: function (val) {
            return !val || val.length <= 10;
          },
          message: 'Maximum of 10 tags allowed',
        },
      ],
      set: function (tags) {
        if (!Array.isArray(tags)) return [];
        // Trim, lowercase, and deduplicate tags
        const cleaned = tags
          .map((tag) => (typeof tag === 'string' ? tag.trim().toLowerCase() : ''))
          .filter((tag) => tag.length > 0);
        return [...new Set(cleaned)];
      },
      default: [],
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: '#ffffff',
      trim: true,
    },
    isTrashed: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user notes sorted by pinned first, then most recently updated
noteSchema.index({ user: 1, pinned: -1, updatedAt: -1 });

// Text index on title and content for search support
noteSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Note', noteSchema);
