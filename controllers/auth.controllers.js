const { User } = require("../models/user");
const { ValidationError } = require("../helpers/index");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const { nanoid } = require("nanoid");

const Jimp = require("jimp");
const { JWT_SECRET } = process.env;

async function register(req, res, next) {
  const { email, password, subscription } = req.body;

  const salt = await bcrypt.genSalt();
  const hashedPasssword = await bcrypt.hash(password, salt);

  const avatarURL = gravatar.url(email);

  try {
    const verifyId = nanoid();

    const savedUser = await User.create({
      email,
      password: hashedPasssword,
      subscription,
      avatarURL,
      verificationToken: verifyId,
    });

    await sendMail({
      to: email,
      subject: "please confirm your email",
      html: `<h1>Confirm your email</h1> <a href="http://localhost:3000/api/users/verify/${verifyId}">confirm</a>`,
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
    const resultUpload = path.join(__dirname, "../public/avatars", avatarName);
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

async function verifyEmail(req, res, next) {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });

  if (!user) {
    return next(createError(404, "Not found"));
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: "",
  });

  return res.json({
    message: "Verification successful",
  });
}

async function reVerifyEmail(req, res, next) {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(createError(404, "Not found"));
  }
  if (user.verify) {
    return next(createError(400, "Verification has already been passed"));
  }

  await sendMail({
    to: email,
    subject: "please confirm your email",
    html: `<h1>Confirm your email</h1> <a href="http://localhost:3000/api/users/verify/${user.verificationToken}">confirm</a>`,
  });
  return res.json({
    message: "Verification email sent",
  });
}

module.exports = {
  register,
  login,
  logout,
  getCurrent,
  updateAvatar,
  verifyEmail,
  reVerifyEmail,
};
