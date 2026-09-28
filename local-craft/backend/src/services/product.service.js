const Product = require('../models/Product');
const Artisan = require('../models/Artisan');
const ApiError = require('../utils/apiError');

class ProductService {
  async getAllProducts(query = {}) {
    const filter = {};
    if (query.category) filter.category = query.category;
    if (query.artisan) filter.artisan = query.artisan;
    if (query.status) {
      filter.status = query.status;
    } else {
      filter.status = 'ACTIVE';
    }

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } }
      ];
    }

    return await Product.find(filter)
      .populate({
        path: 'artisan',
        populate: { path: 'user', select: 'name avatar' }
      })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });
  }

  async getProductById(id) {
    const product = await Product.findById(id)
      .populate({
        path: 'artisan',
        populate: { path: 'user', select: 'name avatar phone' }
      })
      .populate('category', 'name slug');

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    return product;
  }

  async createProduct(userId, productData) {
    const artisan = await Artisan.findOne({ user: userId });
    if (!artisan) {
      throw new ApiError(403, 'You must have an Artisan profile to create products');
    }

    const product = await Product.create({
      ...productData,
      artisan: artisan._id
    });

    return product;
  }

  async updateProduct(id, userId, userRole, updateData) {
    const product = await Product.findById(id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    if (userRole !== 'ADMIN') {
      const artisan = await Artisan.findOne({ user: userId });
      if (!artisan || product.artisan.toString() !== artisan._id.toString()) {
        throw new ApiError(403, 'You are not authorized to update this product');
      }
    }

    const updated = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
    return updated;
  }

  async deleteProduct(id, userId, userRole) {
    const product = await Product.findById(id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    if (userRole !== 'ADMIN') {
      const artisan = await Artisan.findOne({ user: userId });
      if (!artisan || product.artisan.toString() !== artisan._id.toString()) {
        throw new ApiError(403, 'You are not authorized to delete this product');
      }
    }

    await Product.findByIdAndDelete(id);
    return { id, message: 'Product deleted successfully' };
  }
}

module.exports = new ProductService();
