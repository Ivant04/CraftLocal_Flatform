import { Router, Request, Response } from 'express';
import { upload } from '../middlewares/upload.middleware';
import cloudinary from '../config/cloudinary';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/', upload.single('image'), asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
        return sendError(res, 'Vui lòng chọn file tải lên', 400);
    }

    const uploadStream = () =>
        new Promise<any>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'craftlocal' },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            stream.end(req.file!.buffer);
        });

    try {
        const result = await uploadStream();
        sendSuccess(res, 'Tải ảnh lên thành công', { url: result.secure_url });
    } catch (err: any) {
        sendError(res, `Lỗi tải ảnh lên Cloudinary: ${err.message}`, 500);
    }
}));

export default router;