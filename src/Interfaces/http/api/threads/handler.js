const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const DetailsThreadUseCase = require('../../../../Applications/use_case/DetailsThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadHandler = this.getThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const { title, body } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute({ title, body, owner: credentialId });

    const response = h.response({
      status: 'success',
      data: { addedThread },
    });
    response.code(201);
    return response;
  }

  async getThreadHandler(request, h) {
    const { threadId } = request.params;
    const detailsThreadUseCase = this._container.getInstance(DetailsThreadUseCase.name);
    const detailsThread = await detailsThreadUseCase.execute(threadId);

    const response = h.response({
      status: 'success',
      data: { thread: detailsThread },
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;
