import { Router } from 'express';
import { getTimeslotsByWorkshop } from '../controllers/timeslot.controller';

const router = Router();
// Public: lấy timeslots theo workshopId (dùng qua /api/workshops/:workshopId/timeslots)
router.get('/workshop/:workshopId', getTimeslotsByWorkshop);

export default router;
