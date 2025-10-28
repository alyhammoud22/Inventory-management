import { Router } from "express";
import { upload } from "../middleware/upload";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById); // ✅ get single product
router.post("/", upload.single("image"), createProduct);
router.delete("/:id", deleteProduct); // ✅ delete product
router.put("/:id", upload.single("image"), updateProduct); // ✅ update product

export default router;
