const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../utils/config");
const { UnauthorizedError } = require("../utils/customerrors/index");

const auth = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    next(new UnauthorizedError("Authorization Error"));
  }
  const token = authorization.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
  } catch (err) {
    next(new UnauthorizedError("Invalid token"));
  }
  return next();
};

module.exports = auth;
