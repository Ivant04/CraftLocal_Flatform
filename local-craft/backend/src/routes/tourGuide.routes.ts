import { Router } from "express";
import {
  getProfile,
  getSchedules,
  getCustomers,
  checkIn,
  startTimeslot,
  finishTimeslot,
  getDashboard,
} from "../controllers/tourGuide.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = Router();

// Check-in cho phép cả TOUR_GUIDE, HOST và ADMIN
router.post(
  "/check-in",
  authMiddleware,
  roleMiddleware("TOUR_GUIDE", "HOST", "ADMIN"),
  checkIn
);

// Các route quản lý lịch trình dành riêng cho TOUR_GUIDE
router.use(authMiddleware, roleMiddleware("TOUR_GUIDE"));

router.get("/profile", getProfile);
router.get("/dashboard", getDashboard);
router.get("/schedules", getSchedules);
router.get("/timeslots/:id/customers", getCustomers);
router.put("/timeslots/:id/start", startTimeslot);
router.put("/timeslots/:id/finish", finishTimeslot);

export default router;
