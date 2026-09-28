const productService = require('../services/product.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class ProductController {
  getAllProducts = asyncHandler(async (req, res) => {
    const products = await productService.getAllProducts(req.query);
    return ApiResponse.success(res, 200, 'Products retrieved successfully', products);
  });

  getProductById = asyncHandler(async (req, res) => {
    const product = await productService.getProductById(req.params.id);
    return ApiResponse.success(res, 200, 'Product retrieved successfully', product);
  });

  createProduct = asyncHandler(async (req, res) => {
    const product = await productService.createProduct(req.user._id, req.body);
    return ApiResponse.success(res, 201, 'Product created successfully', product);
  });

  updateProduct = asyncHandler(async (req, res) => {
    const product = await productService.updateProduct(
      req.params.id,
      req.user._id,
      req.user.role,
      req.body
    );
    return ApiResponse.success(res, 200, 'Product updated successfully', product);
  });

  deleteProduct = asyncHandler(async (req, res) => {
    const result = await productService.deleteProduct(req.params.id, req.user._id, req.user.role);
    return ApiResponse.success(res, 200, 'Product deleted successfully', result);
  });
}

module.exports = new ProductController();
