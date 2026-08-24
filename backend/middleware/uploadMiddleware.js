import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// multer.diskStorage lets us control WHERE files are saved and WHAT
// they're named, instead of accepting multer's random defaults.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // cb = "callback". First argument is an error (null = no error),
    // second is the value we're providing (the destination folder).
    cb(null, path.join(__dirname, "..", "uploads", "products"));
  },
  filename: (req, file, cb) => {
    // Build a unique filename so two uploads never overwrite each other:
    // fieldname-timestamp.extension, e.g. "image-1721463245123.jpg"
    const ext = path.extname(file.originalname);
    const uniqueName = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

// Only allow image files to be uploaded - reject anything else
// (e.g. someone trying to upload a .exe file disguised with an image field).
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const isValidExt = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const isValidMime = allowedTypes.test(file.mimetype);

  if (isValidExt && isValidMime) {
    cb(null, true); // accept the file
  } else {
    cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
});

export default upload;
