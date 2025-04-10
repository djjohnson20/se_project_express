const router = require("express").Router();

const auth = require("../middlewares/auth");
const userRouter = require("./users");
const clothingItem = require("./clothingItem");
const { login, createUser } = require("../controllers/users");
const { NOT_FOUND_STATUS_CODE } = require("../utils/errors");

router.post("/signup", createUser);
router.post("/signin", login);

router.use("/users", auth, userRouter);
router.use("/items", auth, clothingItem);

router.use((req, res) => {
  res
    .status(NOT_FOUND_STATUS_CODE)
    .send({ message: "Requested resource not found" });
});

module.exports = router;
