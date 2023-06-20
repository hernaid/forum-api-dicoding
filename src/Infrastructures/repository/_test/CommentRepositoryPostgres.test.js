const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const pool = require('../../database/postgres/pool');

describe('CommentRepositoryPostgres', () => { 
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => { 
    it('should persist add comment and return added comment correctly', async () => {
      // Arrange
      const commentPayload = {
        content: 'A New Comment',
        owner: 'user-1001',
        threadId: 'thread-1001',
      }
      const addComment = new AddComment(commentPayload);
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({ id: commentPayload.owner });
      await ThreadsTableTestHelper.addThread({ id: commentPayload.threadId, owner: commentPayload.owner });
      await commentRepositoryPostgres.addComment(addComment);

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comment).toHaveLength(1);
    });

    it('should return registered comment correctly', async () => {
      // Arrange
      const commentPayload = {
        content: 'A New Comment',
        owner: 'user-1001',
        threadId: 'thread-1001',
      };

      const addComment = new AddComment(commentPayload);
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({ id: commentPayload.owner });
      await ThreadsTableTestHelper.addThread({ id: commentPayload.threadId, owner: commentPayload.owner });
      const addedComment = await commentRepositoryPostgres.addComment(addComment);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: commentPayload.content,
        owner: commentPayload.owner,
        threadId: commentPayload.threadId,
      }));
    });
  });

  describe('verifyAvailableComment function', () => {
    it('should throw InvariantError when comment not available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      
      // Action & Assert
      return expect(commentRepositoryPostgres.verifyAvailableComment('comment-1001')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw InvariantError when comment available', async () => {
      // Arrange
      const commentId = 'comment-1001';
      const userId = 'user-1001';
      const threadId = 'thread-1001';
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, threadId: threadId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(commentRepositoryPostgres.verifyAvailableComment(commentId)).resolves.not.toThrow(InvariantError);
    });
  });

  describe('verifyOwnerComment function', () => { 
    it('should throw UnauthorizedError when userId is not the comment owner', async () => {
      // Arrange
      const commentId = 'comment-1001';
      const userId = 'user-1001';
      const unauthorizedUserId = 'user-1234';
      await UsersTableTestHelper.addUser({ id: userId }); 
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId }); 
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      expect(commentRepositoryPostgres.verifyOwnerComment(commentId, unauthorizedUserId)).rejects.toThrowError(AuthorizationError);
    });

    it('should verify the comment owner correctly', async () => {
      // Arrange
      const commentId = 'comment-1001';
      const userId = 'user-1001';
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      expect(commentRepositoryPostgres.verifyOwnerComment(commentId, userId)).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteCommentById function', () => {
    it('should throw NotFoundError when comment not found', () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(commentRepositoryPostgres.deleteCommentById('comment-123')).rejects.toThrowError(NotFoundError);
    });

    it('should delete comment by id and return success correctly', async () => {
      // Arrange
      const commentId = 'comment-1001';
      const userId = 'user-1001';
      const threadId = 'thread-1001';
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, threadId: threadId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteCommentById(commentId);

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById(commentId);
      expect(comment).toHaveLength(1);
      expect(comment[0].is_delete).toEqual(true);
    });
  });

  describe('getCommentByThreadId function', () => {
    it('should return comments by threadId correctly', async () => {
      // Arrange
      const userId = 'user-1001';
      const usernameTest = 'usertest';
      const threadId = 'thread-1001';
      const firstCommentPayload = {
        id: 'comment-1001', 
        content: 'First Comment',
        owner: userId, 
        threadId: threadId,
        dateAt: new Date().toISOString(),
      }
      const secondCommentPayload = {
        id: 'comment-1002', 
        content: 'Second Comment',
        owner: userId, 
        threadId: threadId,
        dateAt: new Date().toISOString(),
      }

      const expectedFirstComment = {
        id: firstCommentPayload.id,
        content: firstCommentPayload.content,
        username: usernameTest,
        is_delete: false,
        date: firstCommentPayload.dateAt,
      }
      const expectedSecondComment = {
        id: secondCommentPayload.id,
        content: secondCommentPayload.content,
        username: usernameTest,
        is_delete: false,
        date: secondCommentPayload.dateAt,
      }

      await UsersTableTestHelper.addUser({ id: userId, username: usernameTest });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment(firstCommentPayload);
      await CommentsTableTestHelper.addComment(secondCommentPayload);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentByThreadId(threadId);
      
      // Assert
      expect(comments).toBeDefined();
      expect(comments).toHaveLength(2);
      expect(comments[0]).toStrictEqual(expectedFirstComment);
      expect(comments[1]).toStrictEqual(expectedSecondComment);
    });

    it('should return empty array if comment not found by threadId', async () => {
      // Arrange
      const threadId = 'thrad-1001';
      const userId = 'user-1001';
      await UsersTableTestHelper.addUser({ id: userId }); 
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentByThreadId(threadId);

      // Assert
      expect(comments).toBeDefined();
      expect(comments).toHaveLength(0);
    });
  });
});