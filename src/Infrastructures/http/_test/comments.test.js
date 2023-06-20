const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const TokenTestHelper = require('../../../../tests/TokenTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const requestPayload = { 
        content: 'A New Comment' 
      };
      const threadId = 'thread-1001';
      const userId = 'user-1001';

      const server = await createServer(container);
      const accessToken = await TokenTestHelper.getAccessToken();

      // Action
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: true,
      };
      const threadId = 'thread-1001';
      const userId = 'user-1001';

      const server = await createServer(container);
      const accessToken = await TokenTestHelper.getAccessToken();

      // Action
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena tipe data tidak sesuai');
    });

    it('should response 400 when request payload properti yang dibutuhkan tidak ada', async () => {
      // Arrange
      const requestPayload = { };
      const threadId = 'thread-1001';
      const userId = 'user-1001';

      const server = await createServer(container);
      const accessToken = await TokenTestHelper.getAccessToken();

      // Action
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 201 and persisted delete comment', async () => {
      // Arrange
      const threadId = 'thread-1001';
      const userId = 'user-1001';
      const commentId = 'comment-1001';

      const server = await createServer(container);
      const accessToken = await TokenTestHelper.getAccessToken();

      // Action
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 403 when user is not an authorized owner of the comment', async () => {
      // Arrange
      const threadId = 'thread-1001';
      const userId = 'user-1001';
      const unauthorizedUserId = 'user-123';
      const commentId = 'comment-1001';

      const server = await createServer(container);
      const accessToken = await TokenTestHelper.getAccessToken();

      await UsersTableTestHelper.addUser({ id: unauthorizedUserId, username: 'usertestcomment' });

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId});

      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: unauthorizedUserId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Tidak dapat mengakses resource ini');
    });

    it('should response 404 when thread or comment does not exist', async () => {
      // Arrange
      const threadId = 'thread-1001';
      const commentId = 'comment-1001';

      const server = await createServer(container);
      const accessToken = await TokenTestHelper.getAccessToken();

      // Action
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: 'user-1001'});
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });
  });

});