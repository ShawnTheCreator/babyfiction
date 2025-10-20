import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { createError } from '../utils/errorUtils.js';

const maxSize = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxSize },
});

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(createError('No file provided', 400));
    }

    const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'babyfictions/products';

    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder, resource_type: 'image' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

    const result = await streamUpload();

    return res.status(201).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (err) {
    next(err);
  }
};
