const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => { 
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('verifyAvailableThread function', () => {
    it('should throw InvariantError when thread not available', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      
      // Action & Assert
      return expect(threadRepositoryPostgres.verifyAvailableThread('Title Thread')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw InvariantError when thread available', async () => {
      // Arrange
      const userId = 'user-12345';
      const titleThread = 'Title Thread';
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ title: titleThread, owner: userId });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(threadRepositoryPostgres.verifyAvailableThread(titleThread)).resolves.not.toThrow(NotFoundError);
    });
  });

  describe('addThread function', () => { 
    it('should persist add thread and return added thread correctly', async () => {
      // Arrange
      const userId = 'user-1001';

      const addThread = new AddThread({
        title: 'A New Thread',
        body: 'Body of a new thread',
        owner: userId,
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({ id: userId });
      await threadRepositoryPostgres.addThread(addThread);

      // Assert
      const thread = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(thread).toHaveLength(1);
    });

    it('should return registered thread correctly', async () => {
      // Arrange
      const userId = 'user-1001';
      const threadPayload = {
        title: 'A New Thread',
        body: 'Body of a new thread',
        owner: userId,
      };

      const addThread = new AddThread(threadPayload);
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({ id: userId });
      const addedThread = await threadRepositoryPostgres.addThread(addThread);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: threadPayload.title,
        body: threadPayload.body,
        owner: userId,
      }));
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when id not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(threadRepositoryPostgres.getThreadById('thread-aaaa')).rejects.toThrowError(NotFoundError);
    });

    it('should return correct data when found an id', async () => {
      // Arrange
      const userId = 'user-1001';
      const threadId = 'thread-1001';
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      const thread = await threadRepositoryPostgres.getThreadById(threadId);
      expect(thread.id).toEqual(threadId);
    });
  });
});