const Artisan = require('../models/Artisan');
const ApiError = require('../utils/apiError');

class ArtisanService {
  async getAllArtisans(query = {}) {
    const filter = {};
    if (query.verificationStatus) {
      filter.verificationStatus = query.verificationStatus;
    }
    return await Artisan.find(filter)
      .populate('user', 'name email phone avatar')
      .sort({ rating: -1, createdAt: -1 });
  }

  async getArtisanById(id) {
    const artisan = await Artisan.findById(id).populate('user', 'name email phone avatar');
    if (!artisan) {
      throw new ApiError(404, 'Artisan not found');
    }
    return artisan;
  }

  async getArtisanByUserId(userId) {
    const artisan = await Artisan.findOne({ user: userId }).populate('user', 'name email phone avatar');
    if (!artisan) {
      throw new ApiError(404, 'Artisan profile not found for this user');
    }
    return artisan;
  }

  async updateArtisanProfile(userId, updateData) {
    const allowed = ['studioName', 'bio', 'craftSpecialty', 'experienceYears', 'workshopAddress', 'socialLinks'];
    const filteredUpdate = {};
    for (const key of allowed) {
      if (updateData[key] !== undefined) {
        filteredUpdate[key] = updateData[key];
      }
    }

    const artisan = await Artisan.findOneAndUpdate({ user: userId }, filteredUpdate, {
      new: true,
      runValidators: true
    }).populate('user', 'name email phone avatar');

    if (!artisan) {
      throw new ApiError(404, 'Artisan profile not found');
    }
    return artisan;
  }

  async updateVerificationStatus(artisanId, status) {
    const artisan = await Artisan.findByIdAndUpdate(
      artisanId,
      { verificationStatus: status },
      { new: true }
    );
    if (!artisan) {
      throw new ApiError(404, 'Artisan not found');
    }
    return artisan;
  }
}

module.exports = new ArtisanService();
