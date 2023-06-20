const DetailsThreadUseCase = require('../DetailsThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('DetailsThreadUseCase', () => {
  it('should orchestrating the details thread action correctly', async () => {
    // Arrange
    const threadId = 'thread-1001';
    const expectedThread = {
      id: threadId,
      title: 'New Thread Title',
      body: 'New Thread Body',
      username: 'user-1001',
      date: '2023-06-14T00:00:00.000Z',
    };
    const expectedComments = [
      {
        id: 'comment-1001',
        username: 'dicoding',
        date: '2023-06-14T01:00:00.000Z',
        content: 'First Comment',
        is_delete: false,
      },
      {
        id: 'comment-1002',
        username: 'dicoding',
        date: '2023-06-14T02:00:00.000Z',
        content: 'Second Comment',
        is_delete: true,
      },
    ];

    const expectedDetailsThread = {
      id: threadId,
      title: expectedThread.title,
      body: expectedThread.body,
      date: expectedThread.date,
      username: expectedThread.username,
      comments: [
        {
          id: 'comment-1001',
          username: 'dicoding',
          date: '2023-06-14T01:00:00.000Z',
          content: 'First Comment',
        },
        {
          id: 'comment-1002',
          username: 'dicoding',
          date: '2023-06-14T02:00:00.000Z',
          content: '**komentar telah dihapus**',
        },
      ],
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThread));
    mockCommentRepository.getCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedComments));

    /** creating use case instance */
    const detailsThreadUseCase = new DetailsThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const detailsThread = await detailsThreadUseCase.execute(threadId);

    expect(detailsThread).toStrictEqual(expectedDetailsThread);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(threadId);
  });
});