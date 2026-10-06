import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/apiResponse';
import Product from '../models/product.model';

// PUBLIC
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const { category, search, page = '1', limit = '12', sort = '-createdAt' } = req.query;
  const filter: any = { status: 'ACTIVE' };
  if (category) filter.category = category;
  if (search) filter.$text = { $search: search as string };

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const products = await Product.find(filter)
    .populate('hostId', 'fullName hostProfile.workshopName')
    .skip(skip).limit(parseInt(limit as string)).sort(sort as string);
  const total = await Product.countDocuments(filter);

  sendSuccess(res, 'Lấy danh sách sản phẩm', { products, total, page: parseInt(page as string) });
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findOne({ _id: req.params.id, status: { $ne: 'DELETED' } })
    .populate('hostId', 'fullName avatar hostProfile.workshopName');
  if (!product) return sendError(res, 'Sản phẩm không tồn tại', 404);
  sendSuccess(res, 'Lấy thông tin sản phẩm', product);
});

// HOST
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.create({ ...req.body, hostId: req.user!._id });
  sendSuccess(res, 'Tạo sản phẩm thành công', product, 201);
});

export const getMyProducts = asyncHandler(async (req: Request, res: Response) => {
  const products = await Product.find({ hostId: req.user!._id, status: { $ne: 'DELETED' } }).sort({ createdAt: -1 });
  sendSuccess(res, 'Lấy danh sách sản phẩm', products);
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, hostId: req.user!._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!product) return sendError(res, 'Sản phẩm không tồn tại', 404);
  sendSuccess(res, 'Cập nhật sản phẩm thành công', product);
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, hostId: req.user!._id },
    { status: 'DELETED' },
    { new: true }
  );
  if (!product) return sendError(res, 'Sản phẩm không tồn tại', 404);
  sendSuccess(res, 'Xóa sản phẩm thành công');
});
