import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";
import { AppError } from "./error.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const uploadRoot = path.resolve(__dirname, "../../public/uploads/nexusplay");

fs.mkdirSync(uploadRoot, { recursive: true });

const allowed = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export const productImageUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadRoot),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    }
  }),
  limits: { files: 3, fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowed.has(file.mimetype)) {
      return cb(new AppError("Formato de imagem inválido", 400, { images: "Envie imagens jpg, jpeg, png ou webp." }));
    }
    cb(null, true);
  }
});
