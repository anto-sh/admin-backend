import multer, { StorageEngine } from "multer";
import path from "path";
import { IMAGE_UPLOAD_DIR_NAME } from "./constants";

const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(
      null,
      path.join(__dirname, `../../../uploads/${IMAGE_UPLOAD_DIR_NAME}`)
    );
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const uploadImage = multer({ storage });

export default uploadImage;
