import type { UploadApiResponse } from "cloudinary";
import { cloudinaryClient, isCloudinaryConfigured } from "../config/cloudinary.js";
import { env } from "../config/env.js";
import { AppError } from "../middlewares/error.js";

export type StoredImage = {
  url: string;
  publicId: string;
  fileName: string;
};

function assertCloudinaryConfigured() {
  if (!isCloudinaryConfigured) {
    throw new AppError("Storage de imagens nao configurado.", 500, { images: "Configure as variaveis CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET." });
  }
}

export function uploadImageToCloudinary(file: Express.Multer.File): Promise<StoredImage> {
  assertCloudinaryConfigured();

  return new Promise((resolve, reject) => {
    const stream = cloudinaryClient.uploader.upload_stream(
      {
        folder: env.CLOUDINARY_FOLDER,
        resource_type: "image",
        use_filename: true,
        unique_filename: true,
        overwrite: false
      },
      (error, result?: UploadApiResponse) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary nao retornou dados do upload."));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          fileName: file.originalname
        });
      }
    );

    stream.end(file.buffer);
  });
}

export async function deleteImageFromCloudinary(publicId: string) {
  assertCloudinaryConfigured();
  await cloudinaryClient.uploader.destroy(publicId, { resource_type: "image" });
}
