// Temporary stub implementations to satisfy route imports.
// Replace with full logic once server starts cleanly.

import { body } from 'express-validator';
import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { createError } from '../utils/errorUtils.js';

export const getCart = async (req, res) => {
  const userId = req.user._id;
  let cart = await Cart.findOne({ user: userId }).populate('items.product', 'name price images thumbnail stock');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  res.status(200).json({ success: true, cart });
};

export const addToCart = async (req, res) => {
  const userId = req.user._id;
  const { product: productId, quantity = 1, size, color } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    throw createError('Product not found', 404);
  }

  if (product.stock?.trackQuantity && product.stock.quantity < quantity) {
    throw createError('Insufficient stock', 400);
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  const existingIndex = cart.items.findIndex(
    (it) => it.product.toString() === productId && it.size === size && it.color === color
  );

  if (existingIndex > -1) {
    const nextQty = cart.items[existingIndex].quantity + quantity;
    cart.items[existingIndex].quantity = Math.min(nextQty, 10);
  } else {
    cart.items.push({ product: new mongoose.Types.ObjectId(productId), quantity: Math.min(quantity, 10), size, color });
  }

  await cart.save();
  await cart.populate('items.product', 'name price images thumbnail stock');
  res.status(201).json({ success: true, cart });
};

export const updateCartItem = async (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.params;
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw createError('Cart not found', 404);

  const item = cart.items.id(itemId);
  if (!item) throw createError('Cart item not found', 404);

  // Validate stock if tracked
  const product = await Product.findById(item.product);
  if (product?.stock?.trackQuantity && product.stock.quantity < quantity) {
    throw createError('Insufficient stock', 400);
  }

  item.quantity = Math.min(Math.max(quantity, 1), 10);
  await cart.save();
  await cart.populate('items.product', 'name price images thumbnail stock');
  res.status(200).json({ success: true, cart });
};

export const removeFromCart = async (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw createError('Cart not found', 404);

  const item = cart.items.id(itemId);
  if (!item) throw createError('Cart item not found', 404);

  item.deleteOne();
  await cart.save();
  await cart.populate('items.product', 'name price images thumbnail stock');
  res.status(200).json({ success: true, cart });
};

export const clearCart = async (req, res) => {
  const userId = req.user._id;
  await Cart.findOneAndDelete({ user: userId });
  res.status(200).json({ success: true });
};

export const getCartCount = async (req, res) => {
  const userId = req.user._id;
  const cart = await Cart.findOne({ user: userId });
  res.status(200).json({ success: true, count: cart?.totalItems || 0 });
};

export const validateAddToCart = [
  body('product').isMongoId().withMessage('Valid product ID is required'),
  body('quantity').optional().isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10'),
  body('size').optional().isString().trim(),
  body('color').optional().isString().trim(),
];

export const validateUpdateCartItem = [
  body('quantity').isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10')
];