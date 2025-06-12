const router = require("express").Router();
const { validateUser } = require("../middlewares/validation");

const { getCurrentUser, updateProfile } = require("../controllers/users");

router.get("/me", getCurrentUser);
router.patch("/me", validateUser, updateProfile);

module.exports = router;
