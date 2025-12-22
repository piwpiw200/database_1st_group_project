const Order = require("./order.model");

const createAOrder = async (req, res) => {
  const db = require('../utils/db');
  if (!db.isConnected()) {
    return res.status(503).json({ message: 'DB not connected — create order unavailable in offline mode' });
  }

  try {
    const newOrder =  await Order(req.body);
    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
  } catch (error) {
    console.error("Error creating order", error);
    res.status(500).json({ message: "Failed to create order" });
  }
};

const getOrderByEmail = async (req, res) => {
  try {
    const {email} = req.params;
    const db = require('../utils/db');
    if (!db.isConnected()) {
      // offline: return empty list
      return res.status(200).json([]);
    }

    const orders = await Order.find({email}).sort({createdAt: -1});
    if(!orders) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders", error);
    res.status(500).json({ message: "Failed to fetch order" });
  }
}

module.exports = {
  createAOrder,
  getOrderByEmail
};
