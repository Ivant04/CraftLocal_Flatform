const express = require('express');
const router = express.Router();
const workshopController = require('../controllers/workshop.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.get('/', workshopController.getAllWorkshops);
router.get('/:id', workshopController.getWorkshopById);
router.post('/', authenticate, authorize('ARTISAN', 'ADMIN'), workshopController.createWorkshop);
router.put('/:id', authenticate, authorize('ARTISAN', 'ADMIN'), workshopController.updateWorkshop);
router.delete('/:id', authenticate, authorize('ARTISAN', 'ADMIN'), workshopController.deleteWorkshop);

module.exports = router;
