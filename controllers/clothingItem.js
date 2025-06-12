const ClothingItem = require("../models/clothingItem");
const { OK_STATUS_CODE, CREATED_STATUS_CODE } = require("../utils/errors");
const {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} = require("../utils/customerrors/index");

const getItems = (req, res, next) => {
  ClothingItem.find({})
    .then((items) => res.status(OK_STATUS_CODE).send(items))
    .catch((err) => {
      next(err);
    });
};

const createItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;
  ClothingItem.create({
    name,
    weather,
    imageUrl,
    owner: req.user._id,
  })
    .then((item) => res.status(CREATED_STATUS_CODE).send(item))
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(
          new BadRequestError(
            "Invalid data provided. The clothing item must have a name, weather type, and imageUrl"
          )
        );
      } else {
        next(err);
      }
    });
};

const deleteItem = (req, res, next) => {
  const { itemId } = req.params;
  ClothingItem.findById(itemId)
    .orFail()
    .then((item) => {
      if (!item.owner.equals(req.user._id)) {
        return next(
          new ForbiddenError(
            "Forbidden: You don't have permission to delete this item"
          )
        );
      }
      return item.deleteOne().then(() => {
        res.status(OK_STATUS_CODE).send({ message: "Deletion was a success" });
      });
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError("Invalid ID format"));
      } else if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("Item not found"));
      } else {
        next(err);
      }
    });
};

const likeItem = (req, res, next) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .then((item) => {
      if (!item) {
        return next(new NotFoundError("Item not found"));
      }
      return res.status(OK_STATUS_CODE).send(item);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError("Invalid ID format"));
      } else if (err.name === "ValidationError") {
        next(new BadRequestError("Invalid data format for liking the item"));
      } else {
        next(err);
      }
    });
};

const dislikeItem = (req, res, next) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((item) => {
      res.status(OK_STATUS_CODE).send(item);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError("Invalid ID format"));
      } else if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("Item not found"));
      } else if (err.name === "ValidationError") {
        next(new BadRequestError("Invalid data format for disliking the item"));
      } else {
        next(err);
      }
    });
};

module.exports = { getItems, createItem, deleteItem, likeItem, dislikeItem };
