class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyAvailableThread(useCasePayload.threadId);
    await this._commentRepository.verifyAvailableComment(useCasePayload.id);
    await this._commentRepository.verifyOwnerComment(
      useCasePayload.id,
      useCasePayload.owner,
    );
    await this._commentRepository.deleteCommentById(useCasePayload.id);
  }
}

module.exports = DeleteCommentUseCase;
