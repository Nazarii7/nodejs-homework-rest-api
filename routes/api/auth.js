const express = require("express");

const { tryCatchWrapper } = require("../../helpers/index");
const { validate, auth } = require("../../middlewares/index");
const { joiRegSchema, joiLogSchema } = require("../../models/user");

const {
  register,
  login,
  logout,
  getCurrent,
} = require("../../controllers/auth.controllers");

const authRouter = express.Router();

authRouter.post("/signup", validate(joiRegSchema), tryCatchWrapper(register));
authRouter.get("/login", validate(joiLogSchema), tryCatchWrapper(login));
authRouter.post("/logout", tryCatchWrapper(auth), tryCatchWrapper(logout));
authRouter.get("/current", tryCatchWrapper(auth), tryCatchWrapper(getCurrent));

module.exports = {
  authRouter,
};
