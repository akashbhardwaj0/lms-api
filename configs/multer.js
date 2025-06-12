// configs/multer.js
import multer from "multer";

// Cloudinary prefers in-memory upload
const storage = multer.memoryStorage();

const upload = multer({ storage });

export default upload;
