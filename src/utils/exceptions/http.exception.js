class HttpException extends Error {
  status;
  message;

  constructor(status, message) {
    super(message);
    this.message = message;
    this.status = status;
  }
}

module.exports = HttpException;
