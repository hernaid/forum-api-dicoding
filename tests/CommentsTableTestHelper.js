/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123', content = 'comment', threadId = 'thread-123', owner = 'user-123', isDelete = false, dateAt = new Date().toISOString()
  }) {
    const query = {
      text: 'INSERT INTO comments(id, content, thread_id, owner, created_at, updated_at, is_delete) VALUES($1, $2, $3, $4, $5, $5, $6)',
      values: [id, content, threadId, owner, dateAt, isDelete]
    }

    await pool.query(query);
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
}

module.exports = CommentsTableTestHelper;
