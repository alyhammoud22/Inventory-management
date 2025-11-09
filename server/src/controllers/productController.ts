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
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                nameArabic: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : undefined,
      include: {
        category: true,
        unit: true,
        prices: true,
      },
      orderBy: {
        productId: "asc",
      },
    });

    // Debugging: log one sample to verify Arabic field is returned
    if (products.length > 0) {
      console.log("Sample product:", {
        name: products[0].name,
        nameArabic: products[0].nameArabic,
      });
    }

    res.json(products);
    console.log(
      products.map((p) => ({
        id: p.productId,
        name: p.name,
        nameArabic: p.nameArabic,
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving products" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    let {
      name,
      nameArabic,
      barcode,
      rating,
      stockQuantity,
      productionDate,
      expiryDate,
      categoryId,
      subCategoryId,
      unitId,
      prices,
    } = req.body;

    // 🧠 Parse prices if sent as JSON string
    if (typeof prices === "string") {
      try {
        prices = JSON.parse(prices);
      } catch (err) {
        console.error("❌ Failed to parse prices JSON:", err);
        return res.status(400).json({
          error: "Invalid format for prices. Expected JSON array.",
        });
      }
    }

    // ✅ Validate prices structure
    if (!Array.isArray(prices)) {
      prices = [];
    }

    // ✅ Ensure each price has valid data
    const validPrices = prices
      .filter((p: any) => p && p.name && !isNaN(parseFloat(p.value)))
      .map((p: any) => ({
        name: p.name,
        value: parseFloat(p.value),
      }));

    if (prices.length > 0 && validPrices.length === 0) {
      return res
        .status(400)
        .json({ error: "All price entries are invalid or empty." });
    }

    // 🖼 Handle image upload
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // 💾 Create product
    const newProduct = await prisma.products.create({
      data: {
        name,
        nameArabic,
        barcode,
        rating: rating ? parseFloat(rating) : null,
        stockQuantity: parseInt(stockQuantity, 10) || 0,
        productionDate: productionDate ? new Date(productionDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        subCategoryId: subCategoryId ? parseInt(subCategoryId, 10) : null,
        unitId: unitId ? parseInt(unitId, 10) : null,
        imageUrl,
        prices:
          validPrices.length > 0
            ? {
                create: validPrices,
              }
            : undefined,
      },
      include: {
        prices: true,
      },
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("❌ Error creating product:", error);
    res.status(500).json({
      error: "Error creating product. Please check your input and try again.",
    });
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
      include: { category: true, unit: true, prices: true },
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

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let {
      name,
      nameArabic,
      barcode,
      rating,
      stockQuantity,
      productionDate,
      expiryDate,
      categoryId,
      subCategoryId,
      unitId,
      prices,
    } = req.body;

    // Handle image upload
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    // ✅ Parse prices if it's a JSON string
    if (typeof prices === "string") {
      try {
        prices = JSON.parse(prices);
      } catch (err) {
        console.warn("⚠️ Failed to parse prices JSON:", err);
        prices = [];
      }
    }

    // ✅ Ensure prices is an array
    if (!Array.isArray(prices)) {
      prices = [];
    }

    // ✅ Update the main product
    const updatedProduct = await prisma.products.update({
      where: { productId: parseInt(id, 10) },
      data: {
        name,
        nameArabic,
        barcode,
        rating: rating ? parseFloat(rating) : null,
        stockQuantity: (() => {
          const currentStock = parseInt(stockQuantity ?? "0", 10);
          const enteredAmount = parseInt(req.body.enteredAmount ?? "0", 10);
          return currentStock + (isNaN(enteredAmount) ? 0 : enteredAmount);
        })(),

        productionDate: productionDate ? new Date(productionDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        subCategoryId: subCategoryId ? parseInt(subCategoryId, 10) : null,
        unitId: unitId ? parseInt(unitId, 10) : null,
        ...(imageUrl && { imageUrl }),
      },
    });

    // ✅ Replace product prices safely
    await prisma.productPrice.deleteMany({
      where: { productId: updatedProduct.productId },
    });

    if (prices.length > 0) {
      await prisma.productPrice.createMany({
        data: prices
          .filter((p: any) => p.label && p.amount) // filter out empty ones
          .map((p: any) => ({
            productId: updatedProduct.productId,
            name: p.label ?? p.name ?? "Unnamed Price",
            value: parseFloat(p.amount ?? p.value ?? 0),
          })),
      });
    }

    // ✅ Fetch and return updated product with prices
    const productWithPrices = await prisma.products.findUnique({
      where: { productId: updatedProduct.productId },
      include: { prices: true },
    });

    res.status(200).json(productWithPrices);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Error updating product" });
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
