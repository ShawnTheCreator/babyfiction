// Temporary stub implementations to satisfy route imports.
// Replace with full logic once server starts cleanly.

export const getCart = async (req, res) => {
  res.status(200).json({ success: true, cart: { items: [], totalItems: 0, totalPrice: 0 } });
};

export const addToCart = async (req, res) => {
  res.status(201).json({ success: true });
};

export const updateCartItem = async (req, res) => {
  res.status(200).json({ success: true });
};

export const removeFromCart = async (req, res) => {
  res.status(200).json({ success: true });
};

export const clearCart = async (req, res) => {
  res.status(200).json({ success: true });
};

export const getCartCount = async (req, res) => {
  res.status(200).json({ success: true, count: 0 });
};

export const validateAddToCart = [];
export const validateUpdateCartItem = [];