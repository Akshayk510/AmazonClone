const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Discount must have a code'],
      unique: true,
      uppercase: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Discount must have a description']
    },
    type: {
      type: String,
      required: true,
      enum: ['percentage', 'fixed', 'shipping']
    },
    value: {
      type: Number,
      required: true,
      min: [0, 'Discount value must be positive']
    },
    minPurchase: {
      type: Number,
      default: 0
    },
    maxDiscount: {
      type: Number,
      default: null
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    usageLimit: {
      type: Number,
      default: null
    },
    usageCount: {
      type: Number,
      default: 0
    },
    perUserLimit: {
      type: Number,
      default: null
    },
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],
    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
      }
    ],
    excludedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],
    userRestriction: {
      type: String,
      enum: ['all', 'new', 'existing'],
      default: 'all'
    },
    userUsage: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        usageCount: {
          type: Number,
          default: 1
        },
        lastUsed: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Check if discount is valid
discountSchema.methods.isValid = function(user, cartTotal) {
  const now = new Date();
  
  // Check if discount is active
  if (!this.isActive) return false;
  
  // Check if discount is within date range
  if (now < this.startDate || now > this.endDate) return false;
  
  // Check if discount has reached usage limit
  if (this.usageLimit !== null && this.usageCount >= this.usageLimit) return false;
  
  // Check if cart total meets minimum purchase requirement
  if (cartTotal < this.minPurchase) return false;
  
  // Check user restriction
  if (user && this.userRestriction !== 'all') {
    const userCreatedAt = new Date(user.createdAt);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    if (this.userRestriction === 'new' && userCreatedAt < oneMonthAgo) return false;
    if (this.userRestriction === 'existing' && userCreatedAt >= oneMonthAgo) return false;
  }
  
  // Check per user limit
  if (user && this.perUserLimit !== null) {
    const userUsage = this.userUsage.find(u => u.user.toString() === user._id.toString());
    if (userUsage && userUsage.usageCount >= this.perUserLimit) return false;
  }
  
  return true;
};

// Calculate discount amount
discountSchema.methods.calculateDiscount = function(cartTotal, items) {
  let discountAmount = 0;
  
  if (this.type === 'percentage') {
    discountAmount = cartTotal * (this.value / 100);
    
    // Apply max discount if set
    if (this.maxDiscount !== null && discountAmount > this.maxDiscount) {
      discountAmount = this.maxDiscount;
    }
  } else if (this.type === 'fixed') {
    discountAmount = this.value;
    
    // Ensure discount doesn't exceed cart total
    if (discountAmount > cartTotal) {
      discountAmount = cartTotal;
    }
  } else if (this.type === 'shipping') {
    // Shipping discount is handled separately
    discountAmount = 0;
  }
  
  return discountAmount;
};

const Discount = mongoose.model('Discount', discountSchema);

module.exports = Discount;