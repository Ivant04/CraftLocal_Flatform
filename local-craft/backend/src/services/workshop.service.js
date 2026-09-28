const Workshop = require('../models/Workshop');
const Artisan = require('../models/Artisan');
const ApiError = require('../utils/apiError');

class WorkshopService {
  async getAllWorkshops(query = {}) {
    const filter = {};
    if (query.category) filter.category = query.category;
    if (query.artisan) filter.artisan = query.artisan;
    if (query.status) {
      filter.status = query.status;
    } else {
      filter.status = 'ACTIVE';
    }

    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
        { location: { $regex: query.search, $options: 'i' } }
      ];
    }

    return await Workshop.find(filter)
      .populate({
        path: 'artisan',
        populate: { path: 'user', select: 'name avatar phone' }
      })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });
  }

  async getWorkshopById(id) {
    const workshop = await Workshop.findById(id)
      .populate({
        path: 'artisan',
        populate: { path: 'user', select: 'name avatar phone' }
      })
      .populate('category', 'name slug');

    if (!workshop) {
      throw new ApiError(404, 'Workshop not found');
    }
    return workshop;
  }

  async createWorkshop(userId, workshopData) {
    const artisan = await Artisan.findOne({ user: userId });
    if (!artisan) {
      throw new ApiError(403, 'You must have an Artisan profile to create workshops');
    }

    const workshop = await Workshop.create({
      ...workshopData,
      artisan: artisan._id
    });

    return workshop;
  }

  async updateWorkshop(id, userId, userRole, updateData) {
    const workshop = await Workshop.findById(id);
    if (!workshop) {
      throw new ApiError(404, 'Workshop not found');
    }

    if (userRole !== 'ADMIN') {
      const artisan = await Artisan.findOne({ user: userId });
      if (!artisan || workshop.artisan.toString() !== artisan._id.toString()) {
        throw new ApiError(403, 'You are not authorized to update this workshop');
      }
    }

    const updated = await Workshop.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
    return updated;
  }

  async deleteWorkshop(id, userId, userRole) {
    const workshop = await Workshop.findById(id);
    if (!workshop) {
      throw new ApiError(404, 'Workshop not found');
    }

    if (userRole !== 'ADMIN') {
      const artisan = await Artisan.findOne({ user: userId });
      if (!artisan || workshop.artisan.toString() !== artisan._id.toString()) {
        throw new ApiError(403, 'You are not authorized to delete this workshop');
      }
    }

    await Workshop.findByIdAndDelete(id);
    return { id, message: 'Workshop deleted successfully' };
  }
}

module.exports = new WorkshopService();
