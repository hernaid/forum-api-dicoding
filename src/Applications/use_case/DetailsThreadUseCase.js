class DetailsThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const thread = await this._threadRepository.getThreadById(useCasePayload);
    const comments = await this._commentRepository.getCommentByThreadId(useCasePayload);

    const validatedComments = this._validateDeletedComment(comments);

    return {
      ...thread,
      comments: validatedComments,
    };
  }

  _validateDeletedComment(comments) {
    for (const comment of comments) {
      if (comment.is_delete) {
        comment.content = '**komentar telah dihapus**';
      }
      delete comment.is_delete;
    }
    return comments;
  }
}

module.exports = DetailsThreadUseCase;
