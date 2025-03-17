const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A category must have a name'],
      trim: true,
      maxlength: [50, 'A category name cannot exceed 50 characters'],
      unique: true
    },
    slug: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: ''
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    level: {
      type: Number,
      default: 1
    },
    isActive: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  foreignField: 'parent',
  localField: '_id'
});

// Pre-find middleware to populate subcategories
categorySchema.pre(/^find/, function(next) {
  // Only populate subcategories for top-level categories
  if (this._conditions.parent === null || this._conditions.parent === undefined) {
    this.populate({
      path: 'subcategories',
      select: 'name slug image'
    });
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;