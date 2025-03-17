const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A product must have a name'],
      trim: true,
      maxlength: [100, 'A product name cannot exceed 100 characters']
    },
    slug: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      required: [true, 'A product must have a description']
    },
    richDescription: {
      type: String,
      default: ''
    },
    brand: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      required: [true, 'A product must have a price'],
      min: [0, 'Price must be above 0']
    },
    originalPrice: {
      type: Number,
      default: 0
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    countInStock: {
      type: Number,
      required: [true, 'A product must have a stock count'],
      min: [0, 'Stock count must be above or equal to 0'],
      default: 0
    },
    sold: {
      type: Number,
      default: 0
    },
    images: [
      {
        type: String
      }
    ],
    featuredImage: {
      type: String,
      required: true
    },
    ratings: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be above or equal to 0'],
      max: [5, 'Rating must be below or equal to 5'],
      set: val => Math.round(val * 10) / 10 // Round to 1 decimal place
    },
    numReviews: {
      type: Number,
      default: 0
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isOnSale: {
      type: Boolean,
      default: false
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Discount percentage must be above or equal to 0'],
      max: [100, 'Discount percentage must be below or equal to 100']
    },
    isPrime: {
      type: Boolean,
      default: false
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      weight: Number,
      unit: {
        type: String,
        enum: ['cm', 'in'],
        default: 'cm'
      },
      weightUnit: {
        type: String,
        enum: ['kg', 'lb'],
        default: 'kg'
      }
    },
    specifications: [
      {
        key: String,
        value: String
      }
    ],
    keywords: [String],
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id'
});

// Calculate current price based on original price and discount
productSchema.virtual('currentPrice').get(function() {
  if (this.isOnSale && this.discountPercentage > 0) {
    return this.price - (this.price * (this.discountPercentage / 100));
  }
  return this.price;
});

// Update ratings when a review is added or updated
productSchema.statics.calcAverageRatings = async function(productId) {
  const stats = await this.model('Review').aggregate([
    {
      $match: { product: productId }
    },
    {
      $group: {
        _id: '$product',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await this.findByIdAndUpdate(productId, {
      numReviews: stats[0].nRating,
      ratings: stats[0].avgRating
    });
  } else {
    await this.findByIdAndUpdate(productId, {
      numReviews: 0,
      ratings: 0
    });
  }
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;