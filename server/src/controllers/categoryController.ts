import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.productCategory.findMany({
      include: { subcategories: true },
    });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    const newCat = await prisma.productCategory.create({ data: { name } });
    res.status(201).json(newCat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create category" });
  }
};

export const createSubCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const { name } = req.body;

  try {
    const sub = await prisma.productSubCategory.create({
      data: { name, categoryId: Number(categoryId) }, // ✅ convert to number
    });
    res.status(201).json(sub);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create sub-category" });
  }
};
