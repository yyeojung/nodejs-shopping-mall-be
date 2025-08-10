const Cart = require("../models/Cart");

const cartController = {};

cartController.addItemToCart = async (req, res) => {
  try {
    const { userId } = req;
    const { productId, size, qty } = req.body;
    // 유저를 가지고 카트 찾기
    let cart = await Cart.findOne({ userId });
    // 유저가 만든 카트가 없다, 만들어주기
    if (!cart) {
      cart = new Cart({ userId });
      await cart.save();
    }
    // 이미 카트에 들어가있는 아이템인지
    const existItem = cart.items.find(
      // 그냥 string이면 === 으로 비교 가능하지만 Object이면 equals로 비교
      (item) => item.productId.equals(productId) && item.size === size
    );
    // 맞다면 에러
    if (existItem) {
      throw new Error("아이템이 이미 카트에 담겨 있습니다.");
    }
    // 아니면 카트에 아이템을 추가
    cart.items = [...cart.items, { productId, size, qty }];
    await cart.save();

    res
      .status(200)
      .json({ status: "success", data: cart, cartItemQty: cart.items.length });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = cartController;
