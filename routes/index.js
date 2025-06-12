const router = require("express").Router();

const auth = require("../middlewares/auth");
const { validateLogin, validateUser } = require("../middlewares/validation");
const userRouter = require("./users");
const clothingItem = require("./clothingItem");
const { login, createUser } = require("../controllers/users");
const { NotFoundError } = require("../utils/customerrors/index");

router.post("/signup", validateUser, createUser);
router.post("/signin", validateLogin, login);

router.use("/users", auth, userRouter);
router.use("/items", clothingItem);

router.use((req, res, next) => {
  next(new NotFoundError("Requested resource not found"));
});

module.exports = router;
