import express from "express";
import {
  getAllCategories,
  createCategory,
  createSubCategory,
} from "../controllers/categoryController";

const router = express.Router();

router.get("/", getAllCategories);
router.post("/", createCategory);
router.post("/:categoryId/subcategory", createSubCategory);

export default router;
