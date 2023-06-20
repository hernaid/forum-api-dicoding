class AddedComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, content, owner, threadId } = payload;

    this.id = id;
    this.content = content;
    this.owner = owner;
    this.threadId = threadId;
  }

  _verifyPayload({ id, content, owner, threadId }) {
    if (!id || !content || !owner || !threadId) {
      throw new Error('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof content !== 'string' || typeof owner !== 'string' || typeof threadId !== 'string') {
      throw new Error('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddedComment;
