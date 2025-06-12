const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { OK_STATUS_CODE, CREATED_STATUS_CODE } = require("../utils/errors");
const {
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  BadRequestError,
} = require("../utils/customerrors/index");
const { JWT_SECRET } = require("../utils/config");

const createUser = (req, res, next) => {
  const { name, avatar, email, password } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({ name, avatar, email, password: hash }))
    .then((user) =>
      res.status(CREATED_STATUS_CODE).send({
        name: user.name,
        avatar: user.avatar,
        email: user.email,
        _id: user._id,
        message: "User successfully created",
      })
    )
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(
          new BadRequestError(
            "Invalid data provided. The user must have a name and avatar url"
          )
        );
      } else if (err.code === 11000) {
        next(new ConflictError("Duplicate email"));
      } else {
        next(err);
      }
    });
};

const getCurrentUser = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .orFail()
    .then((user) => res.status(OK_STATUS_CODE).send(user))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("User not found"));
      } else if (err.name === "CastError") {
        next(new BadRequestError("Invalid ID format"));
      } else {
        next(err);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new BadRequestError("Email and password required"));
  }
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      return res.send({ token });
    })
    .catch((err) => {
      if (err.name === "Error") {
        next(new UnauthorizedError("Incorrect email or password"));
      } else {
        next(err);
      }
    });
};

const updateProfile = (req, res, next) => {
  const { name, avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { $set: { name, avatar } },
    { new: true, runValidators: true }
  )
    .orFail()
    .then((updatedUser) => res.status(OK_STATUS_CODE).send(updatedUser))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("User not found"));
      } else if (err.name === "ValidationError") {
        next(
          new BadRequestError(
            "Invalid data provided. Name should be 2-30 characters and avatar should be a valid URL"
          )
        );
      } else {
        next(err);
      }
    });
};

module.exports = { createUser, getCurrentUser, login, updateProfile };
