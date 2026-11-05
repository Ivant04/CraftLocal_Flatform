import { Router } from "express";
import {
  createReview,
  getWorkshopReviews,
  replyReview,
} from "../controllers/review.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createReviewSchema } from "../validations/review.validation";

const router = Router();

router.get("/workshop/:workshopId", getWorkshopReviews);
router.post(
  "/",
  authMiddleware,
  roleMiddleware("TOURIST"),
  validate(createReviewSchema),
  createReview,
);
router.put("/:id/reply", authMiddleware, roleMiddleware("HOST"), replyReview);

export default router;
