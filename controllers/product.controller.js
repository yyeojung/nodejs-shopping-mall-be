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
      isDeleted,
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
      isDeleted,
    });
    await product.save();
    res.status(200).json({ status: "success", product });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: "fail",
        error: "SKU가 중복되었습니다. 다른 값을 사용해주세요.",
      });
    }
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.getProduct = async (req, res) => {
  try {
    const { page, name, pageSize } = req.query;
    const cond = name
      ? { name: { $regex: new RegExp(name, "i") }, isDeleted: false }
      : { isDeleted: false };

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

productController.getProductDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) throw new Error("상품 아이디가 존재하지 않습니다.");

    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

productController.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      sku,
      name,
      size,
      image,
      price,
      description,
      category,
      stock,
      status,
    } = req.body;
    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      {
        sku,
        name,
        size,
        image,
        price,
        description,
        category,
        stock,
        status,
      },
      {
        new: true,
      }
    );
    if (!product) throw new Error("item doewn't exist");
    res.status(200).json({ status: "success", data: product });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

productController.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      { isDeleted: true }
    );
    if (!product) throw new Error("no item found");
    res.status(200).json({ status: "ok", data: product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.checkStockOnly = async (item) => {
  // 내가 사려는 아이템 재고 정보 들고오기
  const product = await Product.findById(item.productId);
  // 내가 사려는 아이템 qty, 재고 비교
  const stockItem = product.stock.find((s) => s.size === item.size);
  if (stockItem.quantity < item.qty) {
    // 재고가 불충분하면 불충분 메세지와 함께 데이터 반환
    return {
      isVerify: false,
      message: `${product.name}의 ${item.size}재고가 부족합니다.`,
    };
  }

  return { isVerify: true };
};

productController.checkStock = async (itemList) => {
  const insufficientStockItems = [];

  await Promise.all(
    itemList.map(async (item) => {
      const stockCheck = await productController.checkStockOnly(item);
      if (!stockCheck.isVerify) {
        insufficientStockItems.push({ item, message: stockCheck.message });
      }
    })
  );

  return insufficientStockItems;
};

productController.checkItemListStock = async (itemList) => {
  const insufficientStockItems = []; // 재고 불충분한 아이템 저장
  // 재고 확인 로직
  await Promise.all(
    itemList.map(async (item) => {
      const stockCheck = await productController.checkStockOnly(item);
      if (!stockCheck.isVerify) {
        insufficientStockItems.push({ item, message: stockCheck.message });
      }
      return stockCheck;
    })
  );

  return insufficientStockItems;
};

module.exports = productController;
