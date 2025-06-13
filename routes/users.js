const router = require("express").Router();
const { validateProfileUpdate } = require("../middlewares/validation");

const { getCurrentUser, updateProfile } = require("../controllers/users");

router.get("/me", getCurrentUser);
router.patch("/me", validateProfileUpdate, updateProfile);

module.exports = router;
