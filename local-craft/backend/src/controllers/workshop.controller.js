const workshopService = require('../services/workshop.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class WorkshopController {
  getAllWorkshops = asyncHandler(async (req, res) => {
    const workshops = await workshopService.getAllWorkshops(req.query);
    return ApiResponse.success(res, 200, 'Workshops retrieved successfully', workshops);
  });

  getWorkshopById = asyncHandler(async (req, res) => {
    const workshop = await workshopService.getWorkshopById(req.params.id);
    return ApiResponse.success(res, 200, 'Workshop retrieved successfully', workshop);
  });

  createWorkshop = asyncHandler(async (req, res) => {
    const workshop = await workshopService.createWorkshop(req.user._id, req.body);
    return ApiResponse.success(res, 201, 'Workshop created successfully', workshop);
  });

  updateWorkshop = asyncHandler(async (req, res) => {
    const workshop = await workshopService.updateWorkshop(
      req.params.id,
      req.user._id,
      req.user.role,
      req.body
    );
    return ApiResponse.success(res, 200, 'Workshop updated successfully', workshop);
  });

  deleteWorkshop = asyncHandler(async (req, res) => {
    const result = await workshopService.deleteWorkshop(req.params.id, req.user._id, req.user.role);
    return ApiResponse.success(res, 200, 'Workshop deleted successfully', result);
  });
}

module.exports = new WorkshopController();
