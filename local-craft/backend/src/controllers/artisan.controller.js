const artisanService = require('../services/artisan.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class ArtisanController {
  getAllArtisans = asyncHandler(async (req, res) => {
    const artisans = await artisanService.getAllArtisans(req.query);
    return ApiResponse.success(res, 200, 'Artisans retrieved successfully', artisans);
  });

  getArtisanById = asyncHandler(async (req, res) => {
    const artisan = await artisanService.getArtisanById(req.params.id);
    return ApiResponse.success(res, 200, 'Artisan retrieved successfully', artisan);
  });

  updateProfile = asyncHandler(async (req, res) => {
    const artisan = await artisanService.updateArtisanProfile(req.user._id, req.body);
    return ApiResponse.success(res, 200, 'Artisan profile updated successfully', artisan);
  });

  updateVerificationStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const artisan = await artisanService.updateVerificationStatus(req.params.id, status);
    return ApiResponse.success(res, 200, 'Artisan verification status updated successfully', artisan);
  });
}

module.exports = new ArtisanController();
