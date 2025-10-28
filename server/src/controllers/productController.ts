import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const search = req.query.search?.toString();
    const products = await prisma.products.findMany({
      where: search
        ? {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }
        : undefined,
      include: {
        category: true,
        unit: true,
      },
      orderBy: {
        productId: "asc",
      },
    });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving products" });
  }
};

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      nameArabic,
      price,
      stockQuantity,
      barcode,
      categoryId,
      subCategoryId,
      unitId,
      productionDate,
      expiryDate,
    } = req.body;

    // If multer processed an image
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const product = await prisma.products.create({
      data: {
        name,
        nameArabic,
        price: parseFloat(price),
        stockQuantity: parseInt(stockQuantity),
        barcode,
        categoryId: categoryId ? parseInt(categoryId) : null,
        subCategoryId: subCategoryId ? parseInt(subCategoryId) : null,
        unitId: unitId ? parseInt(unitId) : null,
        productionDate: productionDate ? new Date(productionDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        imageUrl,
      },
    });

    console.log("New product created:", product);
    if (req.file) console.log("File uploaded:", req.file.filename);

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating product" });
  }
};

export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const product = await prisma.products.findUnique({
      where: { productId: id },
      include: { category: true, unit: true },
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving product" });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const {
      name,
      nameArabic,
      price,
      stockQuantity,
      rating,
      barcode,
      productionDate,
      expiryDate,
      categoryId,
      unitId,
    } = req.body;

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updated = await prisma.products.update({
      where: { productId: id },
      data: {
        name,
        nameArabic,
        price: parseFloat(price),
        stockQuantity: parseInt(stockQuantity),
        rating: rating ? parseFloat(rating) : null,
        barcode,
        productionDate: productionDate ? new Date(productionDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        categoryId: categoryId ? parseInt(categoryId) : null,
        unitId: unitId ? parseInt(unitId) : null,
        ...(imageUrl && { imageUrl }),
      },
    });
    console.log("File:", req.file);
    console.log("Body:", req.body);

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating product" });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    await prisma.products.delete({
      where: { productId: id },
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting product" });
  }
};
