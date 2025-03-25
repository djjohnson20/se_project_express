const ClothingItem = require("../models/clothingItem");
const {
  OK_STATUS_CODE,
  CREATED_STATUS_CODE,
  BAD_REQUEST_STATUS_CODE,
  NOT_FOUND_STATUS_CODE,
  INTERNAL_SERVER_ERROR,
} = require("../utils/errors");

const getItems = (req, res) => {
  ClothingItem.find({})
    .populate("owner")
    .then((items) => res.status(OK_STATUS_CODE).send(items))
    .catch((err) => {
      console.error(err);
      return res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
    });
};

const createItem = (req, res) => {
  const { name, weather, imageUrl } = req.body;
  ClothingItem.create({
    name,
    weather,
    imageUrl,
    owner: req.user._id,
  })
    .then((item) => ClothingItem.findById(item._id).populate("owner"))
    .then((item) => res.status(CREATED_STATUS_CODE).send(item))
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res
          .status(BAD_REQUEST_STATUS_CODE)
          .send({ message: err.message });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
    });
};

module.exports = { getItems, createItem };
