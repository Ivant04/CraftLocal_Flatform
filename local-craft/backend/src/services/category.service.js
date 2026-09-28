const Category = require('../models/Category');
const ApiError = require('../utils/apiError');

class CategoryService {
  async getAllCategories(query = {}) {
    const filter = {};
    if (query.type) {
      filter.$or = [{ type: query.type }, { type: 'BOTH' }];
    }
    return await Category.find(filter).sort({ name: 1 });
  }

  async getCategoryById(id) {
    const category = await Category.findById(id);
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }
    return category;
  }

  async createCategory(categoryData) {
    const existing = await Category.findOne({
      $or: [{ name: categoryData.name }, { slug: categoryData.slug }]
    });
    if (existing) {
      throw new ApiError(409, 'Category with this name or slug already exists');
    }
    return await Category.create(categoryData);
  }

  async updateCategory(id, updateData) {
    const category = await Category.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }
    return category;
  }

  async deleteCategory(id) {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }
    return category;
  }
}

module.exports = new CategoryService();
