const express = require("express");

const { tryCatchWrapper } = require("../../helpers/index");
const { validate, auth, upload } = require("../../middlewares/index");
const {
  joiRegSchema,
  joiLogSchema,
  joiVerEmailSchema,
} = require("../../models/user");

const {
  register,
  login,
  logout,
  getCurrent,
  updateAvatar,
  verifyEmail,
  reVerifyEmail,
} = require("../../controllers/auth.controllers");

const authRouter = express.Router();

authRouter.post("/signup", validate(joiRegSchema), tryCatchWrapper(register));
authRouter.get("/login", validate(joiLogSchema), tryCatchWrapper(login));
authRouter.post("/logout", tryCatchWrapper(auth), tryCatchWrapper(logout));
authRouter.get("/current", tryCatchWrapper(auth), tryCatchWrapper(getCurrent));

authRouter.patch(
  "/avatars",
  tryCatchWrapper(auth),
  upload.single("avatar"),
  tryCatchWrapper(updateAvatar)
);

authRouter.get("/verify/:verificationToken", tryCatchWrapper(verifyEmail));
authRouter.post(
  "/verify",
  validate(joiVerEmailSchema),
  tryCatchWrapper(reVerifyEmail)
);

module.exports = {
  authRouter,
};
