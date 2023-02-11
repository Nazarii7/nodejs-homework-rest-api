const { Schema, model } = require("mongoose");
const Joi = require("joi");
const bcrypt = require("bcrypt");

const schema = Schema(
  {
    password: {
      type: String,
      required: [true, "Set password for user"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    token: {
      type: String,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

schema.methods.comparePasword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

const joiRegSchema = Joi.object({
  password: Joi.string().min(6).required(),
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net", "ua"] },
  }),
  subscription: Joi.string(),
});

const joiLogSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().email().required(),
});

const User = model("user", schema);

module.exports = {
  User,
  joiLogSchema,
  joiRegSchema,
};
