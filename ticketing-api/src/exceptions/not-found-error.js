import ClientError from './client-error.js';

class NotFoundError extends ClientError {
  constructor(messsage) {
    super(messsage, 404);
    this.name = 'NotFoundError';
  }
}

export default NotFoundError;