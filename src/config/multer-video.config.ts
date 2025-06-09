import multer, { StorageEngine } from "multer";
import path from "path";
import { VIDEO_UPLOAD_DIR_NAME } from "./constants";

const videoStorage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, `../../../uploads/${VIDEO_UPLOAD_DIR_NAME}`));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
  fileFilter: (req, file, cb) => {
    // Пропускаем только видеофайлы
    if (!file.originalname.match(/\.(mp4|mkv|webm|mov|avi)$/i)) {
      return cb(new Error("Разрешены только видеофайлы!"));
    }
    cb(null, true);
  },
});

export default uploadVideo;
