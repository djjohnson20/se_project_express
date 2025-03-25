const router = require("express").Router();

const userRouter = require("./users");
const clohtingItem = require("./clothingItem");

router.use("/users", userRouter);
router.use("/items", clohtingItem);

router.use((req, res) => {
  res.status(500).send({ message: err.message });
});

module.exports = router;
