import type { UploadApiResponse } from "cloudinary";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { cloudinaryClient, isCloudinaryConfigured } from "../config/cloudinary.js";
import { env } from "../config/env.js";
import { AppError } from "../middlewares/error.js";
import { uploadRoot } from "../middlewares/upload.js";

export type StoredImage = {
  url: string;
  publicId: string;
  fileName: string;
};

function assertCloudinaryConfigured() {
  if (!isCloudinaryConfigured) {
    throw new AppError("Falha ao enviar imagem.", 500, { images: "Configure Cloudinary em producao ou rode localmente em ambiente de desenvolvimento." });
  }
}

async function saveImageLocally(file: Express.Multer.File): Promise<StoredImage> {
  const extension = path.extname(file.originalname).toLowerCase() || ".png";
  const safeName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  await fs.mkdir(uploadRoot, { recursive: true });
  await fs.writeFile(path.join(uploadRoot, safeName), file.buffer);

  return {
    url: `/uploads/${safeName}`,
    publicId: `local:${safeName}`,
    fileName: file.originalname
  };
}

export function uploadImageToCloudinary(file: Express.Multer.File): Promise<StoredImage> {
  if (!isCloudinaryConfigured && env.NODE_ENV !== "production") {
    return saveImageLocally(file);
  }

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
  if (publicId.startsWith("local:") && env.NODE_ENV !== "production") {
    await fs.rm(path.join(uploadRoot, publicId.replace("local:", "")), { force: true });
    return;
  }

  assertCloudinaryConfigured();
  await cloudinaryClient.uploader.destroy(publicId, { resource_type: "image" });
}
