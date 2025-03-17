const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

// Get all products with filtering, sorting, and pagination
exports.getAllProducts = async (req, res, next) => {
  try {
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);
    
    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    let query = Product.find(JSON.parse(queryStr));
    
    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query = query.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { brand: searchRegex },
          { keywords: searchRegex }
        ]
      });
    }
    
    // Category filtering
    if (req.query.category) {
      const category = await Category.findOne({ slug: req.query.category });
      if (category) {
        // Find all subcategories
        const subcategories = await Category.find({ parent: category._id });
        const categoryIds = [category._id, ...subcategories.map(sub => sub._id)];
        
        query = query.find({ category: { $in: categoryIds } });
      }
    }
    
    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    query = query.skip(skip).limit(limit);
    
    // Execute query
    const products = await query;
    
    // Get total count for pagination
    const totalProducts = await Product.countDocuments(JSON.parse(queryStr));
    
    res.status(200).json({
      status: 'success',
      results: products.length,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
      data: {
        products
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single product by ID or slug
exports.getProduct = async (req, res, next) => {
  try {
    let query;
    
    // Check if param is ID or slug
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      // It's an ID
      query = Product.findById(req.params.id);
    } else {
      // It's a slug
      query = Product.findOne({ slug: req.params.id });
    }
    
    // Populate reviews
    query = query.populate('reviews');
    
    const product = await query;
    
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'No product found with that ID or slug'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create new product (admin only)
exports.createProduct = async (req, res, next) => {
  try {
    const newProduct = await Product.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: {
        product: newProduct
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update product (admin only)
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'No product found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete product (admin only)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'No product found with that ID'
      });
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// Get featured products
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    
    const products = await Product.find({ isFeatured: true })
      .limit(limit)
      .sort('-createdAt');
    
    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get products on sale
exports.getProductsOnSale = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    
    const products = await Product.find({ isOnSale: true })
      .limit(limit)
      .sort('-discountPercentage');
    
    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get related products
exports.getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'No product found with that ID'
      });
    }
    
    const limit = parseInt(req.query.limit) || 4;
    
    const products = await Product.find({
      _id: { $ne: product._id },
      category: product.category
    })
      .limit(limit)
      .sort('-ratings');
    
    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get product count
exports.getProductCount = async (req, res, next) => {
  try {
    const productCount = await Product.countDocuments();
    
    res.status(200).json({
      status: 'success',
      data: {
        productCount
      }
    });
  } catch (error) {
    next(error);
  }
};