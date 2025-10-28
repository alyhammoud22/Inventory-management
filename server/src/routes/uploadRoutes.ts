import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

// Configure storage destination and filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // local folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Endpoint: /upload/photo
router.post("/photo", upload.single("photo"), (req, res) => {
  const filePath = req.file ? `/uploads/${req.file.filename}` : null;
  res.json({ url: filePath });
});

export default router;
