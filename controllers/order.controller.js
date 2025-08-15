const orderController = {};
const Order = require("../models/Order");
const randomStringGenerator = require("../utils/randomStringGenerator");
const productController = require("./product.controller");
const PAGE_SIZE = 10;

orderController.createOrder = async (req, res) => {
  try {
    // 프론트엔드에서 데이터 보낸 거 받아오기
    // userId, totalPrice, shipTo, contact, orderList
    const { userId } = req;
    const { totalPrice, shipTo, contact, orderList } = req.body;
    // 재고 확인 & 재고 업데이트
    const insufficientStockItems = await productController.checkItemListStock(
      orderList
    );
    // 재고가 충분하지 않는 아이템이 있었다 -> 에러
    if (insufficientStockItems.length > 0) {
      const errorMessage = insufficientStockItems.reduce(
        (total, item) => total + item.message + " ",
        ""
      );
      throw new Error(errorMessage);
    }
    //재고 차감 (모든 상품 통과 시에만 실행)
    await Promise.all(
      orderList.map((item) => productController.deductStock(item))
    );
    // order 만들기
    const newOrder = new Order({
      userId,
      totalPrice,
      shipTo,
      contact,
      items: orderList,
      orderNum: randomStringGenerator(),
    });

    await newOrder.save();
    // save 후에 카트를 비워주자

    res.status(200).json({ status: "success", orderNum: newOrder.orderNum });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

orderController.getOrder = async (req, res) => {
  try {
    const { userId } = req;
    const orderList = await Order.find({ userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
        select: "image name",
      },
    });
    // const totalItemNum = await Order.find({ userId }).count();

    // const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
    res.status(200).json({ status: "success", data: orderList });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};
orderController.getOrderList = async (req, res) => {
  try {
    const { page, ordernum } = req.query;
    const cond = ordernum
      ? { orderNum: { $regex: new RegExp(ordernum, "i") } }
      : {};
    const orderList = await Order.find(cond)
      .populate("userId")
      .populate({
        path: "items",
        populate: {
          path: "productId",
          model: "Product",
          select: "image name",
        },
      })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE);

    const totalItemNum = await Order.countDocuments(cond);
    const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);

    res.status(200).json({ status: "success", data: orderList, totalPageNum });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

orderController.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );
    if (!order) throw new Error("주문을 찾을 수 없습니다.");

    res.status(200).json({ status: "success", data: order });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = orderController;
