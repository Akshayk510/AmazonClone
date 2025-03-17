const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const Discount = require('../models/discountModel');

// Get user cart
exports.getCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      // Create a new cart if one doesn't exist
      cart = await Cart.create({
        user: userId,
        items: [],
        totalPrice: 0,
        totalItems: 0
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        cart
      }
    });
  } catch (error) {
    next(error);
  }
};

// Add item to cart
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;
    
    // Validate product exists and is in stock
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }
    
    if (product.countInStock < quantity) {
      return res.status(400).json({
        status: 'fail',
        message: 'Not enough items in stock'
      });
    }
    
    // Find user's cart or create a new one
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
        totalPrice: 0,
        totalItems: 0
      });
    }
    
    // Check if product already exists in cart
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    
    if (itemIndex > -1) {
      // Product exists in cart, update quantity
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Product does not exist in cart, add new item
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
        name: product.name,
        image: product.featuredImage
      });
    }
    
    // Calculate totals
    cart.calculateTotals();
    
    // Save cart
    await cart.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        cart
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;
    
    // Validate quantity
    if (quantity < 1) {
      return res.status(400).json({
        status: 'fail',
        message: 'Quantity must be at least 1'
      });
    }
    
    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      return res.status(404).json({
        status: 'fail',
        message: 'Cart not found'
      });
    }
    
    // Find item in cart
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Item not found in cart'
      });
    }
    
    // Validate product is in stock
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }
    
    if (product.countInStock < quantity) {
      return res.status(400).json({
        status: 'fail',
        message: 'Not enough items in stock'
      });
    }
    
    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    
    // Calculate totals
    cart.calculateTotals();
    
    // Save cart
    await cart.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        cart
      }
    });
  } catch (error) {
    next(error);
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;
    
    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      return res.status(404).json({
        status: 'fail',
        message: 'Cart not found'
      });
    }
    
    // Remove item from cart
    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    
    // Calculate totals
    cart.calculateTotals();
    
    // Save cart
    await cart.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        cart
      }
    });
  } catch (error) {
    next(error);
  }
};

// Clear cart
exports.clearCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      return res.status(404).json({
        status: 'fail',
        message: 'Cart not found'
      });
    }
    
    // Clear cart items
    cart.items = [];
    cart.totalPrice = 0;
    cart.totalItems = 0;
    cart.appliedDiscount = null;
    
    // Save cart
    await cart.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        cart
      }
    });
  } catch (error) {
    next(error);
  }
};

// Apply discount to cart
exports.applyDiscount = async (req, res, next) => {
  try {
    const { code } = req.body;
    const userId = req.user._id;
    
    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      return res.status(404).json({
        status: 'fail',
        message: 'Cart not found'
      });
    }
    
    // Find discount
    const discount = await Discount.findOne({ code: code.toUpperCase() });
    
    if (!discount) {
      return res.status(404).json({
        status: 'fail',
        message: 'Invalid discount code'
      });
    }
    
    // Check if discount is valid
    if (!discount.isValid(req.user, cart.totalPrice)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Discount code is not valid for this order'
      });
    }
    
    // Apply discount
    if (discount.type === 'percentage') {
      cart.appliedDiscount = {
        code: discount.code,
        percentage: discount.value
      };
    } else if (discount.type === 'fixed') {
      const percentage = (discount.value / cart.totalPrice) * 100;
      cart.appliedDiscount = {
        code: discount.code,
        percentage: percentage > 100 ? 100 : percentage
      };
    }
    
    // Calculate totals
    cart.calculateTotals();
    
    // Save cart
    await cart.save();
    
    // Update discount usage
    discount.usageCount += 1;
    
    // Update user usage
    const userUsageIndex = discount.userUsage.findIndex(u => u.user.toString() === userId.toString());
    
    if (userUsageIndex > -1) {
      discount.userUsage[userUsageIndex].usageCount += 1;
      discount.userUsage[userUsageIndex].lastUsed = Date.now();
    } else {
      discount.userUsage.push({
        user: userId,
        usageCount: 1,
        lastUsed: Date.now()
      });
    }
    
    await discount.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        cart
      }
    });
  } catch (error) {
    next(error);
  }
};

// Remove discount from cart
exports.removeDiscount = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      return res.status(404).json({
        status: 'fail',
        message: 'Cart not found'
      });
    }
    
    // Remove discount
    cart.appliedDiscount = null;
    
    // Calculate totals
    cart.calculateTotals();
    
    // Save cart
    await cart.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        cart
      }
    });
  } catch (error) {
    next(error);
  }
};