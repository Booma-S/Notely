process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_12345';
process.env.JWT_EXPIRES_IN = '1d';

const { test, describe, before, beforeEach } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const app = require('../server');
const User = require('../models/User');
const Note = require('../models/Note');

// In-memory data store for isolated testing
let usersDB = [];
let notesDB = [];

// Setup mocks for User and Note models
before(() => {
  // Mock User methods
  User.findOne = (query) => {
    let result = usersDB.find((u) => {
      if (query.email && u.email === query.email) return true;
      return false;
    });

    const queryObj = {
      select: (fields) => {
        if (!result) return Promise.resolve(null);
        return Promise.resolve(result);
      },
      then: (resolve, reject) => {
        resolve(result || null);
      },
    };
    return queryObj;
  };

  User.findById = (id) => {
    const user = usersDB.find((u) => u._id.toString() === id.toString());
    return {
      select: () => Promise.resolve(user || null),
      then: (resolve) => resolve(user || null),
    };
  };

  User.create = async (userData) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    const newUser = {
      _id: new mongoose.Types.ObjectId(),
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      matchPassword: async function (entered) {
        return await bcrypt.compare(entered, this.password);
      },
    };
    usersDB.push(newUser);
    return newUser;
  };

  // Mock Note methods
  Note.find = (query) => {
    let results = notesDB.filter((n) => {
      if (query.user && n.user.toString() !== query.user.toString()) {
        return false;
      }
      if (query.pinned !== undefined && n.pinned !== query.pinned) {
        return false;
      }
      if (query.tags && !n.tags.includes(query.tags)) {
        return false;
      }
      if (query.$or) {
        const matchesOr = query.$or.some((condition) => {
          if (condition.title) {
            return condition.title.test(n.title);
          }
          if (condition.content) {
            return condition.content.test(n.content);
          }
          return false;
        });
        if (!matchesOr) return false;
      }
      return true;
    });

    return {
      sort: (sortCriteria) => {
        // pinned: -1, updatedAt: -1
        results.sort((a, b) => {
          if (a.pinned !== b.pinned) {
            return a.pinned ? -1 : 1;
          }
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
        return Promise.resolve(results);
      },
      then: (resolve) => resolve(results),
    };
  };

  Note.create = async (noteData) => {
    const newNote = {
      _id: new mongoose.Types.ObjectId(),
      user: noteData.user,
      title: noteData.title,
      content: noteData.content || '',
      tags: noteData.tags || [],
      pinned: !!noteData.pinned,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    notesDB.push(newNote);
    return newNote;
  };

  Note.findOneAndUpdate = async (filter, update, options) => {
    const note = notesDB.find(
      (n) => n._id.toString() === filter._id.toString() && n.user.toString() === filter.user.toString()
    );
    if (!note) return null;

    if (update.$set) {
      if (update.$set.title !== undefined) note.title = update.$set.title;
      if (update.$set.content !== undefined) note.content = update.$set.content;
      if (update.$set.tags !== undefined) note.tags = update.$set.tags;
      if (update.$set.pinned !== undefined) note.pinned = update.$set.pinned;
    }
    note.updatedAt = new Date().toISOString();
    return note;
  };

  Note.findOneAndDelete = async (filter) => {
    const index = notesDB.findIndex(
      (n) => n._id.toString() === filter._id.toString() && n.user.toString() === filter.user.toString()
    );
    if (index === -1) return null;
    const [deleted] = notesDB.splice(index, 1);
    return deleted;
  };
});

describe('Cubrics Notes App API Test Checklist (Section 7.1)', () => {
  let user1Token;
  let user2Token;
  let user1Id;
  let user2Id;
  let user1NoteId;

  beforeEach(() => {
    // Reset databases before each full test run
  });

  // #1 Register with valid data -> 201 + token
  test('#1: Register with valid data returns 201 and token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@example.com', password: 'password123' });

    assert.strictEqual(res.status, 201);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.name, 'Alice');
    assert.strictEqual(res.body.user.email, 'alice@example.com');
    user1Token = res.body.token;
    user1Id = res.body.user._id;
  });

  // #2 Register with duplicate email -> 409
  test('#2: Register with a duplicate email returns 409', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice Clone', email: 'alice@example.com', password: 'password123' });

    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.body.message, 'Email already registered');
  });

  // #3 Register with invalid email or short password -> 400
  test('#3: Register with invalid email or short password returns 400', async () => {
    const invalidEmailRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bob', email: 'not-an-email', password: 'password123' });
    assert.strictEqual(invalidEmailRes.status, 400);

    const shortPassRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bob', email: 'bob@example.com', password: '123' });
    assert.strictEqual(shortPassRes.status, 400);
  });

  // #4 Login with correct credentials -> 200 + token
  test('#4: Login with correct credentials returns 200 and token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@example.com', password: 'password123' });

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.email, 'alice@example.com');
  });

  // #5 Login with wrong password -> 401
  test('#5: Login with a wrong password returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@example.com', password: 'wrongpassword' });

    assert.strictEqual(res.status, 401);
    assert.ok(res.body.message);
  });

  // Create User 2 for isolation tests
  test('Setup User 2', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bob', email: 'bob@example.com', password: 'password123' });

    assert.strictEqual(res.status, 201);
    user2Token = res.body.token;
    user2Id = res.body.user._id;
  });

  // #6 GET /api/notes without a token -> 401
  test('#6: GET /api/notes without a token returns 401', async () => {
    const res = await request(app).get('/api/notes');
    assert.strictEqual(res.status, 401);
  });

  // #8 POST /api/notes with a valid body -> 201 + note object
  test('#8: POST /api/notes with a valid body returns 201 + note object', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        title: 'Sprint planning',
        content: 'Discuss API contract and deadlines.',
        tags: ['work', 'meeting'],
        pinned: true,
      });

    assert.strictEqual(res.status, 201);
    assert.ok(res.body._id);
    assert.strictEqual(res.body.title, 'Sprint planning');
    assert.strictEqual(res.body.pinned, true);
    assert.deepStrictEqual(res.body.tags, ['work', 'meeting']);
    user1NoteId = res.body._id;
  });

  // #7 GET /api/notes with a valid token -> 200 + only the user's notes
  test("#7: GET /api/notes with valid token returns 200 + only user's notes", async () => {
    const res = await request(app)
      .get('/api/notes')
      .set('Authorization', `Bearer ${user1Token}`);

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.strictEqual(res.body.length, 1);
    assert.strictEqual(res.body[0].title, 'Sprint planning');

    // User 2 should have 0 notes
    const res2 = await request(app)
      .get('/api/notes')
      .set('Authorization', `Bearer ${user2Token}`);

    assert.strictEqual(res2.status, 200);
    assert.strictEqual(res2.body.length, 0);
  });

  // #9 POST /api/notes without a title -> 400
  test('#9: POST /api/notes without a title returns 400', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ content: 'Missing title note' });

    assert.strictEqual(res.status, 400);
    assert.ok(res.body.message);
  });

  // #10 PUT /api/notes/:id on own note -> 200 + updated note
  test('#10: PUT /api/notes/:id on own note returns 200 + updated note', async () => {
    const res = await request(app)
      .put(`/api/notes/${user1NoteId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: 'Updated Sprint planning' });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.title, 'Updated Sprint planning');
  });

  // #11 PUT /api/notes/:id on another user's note -> 404
  test("#11: PUT /api/notes/:id on another user's note returns 404", async () => {
    const res = await request(app)
      .put(`/api/notes/${user1NoteId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ title: 'Hacked title' });

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.message, 'Note not found');
  });

  // #14 Request with an invalid note ID format -> 400 or 404, no crash
  test('#14: Request with an invalid note ID format returns 400/404 without crashing', async () => {
    const res = await request(app)
      .put('/api/notes/invalid-id-123')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: 'New title' });

    assert.ok(res.status === 400 || res.status === 404);
    assert.ok(res.body.message);
  });

  // #15 ?search= returns matching notes only
  test('#15: ?search= returns matching notes only', async () => {
    // Add another note for user 1
    await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        title: 'Grocery shopping',
        content: 'Buy milk, eggs, bread',
        tags: ['personal'],
        pinned: false,
      });

    const searchRes = await request(app)
      .get('/api/notes?search=grocery')
      .set('Authorization', `Bearer ${user1Token}`);

    assert.strictEqual(searchRes.status, 200);
    assert.strictEqual(searchRes.body.length, 1);
    assert.strictEqual(searchRes.body[0].title, 'Grocery shopping');
  });

  // #16 ?tag= returns notes with that tag only
  test('#16: ?tag= returns notes with that tag only', async () => {
    const tagRes = await request(app)
      .get('/api/notes?tag=work')
      .set('Authorization', `Bearer ${user1Token}`);

    assert.strictEqual(tagRes.status, 200);
    assert.strictEqual(tagRes.body.length, 1);
    assert.strictEqual(tagRes.body[0].title, 'Updated Sprint planning');
  });

  // #17 Pinned notes appear first in the list
  test('#17: Pinned notes appear first in the list', async () => {
    const res = await request(app)
      .get('/api/notes')
      .set('Authorization', `Bearer ${user1Token}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.length, 2);
    assert.strictEqual(res.body[0].pinned, true);
    assert.strictEqual(res.body[1].pinned, false);
  });

  // #18 Request body tries to set user to another ID -> Ignored
  test('#18: Request body tries to set user to another ID -> Ignored', async () => {
    const fakeUserId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        title: 'Security isolation test',
        user: fakeUserId.toString(),
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.user.toString(), user1Id.toString());
    assert.notStrictEqual(res.body.user.toString(), fakeUserId.toString());
  });

  // #13 DELETE /api/notes/:id on another user's note -> 404
  test("#13: DELETE /api/notes/:id on another user's note returns 404", async () => {
    const res = await request(app)
      .delete(`/api/notes/${user1NoteId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.message, 'Note not found');
  });

  // #12 DELETE /api/notes/:id on own note -> 200
  test('#12: DELETE /api/notes/:id on own note returns 200', async () => {
    const res = await request(app)
      .delete(`/api/notes/${user1NoteId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.id, user1NoteId);
    assert.strictEqual(res.body.message, 'Note deleted successfully');
  });
});
