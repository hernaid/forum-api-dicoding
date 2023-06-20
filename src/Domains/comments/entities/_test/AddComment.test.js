const AddComment = require('../AddComment');

describe('a AddComment Entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'Comment Test',
    };

    // Action and Assert
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 123,
      owner: true,
      threadId: 'thread-123',
    };

    // Action and Assert
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should addComment entities correctly', () => {
    // Arrange
    const payload = {
      content: 'dicoding',
      owner: 'user-1001',
      threadId: 'thread-1001',
    };

    // Action
    const addComment = new AddComment(payload);

    // Assert
    expect(addComment).toBeInstanceOf(AddComment);
    expect(addComment.title).toEqual(payload.title);
    expect(addComment.body).toEqual(payload.body);
    expect(addComment.owner).toEqual(payload.owner);
  });
});