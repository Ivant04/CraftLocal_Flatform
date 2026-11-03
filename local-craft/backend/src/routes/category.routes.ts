import { Router, Request, Response } from 'express';
import Category from '../models/category.model';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const filter: any = { status: 'ACTIVE' };
  if (req.query.type) filter.type = { $in: [req.query.type, 'BOTH'] };
  const categories = await Category.find(filter).sort({ displayOrder: 1 });
  sendSuccess(res, 'Lấy danh mục thành công', categories);
}));

export default router;
