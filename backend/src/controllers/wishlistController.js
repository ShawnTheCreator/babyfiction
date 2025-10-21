import { body } from 'express-validator';
import mongoose from 'mongoose';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import { createError } from '../utils/errorUtils.js';

export const getWishlist = async (req, res) => {
  const userId = req.user._id;
  let wishlist = await Wishlist.findOne({ user: userId }).populate('items.product', 'name price images thumbnail');
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, items: [] });
  }
  res.status(200).json({ success: true, wishlist });
};

export const addToWishlist = async (req, res) => {
  const userId = req.user._id;
  const { product: productId } = req.body;

  const product = await Product.findById(productId);
  if (!product) throw createError('Product not found', 404);

  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, items: [] });
  }

  const exists = wishlist.items.find((it) => it.product.toString() === productId);
  if (!exists) {
    wishlist.items.push({ product: new mongoose.Types.ObjectId(productId) });
    await wishlist.save();
  }

  await wishlist.populate('items.product', 'name price images thumbnail');
  res.status(201).json({ success: true, wishlist });
};

export const removeFromWishlist = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) throw createError('Wishlist not found', 404);

  const idx = wishlist.items.findIndex((it) => it.product.toString() === productId);
  if (idx === -1) throw createError('Item not in wishlist', 404);

  wishlist.items.splice(idx, 1);
  await wishlist.save();
  await wishlist.populate('items.product', 'name price images thumbnail');
  res.status(200).json({ success: true, wishlist });
};

export const clearWishlist = async (req, res) => {
  const userId = req.user._id;
  await Wishlist.findOneAndDelete({ user: userId });
  res.status(200).json({ success: true });
};

export const getWishlistCount = async (req, res) => {
  const userId = req.user._id;
  const wishlist = await Wishlist.findOne({ user: userId });
  res.status(200).json({ success: true, count: wishlist?.totalItems || 0 });
};

export const validateAddToWishlist = [
  body('product').isMongoId().withMessage('Valid product ID is required'),
];
