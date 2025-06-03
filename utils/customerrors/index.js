const BadRequestError = require("./bad-request-error");
const ConflictError = require("./conflict-error");
const ForbiddenError = require("./forbidden-error");
const NotFoundError = require("./not-found-error");
const UnauthorizedError = require("./unauthorized-error");

module.exports = {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
};
