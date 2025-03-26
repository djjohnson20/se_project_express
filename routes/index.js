const router = require("express").Router();

const userRouter = require("./users");
const clothingItem = require("./clothingItem");
const { INTERNAL_SERVER_ERROR } = require("../utils/errors");

router.use("/users", userRouter);
router.use("/items", clothingItem);

router.use((req, res) => {
  res
    .status(INTERNAL_SERVER_ERROR)
    .send({ message: "Requested resource not found" });
});

module.exports = router;
