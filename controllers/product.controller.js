const Product = require("../models/Product");

const PAGE_SIZE = 5;

const productController = {};

productController.createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    } = req.body;
    const product = new Product({
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    });
    await product.save();
    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.getProduct = async (req, res) => {
  try {
    const { page, name, pageSize } = req.query;
    const cond = name ? { name: { $regex: new RegExp(name, "i") } } : {};

    let query = Product.find(cond);
    let response = { status: "success" };

    const limit = pageSize ? parseInt(pageSize, 10) : PAGE_SIZE;
    if (page) {
      query.skip((page - 1) * limit).limit(limit);
      // 최종 페이지 몇개
      // 데이터가 총 몇개
      const totalItemNum = await Product.countDocuments(cond);
      // 데이터 총 개수 / PAGE_SIZE
      const totalPageNum = Math.ceil(totalItemNum / limit);
      response.pageSize = limit;
      response.totalPageNum = totalPageNum;
    }

    const productList = await query.exec();
    response.data = productList;
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

module.exports = productController;
