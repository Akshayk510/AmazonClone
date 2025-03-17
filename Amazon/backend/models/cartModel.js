const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1
        },
        price: {
          type: Number,
          required: true
        },
        name: {
          type: String,
          required: true
        },
        image: {
          type: String,
          required: true
        }
      }
    ],
    totalPrice: {
      type: Number,
      required: true,
      default: 0
    },
    totalItems: {
      type: Number,
      required: true,
      default: 0
    },
    appliedDiscount: {
      code: String,
      percentage: Number,
      amount: Number
    }
  },
  {
    timestamps: true
  }
);

// Pre-find middleware to populate products
cartSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'items.product',
    select: 'name price images countInStock'
  });
  
  next();
});

// Calculate total price and items
cartSchema.methods.calculateTotals = function() {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  
  let subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Apply discount if any
  if (this.appliedDiscount && this.appliedDiscount.percentage > 0) {
    const discountAmount = subtotal * (this.appliedDiscount.percentage / 100);
    this.appliedDiscount.amount = discountAmount;
    this.totalPrice = subtotal - discountAmount;
  } else {
    this.totalPrice = subtotal;
    if (this.appliedDiscount) {
      this.appliedDiscount.amount = 0;
    }
  }
  
  return this;
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;