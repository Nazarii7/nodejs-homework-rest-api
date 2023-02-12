const { User } = require("../models/user");
const { ValidationError } = require("../helpers/index");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");

const Jimp = require("jimp");
const { JWT_SECRET } = process.env;

async function register(req, res, next) {
  const { email, password, subscription } = req.body;

  const salt = await bcrypt.genSalt();
  const hashedPasssword = await bcrypt.hash(password, salt);

  const avatarURL = gravatar.url(email);

  try {
    const savedUser = await User.create({
      email,
      password: hashedPasssword,
      subscription,
      avatarURL,
    });
    return res.status(201).json({
      message: "Created user",
      data: { user: { email, subscription, avatarURL } },
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
  const storedUser = await User.findOne({ email });

  if (!storedUser) {
    throw new ValidationError(401, "email is not valid");
  }

  const isPasswordValid = await bcrypt.compare(password, storedUser.password);

  if (!isPasswordValid) {
    throw new ValidationError(401, "password is not valid");
  }

  const payload = { id: storedUser._id };
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: "3h",
  });
  return res.json({
    data: {
      token,
    },
  });
}

async function logout(req, res, next) {
  const { id } = req.user;
  await User.findByIdAndUpdate(id, { token: null });
  res.status(204).json();
}

async function getCurrent(req, res, next) {
  const { email } = req.user;
  return res.json({
    data: {
      email,
      subscription,
    },
  });
}

async function updateAvatar(req, res, next) {
  const { path: tempUpload, originalname } = req.file;
  const { _id: id } = req.user;
  const avatarName = `${id}_${originalname}`;
  try {
    const resultUpload = path.join(
      __dirname,
      "../public/avatars/photo_2023-01-08_19-30-47.jpg",
      avatarName
    );
    await fs.rename(tempUpload, resultUpload);
    const avatarURL = path.join("public", "avatars", avatarName);
    await User.findByIdAndUpdate(req.user._id, { avatarURL });
    Jimp.read(resultUpload, (error, image) => {
      if (error) throw error;
      image.resize(250, 250).write(resultUpload);
    });

    res.json({ avatarURL });
  } catch (error) {
    await fs.unlink(tempUpload);
    throw error;
  }
}

module.exports = {
  register,
  login,
  logout,
  getCurrent,
  updateAvatar,
};
