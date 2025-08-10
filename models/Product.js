const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const stockSchema = new Schema({
  id: { type: String, required: true },
  size: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
});

const productSchema = Schema(
  {
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: Array, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: [stockSchema], required: true },
    status: { type: String, default: "active" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
productSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.__v;
  delete obj.__updateAt;
  delete obj.__createAt;
  return obj;
};

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
