const AddedComment = require('../AddedComment');

describe('a AddedComment Entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-1001',
      content: 'Comment Test',
      owner: 'user-1001',
    };

    // Action and Assert
    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 1001,
      content: ['Comment Test'],
      owner: true,
      threadId: 'thread-1001',
    };

    // Action and Assert
    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should addedComment entities correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-1001',
      content: 'Comment Test',
      owner: 'user-1001',
      threadId: 'thread-1001',
    };

    // Action
    const addedComment = new AddedComment(payload);

    // Assert
    expect(addedComment).toBeInstanceOf(AddedComment);
    expect(addedComment.title).toEqual(payload.title);
    expect(addedComment.body).toEqual(payload.body);
    expect(addedComment.owner).toEqual(payload.owner);
  });
});