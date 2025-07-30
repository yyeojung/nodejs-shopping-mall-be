const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { trype: String, required: true },
    name: { type: String, required: true },
    level: { type: String, default: "customer" }, // 2types : customer, admin
  },
  { timestamps: true }
);
userSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.password;
  delete obj.__v;
  delete obj.__updateAt;
  delete obj.__createAt;
  return obj;
};

const User = mongoose.modelNames("User", userSchema);
module.exports = User;
