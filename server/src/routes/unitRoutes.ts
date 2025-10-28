import express from "express";
import { getAllUnits, createUnit } from "../controllers/unitController";

const router = express.Router();

router.get("/", getAllUnits);
router.post("/", createUnit);

export default router;
