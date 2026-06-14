import multer from "multer";
import { AppError } from "./error.js";

const allowedMimeTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export const productImageMemoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 3, fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new AppError("Formato de imagem inválido", 400, { images: "Envie imagens jpg, jpeg, png ou webp." }));
      return;
    }

    cb(null, true);
  }
});
