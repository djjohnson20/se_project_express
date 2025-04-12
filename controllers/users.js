const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const {
  OK_STATUS_CODE,
  CREATED_STATUS_CODE,
  BAD_REQUEST_STATUS_CODE,
  NOT_FOUND_STATUS_CODE,
  CONFLICT_STATUS_CODE,
  INTERNAL_SERVER_ERROR,
  UNAUTHORIZED_STATUS_CODE,
} = require("../utils/errors");
const { JWT_SECRET } = require("../utils/config");

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(OK_STATUS_CODE).send(users))
    .catch((err) => {
      console.error(err);
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occurred on the server." });
    });
};

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({ name, avatar, email, password: hash }))
    .then((user) => {
      res.status(CREATED_STATUS_CODE).send({
        name: user.name,
        avatar: user.avatar,
        email: user.email,
        _id: user._id,
        message: "User successfully created",
      });
    })
    .catch((err) => {
      console.log("Error type:", err.name);
      console.log("Error code:", err.code);
      console.log("Full Error:", err);
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST_STATUS_CODE).send({
          message:
            "Invalid data provided. The user must have a name and avatar url",
        });
      }
      if (err.code === 11000) {
        return res
          .status(CONFLICT_STATUS_CODE)
          .send({ message: "Duplicate email" });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occurred on the server" });
    });
};

const getCurrentUser = (req, res) => {
  const userId = req.user._id;
  User.findById(userId)
    .orFail()
    .then((user) => res.status(OK_STATUS_CODE).send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res
          .status(NOT_FOUND_STATUS_CODE)
          .send({ message: "User not found" });
      }
      if (err.name === "CastError") {
        return res
          .status(BAD_REQUEST_STATUS_CODE)
          .send({ message: "Invalid ID format" });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occurred on the server" });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(BAD_REQUEST_STATUS_CODE)
        .send({ message: "Incorrect email or password" });
    });
};

const updateProfile = (req, res) => {
  const { name, avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { $set: { name, avatar } },
    { new: true, runValidators: true }
  )
    .orFail()
    .then((updatedUser) => res.status(OK_STATUS_CODE).send(updatedUser))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res
          .status(NOT_FOUND_STATUS_CODE)
          .send({ message: "User not found" });
      }
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST_STATUS_CODE).send({
          message:
            "Invalid data provided. Name should be 2-30 characters and avatar should be a valid URL",
        });
      }
      res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "Error updating profile" });
    });
};

module.exports = { getUsers, createUser, getCurrentUser, login, updateProfile };
