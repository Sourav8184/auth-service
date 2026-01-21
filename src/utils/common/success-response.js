class SuccessResponse {
  constructor(data, message, statusCode) {
    this.success = true;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }
}

module.exports = SuccessResponse;
