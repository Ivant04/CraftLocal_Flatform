import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/apiResponse';
import Product from '../models/product.model';
import Category from '../models/category.model';

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const resolveCategoryId = async (catInput?: string) => {
  if (catInput) {
    const trimmed = catInput.trim();
    if (mongoose.Types.ObjectId.isValid(trimmed)) {
      const found = await Category.findById(trimmed);
      if (found) return found._id;
    }
    const foundByName = await Category.findOne({
      $or: [
        { slug: trimmed.toLowerCase() },
        { name: new RegExp(`^${escapeRegex(trimmed)}$`, 'i') },
      ],
    });
    if (foundByName) return foundByName._id;
  }
  const fallback = await Category.findOne({ status: 'ACTIVE' });
  return fallback?._id;
};

const PRODUCT_SORT_MAP: Record<string, string> = {
  popular: '-sold -averageRating',
  rating: '-averageRating -totalReviews',
  'price-asc': 'price',
  'price-desc': '-price',
};

// PUBLIC
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const { category, search, page = '1', limit = '12', sort = '-createdAt' } = req.query;
  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit as string, 10) || 12);
  const filter: any = { status: 'ACTIVE' };

  if (typeof category === 'string' && category.trim()) {
    const trimmedCat = category.trim();
    if (mongoose.Types.ObjectId.isValid(trimmedCat)) {
      filter.categoryId = trimmedCat;
    } else {
      const catDoc = await Category.findOne({
        $or: [
          { slug: trimmedCat.toLowerCase() },
          { name: new RegExp(`^${escapeRegex(trimmedCat)}$`, 'i') },
        ],
      });
      if (!catDoc) {
        return sendSuccess(res, 'Lấy danh sách sản phẩm', { products: [], total: 0, page: pageNum });
      }
      filter.categoryId = catDoc._id;
    }
  }

  if (typeof search === 'string' && search.trim()) {
    const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { shortDescription: searchRegex },
      { origin: searchRegex },
      { material: searchRegex },
    ];
  }

  const sortExpr = typeof sort === 'string' ? (PRODUCT_SORT_MAP[sort] || sort) : '-createdAt';
  const skip = (pageNum - 1) * limitNum;
  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('hostId', 'fullName avatar hostProfile.workshopName hostProfile.ownerName hostProfile.businessAddress.city hostProfile.businessAddress.province hostProfile.businessAddress.fullAddress')
      .populate('categoryId', 'name slug icon')
      .skip(skip)
      .limit(limitNum)
      .sort(sortExpr),
    Product.countDocuments(filter),
  ]);

  sendSuccess(res, 'Lấy danh sách sản phẩm', { products, total, page: pageNum });
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findOne({ _id: req.params.id, status: { $ne: 'DELETED' } })
    .populate('hostId', 'fullName avatar hostProfile.workshopName hostProfile.ownerName hostProfile.businessAddress.city hostProfile.businessAddress.province hostProfile.businessAddress.fullAddress')
    .populate('categoryId', 'name slug icon');
  if (!product) return sendError(res, 'Sản phẩm không tồn tại', 404);
  sendSuccess(res, 'Lấy thông tin sản phẩm', product);
});

// HOST
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId, category, name, images, thumbnail, status, ...rest } = req.body;
  const resolvedCategoryId = await resolveCategoryId(categoryId || category);
  if (!resolvedCategoryId) {
    return sendError(res, 'Danh mục không tồn tại', 400);
  }

  const finalImages = Array.isArray(images) && images.length > 0 ? images : [];
  const product = await Product.create({
    ...rest,
    name,
    slug: `${slugify(name)}-${Date.now()}`,
    hostId: req.user!._id,
    categoryId: resolvedCategoryId,
    images: finalImages,
    thumbnail: thumbnail || finalImages[0],
    status: status === 'INACTIVE' ? 'HIDDEN' : status || 'ACTIVE',
  });
  const populated = await Product.findById(product._id).populate('categoryId', 'name slug icon');
  sendSuccess(res, 'Tạo sản phẩm thành công', populated || product, 201);
});

export const getMyProducts = asyncHandler(async (req: Request, res: Response) => {
  const products = await Product.find({ hostId: req.user!._id, status: { $ne: 'DELETED' } })
    .populate('categoryId', 'name slug icon')
    .sort({ createdAt: -1 });
  sendSuccess(res, 'Lấy danh sách sản phẩm', products);
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId, category, name, images, status, ...rest } = req.body;
  const updateData: any = { ...rest };

  if (name) {
    updateData.name = name;
    updateData.slug = `${slugify(name)}-${Date.now()}`;
  }
  if (categoryId || category) {
    const resolvedCategoryId = await resolveCategoryId(categoryId || category);
    if (resolvedCategoryId) updateData.categoryId = resolvedCategoryId;
  }
  if (images !== undefined) {
    updateData.images = images;
    if (Array.isArray(images) && images.length > 0 && !updateData.thumbnail) {
      updateData.thumbnail = images[0];
    }
  }
  if (status) {
    updateData.status = status === 'INACTIVE' ? 'HIDDEN' : status;
  }

  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, hostId: req.user!._id },
    updateData,
    { new: true, runValidators: true }
  ).populate('categoryId', 'name slug icon');
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
