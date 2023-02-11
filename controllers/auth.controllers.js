const { User } = require("../models/user");
const { ValidationError } = require("../helpers/index");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { JWT_SECRET } = process.env;

async function register(req, res, next) {
  const { email, password, subscription } = req.body;

  const salt = await bcrypt.genSalt();
  const hashedPasssword = await bcrypt.hash(password, salt);

  try {
    const savedUser = await User.create({
      email,
      password: hashedPasssword,
      subscription,
    });
    return res.status(201).json({
      message: "Created user",
      data: { user: { email, subscription } },
    });
  } catch (error) {
    if (error.message.includes("E11000 duplicate key error")) {
      return next(
        ValidationError(409, `User with this email '${email}' already exists`)
      );
    }
    throw error;
  }
}

async function login(req, res, next) {
  const { email, password } = req.body;

  if (!storedUser || !storedUser.comparePassword(password)) {
    return next(createError(401, "Email or password is wrong"));
  }

  const payloud = { id: storedUser._id };
  const token = jwt.sign(payloud, JWT_SECRET, {
    expiresIn: "3h",
  });
  return res.json({
    data: {
      token,
    },
  });
}

async function logout(req, res, next) {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });
  res.status(204).json();
}

async function getCurrent(req, res, next) {
  const { email, subscription } = req.user;
  return res.json({
    data: {
      email,
      subscription,
    },
  });
}

module.exports = {
  register,
  login,
  logout,
  getCurrent,
};
