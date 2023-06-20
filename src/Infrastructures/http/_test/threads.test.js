const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const TokenTestHelper = require('../../../../tests/TokenTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'A New Thread',
        body: 'Body of a new thread',
      };

      const server = await createServer(container);
      const accessToken = await TokenTestHelper.getAccessToken();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: ['Title'],
        body: 1010,
      };
      const server = await createServer(container);
      const accessToken = await TokenTestHelper.getAccessToken();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'Title',
      };
      const server = await createServer(container);
      const accessToken = await TokenTestHelper.getAccessToken();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and show details thread by threadId', async () => {
      // Arrange'
      const addUser = {
        id: 'user-1001',
        username: 'dicoding',
      }
      const addThread = {
        id: 'thread-1001',
        title: 'A New Thread',
        body: 'Body of a new thread',
        owner: addUser.id,
        dateAt: new Date().toISOString(),
      };

      const expectedThread = {
        id: addThread.id,
        title: addThread.title,
        body: addThread.body,
        date: addThread.dateAt,
        username: addUser.username,
        comments: [],
      }
      
      const server = await createServer(container);

      // Action
      await UsersTableTestHelper.addUser(addUser);
      await ThreadsTableTestHelper.addThread(addThread);

      const response = await server.inject({
        method: 'GET',
        url: `/threads/${addThread.id}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      const thread = responseJson.data.thread;
      expect(thread).toStrictEqual(expectedThread);
    });

    it('should response 404 when requested thread not found', async () => {
      // Arrange
      const threadId = 'thread-1001';
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });
  });
});