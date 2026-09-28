const categoryService = require('../services/category.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class CategoryController {
  getAllCategories = asyncHandler(async (req, res) => {
    const categories = await categoryService.getAllCategories(req.query);
    return ApiResponse.success(res, 200, 'Categories retrieved successfully', categories);
  });

  getCategoryById = asyncHandler(async (req, res) => {
    const category = await categoryService.getCategoryById(req.params.id);
    return ApiResponse.success(res, 200, 'Category retrieved successfully', category);
  });

  createCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.createCategory(req.body);
    return ApiResponse.success(res, 201, 'Category created successfully', category);
  });

  updateCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    return ApiResponse.success(res, 200, 'Category updated successfully', category);
  });

  deleteCategory = asyncHandler(async (req, res) => {
    const result = await categoryService.deleteCategory(req.params.id);
    return ApiResponse.success(res, 200, 'Category deleted successfully', result);
  });
}

module.exports = new CategoryController();
