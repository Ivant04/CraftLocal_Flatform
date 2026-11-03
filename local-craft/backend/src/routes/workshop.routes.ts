import { Router, Request, Response } from 'express';
import Timeslot from '../models/timeslot.model';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { getWorkshops, getWorkshopById } from '../controllers/workshop.controller';

const router = Router();
router.get('/', getWorkshops);
router.get('/:id', getWorkshopById);

// GET /api/workshops/:id/timeslots
router.get('/:id/timeslots', asyncHandler(async (req: Request, res: Response) => {
  const timeslots = await Timeslot.find({ workshopId: req.params.id, status: { $in: ['AVAILABLE', 'FULL'] } })
    .populate('tourGuideId', 'fullName phone')
    .sort({ startTime: 1 });
  sendSuccess(res, 'Lấy timeslots thành công', timeslots);
}));

export default router;
