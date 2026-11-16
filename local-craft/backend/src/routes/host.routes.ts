import { Router } from 'express';
import {
  getDashboard,
  createTourGuide,
  inviteTourGuide,
  getTourGuides,
  getTourGuideDetail,
  updateTourGuide,
  deleteTourGuide,
  getOrders,
  updateOrderStatus,
} from '../controllers/host.controller';
import { createWorkshop, getMyWorkshops, updateWorkshop, deleteWorkshop } from '../controllers/workshop.controller';
import { createProduct, getMyProducts, updateProduct, deleteProduct } from '../controllers/product.controller';
import { createTimeslot, getMyTimeslots, updateTimeslot, deleteTimeslot, assignGuide } from '../controllers/timeslot.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createWorkshopSchema, updateWorkshopSchema } from '../validations/workshop.validation';
import { createProductSchema, updateProductSchema } from '../validations/product.validation';
import { createTimeslotSchema, updateTimeslotSchema } from '../validations/timeslot.validation';

const router = Router();
router.use(authMiddleware, roleMiddleware('HOST'));

// Dashboard
router.get('/dashboard', getDashboard);

// Workshops
router.post('/workshops', validate(createWorkshopSchema), createWorkshop);
router.get('/workshops', getMyWorkshops);
router.put('/workshops/:id', validate(updateWorkshopSchema), updateWorkshop);
router.delete('/workshops/:id', deleteWorkshop);

// Products
router.post('/products', validate(createProductSchema), createProduct);
router.get('/products', getMyProducts);
router.put('/products/:id', validate(updateProductSchema), updateProduct);
router.delete('/products/:id', deleteProduct);

// Timeslots
router.post('/timeslots', validate(createTimeslotSchema), createTimeslot);
router.get('/timeslots', getMyTimeslots);
router.put('/timeslots/:id', validate(updateTimeslotSchema), updateTimeslot);
router.delete('/timeslots/:id', deleteTimeslot);
router.put('/timeslots/:id/assign-guide', assignGuide);

// Tour Guides
router.post('/tour-guides', createTourGuide);
router.post('/tour-guides/invite', inviteTourGuide);
router.get('/tour-guides', getTourGuides);
router.get('/tour-guides/:id', getTourGuideDetail);
router.put('/tour-guides/:id', updateTourGuide);
router.delete('/tour-guides/:id', deleteTourGuide);

// Orders
router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);

export default router;
